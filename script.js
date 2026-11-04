// ----- data -----
const baseUrl = `https://api.openweathermap.org/data/2.5/weather`;
const baseUrl2 = `https://api.openweathermap.org/data/2.5/forecast`;

// ----- elements -----
const todayLocation = document.getElementById("today-location");
const todayTemp = document.getElementById("today-temp");
const todayBottom = document.getElementById("today-bottom");
const bottomLeft = document.getElementById("bottom-left");
const bottomRight = document.getElementById("bottom-right");

const forecast = document.getElementById("forecast");

const searchForm = document.getElementById("search-form");
const input = document.getElementById("search-input");
const statusEl = document.getElementById("status");


// ----- functions -----
async function todayFetch(city) {
    const response = await fetch(`${baseUrl}?q=${city}&appid=${apiKey}`);
    const data = await response.json();

    if (!response.ok) {
        errorMessage();
    }

    showToday(data);
    return data;
}


function showToday(today) {
    todayLocation.replaceChildren();
    todayTemp.replaceChildren();
    bottomLeft.replaceChildren();
    bottomRight.replaceChildren();

    const city = document.createElement("p");
    city.classList.add("city-name");
    city.textContent = today.name;

    const country = document.createElement("p");
    country.classList.add("country-name")
    country.textContent = today.sys.country;

    const todayDate = document.createElement("p");
    todayDate.classList.add("today-date");
    todayDate.textContent = `${getCityDate(today.dt, today.timezone)}`;

    const temperature = document.createElement("p");
    temperature.classList.add("temperature");
    temperature.textContent = `${parseInt((today.main.temp - 273.15) * (9 / 5) + 32)}°F`;

    const todaysImage = document.createElement("img");
    todaysImage.classList.add("todays-image");
    // const iconCode = today.weather[0].icon;
    todaysImage.src = `https://openweathermap.org/img/wn/${today.weather[0].icon}@4x.png`;
    todaysImage.alt = `Icon of today's weather`;

    const description = document.createElement("p");
    description.classList.add("description");
    description.textContent = today.weather[0].description.charAt(0).toUpperCase() + today.weather[0].description.slice(1);

    const todaysHigh = document.createElement("p");
    todaysHigh.classList.add("todays-high");
    todaysHigh.textContent = `H: ${parseInt((today.main.temp_max - 273.15) * (9 / 5) + 32)}°F`;

    const todaysLow = document.createElement("p");
    todaysLow.classList.add("todays-low");
    todaysLow.textContent = `L: ${parseInt((today.main.temp_min - 273.15) * (9 / 5) + 32)}°F`;

    const feelsLike = document.createElement("p");
    feelsLike.classList.add("feels-like");
    feelsLike.textContent = `Feels like: ${parseInt((today.main.feels_like - 273.15) * (9 / 5) + 32)}°F`;

    const humidity = document.createElement("p");
    humidity.classList.add("humidity");
    humidity.textContent = `Humidity: ${today.main.humidity}%`;

    const wind = document.createElement("p");
    wind.classList.add("wind");
    wind.textContent = `Wind: ${today.wind.speed}mph`;

    const sunrise = document.createElement("p");
    sunrise.classList.add("sunrise");
    sunrise.textContent = `Sunrise: ${getCityTime(today.sys.sunrise, today.timezone)}`;

    const sunset = document.createElement("p");
    sunset.classList.add("sunset");
    sunset.textContent = `Sunset: ${getCityTime(today.sys.sunset, today.timezone)}`;

    todayLocation.appendChild(city);
    todayLocation.appendChild(country);
    todayLocation.appendChild(todayDate);

    todayTemp.appendChild(temperature);
    todayTemp.appendChild(todaysImage);

    bottomLeft.appendChild(description);
    bottomLeft.appendChild(todaysHigh);
    bottomLeft.appendChild(todaysLow);

    bottomRight.appendChild(feelsLike);
    bottomRight.appendChild(humidity);
    bottomRight.appendChild(wind);
    bottomRight.appendChild(sunrise);
    bottomRight.appendChild(sunset);

}

function getCityTime(unixSeconds, timezone) {
    const date = new Date((unixSeconds + timezone) * 1000);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
};

function getCityDate(unixSeconds, timezone) {
    const date = new Date((unixSeconds + timezone) * 1000);
    return date.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" });
};


async function search(event) {
    event.preventDefault();

    const userInput = input.value.trim();
    

    setState("loading", "Loading the data for your city...");
    
    const response = await fetch(`${baseUrl}?q=${userInput}&appid=${apiKey}`);
    const data = await response.json();

    if (!response.ok) {
        statusEl.textContent = `Please enter a valid city.`;
        return;
    }

    showToday(data);

    statusEl.textContent = "";
    input.value = "";
    
    return data;
}

function setState(state, message) {
    statusEl.dataset.state = state;
    statusEl.textContent = message;
}




// ----- listeners -----
searchForm.addEventListener("submit", search);


// ----- run on load -----
todayFetch("Stockton");
// showForecast();
