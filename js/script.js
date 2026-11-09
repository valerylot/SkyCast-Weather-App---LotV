import { todayFetch, forecastFetch, getLocationWeather, getLocationForecast } from "./api.js";

// ----- data -----
let favoriteCities = JSON.parse(localStorage.getItem("favoriteCities")) || [];
let currentWeather = null;


// ----- elements -----
const todayLocation = document.getElementById("today-location");
const todayTemp = document.getElementById("today-temp");
const bottomLeft = document.getElementById("bottom-left");
const bottomRight = document.getElementById("bottom-right");

const forecast = document.getElementById("forecast");

const searchForm = document.getElementById("search-form");
const input = document.getElementById("search-input");
const statusEl = document.getElementById("status");

const findButton = document.getElementById("find-me");
const locStatus = document.getElementById("loc-status");

const favBtn = document.getElementById("favorites-button");
const addFav = document.getElementById("add-favorite");
const favContainer = document.getElementById("favorites-container");


// ----- functions -----

function showToday(today) {
    todayLocation.replaceChildren();
    todayTemp.replaceChildren();
    bottomLeft.replaceChildren();
    bottomRight.replaceChildren();

    const city = document.createElement("p");
    city.classList.add("text-[30px]", "font-bold");
    city.textContent = today.name;

    const country = document.createElement("p");
    country.classList.add("text-[20px]")
    country.textContent = today.sys.country;

    const todayDate = document.createElement("p");
    todayDate.classList.add("today-date");
    todayDate.textContent = `${getCityDate(today.dt, today.timezone)}`;

    const temperature = document.createElement("p");
    temperature.classList.add("text-[40px]", "md:text-[60px]");
    temperature.textContent = `${parseInt((today.main.temp - 273.15) * (9 / 5) + 32)}°F`;

    const todaysImage = document.createElement("img");
    todaysImage.classList.add("w-[150px]", "h-[150px", "md:w-[200px]", "md:h-[200px]");
    todaysImage.src = `https://openweathermap.org/img/wn/${today.weather[0].icon}@4x.png`;
    todaysImage.alt = `Icon of today's weather`;

    const description = document.createElement("p");
    description.classList.add("font-normal", "text-[20px]");
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

};

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

    if (userInput === "") {
        statusEl.textContent = "Please enter a valid city.";
        return;
    }

    setState("loading", "Loading the data for your city...");


    const todayData = await todayFetch(userInput);
    if (!todayData) {
        statusEl.textContent = "Location not found. Please try again.";
        return;
    }

    currentWeather = todayData;

    const forecastData = await forecastFetch(userInput);
    if (!forecastData) {
        statusEl.textContent = "Location not found. Please try again.";
        return;
    }


    showToday(todayData);
    showForecast(forecastData);

    updateFavoriteButton();

    statusEl.textContent = "";
    input.value = "";
};

function setState(state, message) {
    statusEl.dataset.state = state;
    statusEl.textContent = message;
};


function groupByDay(list, timezone) {
    const days = {};

    for (const item of list) {
        const date = getCityDate(item.dt, timezone);

        if (!days[date]) {
            days[date] = {
                date: date,
                high: item.main.temp_max,
                low: item.main.temp_min,
                icon: item.weather[0].icon,
                description: item.weather[0].description.charAt(0).toUpperCase() + item.weather[0].description.slice(1)
            };
        };


        if (item.main.temp_max > days[date].high) {
            days[date].high = item.main.temp_max;
        };

        if (item.main.temp_min < days[date].low) {
            days[date].low = item.main.temp_min;
        };

    };

    const dayList = [];

    for (const day in days) {
        dayList.push(days[day]);
    };

    return dayList;
};

function showForecast(forecastData) {
    forecast.replaceChildren();

    const allDays = groupByDay(forecastData.list, forecastData.city.timezone);

    const fiveDays = allDays.slice(1, 6);


    for (const day of fiveDays) {
        // console.log(day);

        const forecastCard = document.createElement("div");
        forecastCard.classList.add("border-2", "px-10", "justify-evenly", "rounded-sm", "py-3", "bg-indigo-300", "md:border-white");

        const date = document.createElement("p");
        date.classList.add("forecast-date");
        date.textContent = `${day.date}`;

        const forecastImage = document.createElement("img");
        forecastImage.classList.add("mx-auto");
        forecastImage.src = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;
        forecastImage.alt = `Image depicting ${day.description}`;

        const forecastDescription = document.createElement("p");
        forecastDescription.classList.add("forecast-description");
        forecastDescription.textContent = `${day.description}`;

        const forecastHigh = document.createElement("p");
        forecastHigh.classList.add("forecast-high");
        forecastHigh.textContent = `H: ${parseInt((day.high - 273.15) * (9 / 5) + 32)}°F`;

        const forecastLow = document.createElement("p");
        forecastLow.classList.add("forecast-low");
        forecastLow.textContent = `L: ${parseInt((day.low - 273.15) * (9 / 5) + 32)}°F`;

        if(day === fiveDays[fiveDays.length - 1]){
            forecastCard.classList.add("col-span-2", "lg:col-span-1");
        }


        forecastCard.appendChild(date);
        forecastCard.appendChild(forecastImage);
        forecastCard.appendChild(forecastDescription);
        forecastCard.appendChild(forecastHigh);
        forecastCard.appendChild(forecastLow);


        forecast.appendChild(forecastCard);
    };

};

const success = async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const data = await getLocationWeather(lat, lon);
    const forecastData = await getLocationForecast(lat, lon);

    if (!data || !forecastData) {
        locStatus.textContent = "Unable to retrieve data.";
        return;
    }

    currentWeather = data;

    showToday(data);
    showForecast(forecastData);

    updateFavoriteButton();

    locStatus.textContent = "Located you.";

};

const error = (err) => {
    if (err.code === 1) {
        locStatus.textContent = "You blocked your location. Allow it and try again.";
    } else {
        locStatus.textContent = "We couldn't retrieve your location.";
    }
};

const addFavorite = (today) => {
    const cityName = today.name;

    if (favoriteCities.includes(cityName)) {
        let cityIndex = favoriteCities.indexOf(cityName);
        favoriteCities.splice(cityIndex, 1);
    } else {
        favoriteCities.push(cityName);
    }

    localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));

    updateFavoriteButton();

    if (!favContainer.hidden) {
        showFavorites();
    };
};

const updateFavoriteButton = () => {

    addFav.classList.add(
        "border-2",
        "border-black",
        "rounded-md",
        "p-2",
        "text-center",
        "font-semibold",
        "mt-3",
        "max-h-11",
        "hover:bg-blue-200"
    );
    if (favoriteCities.includes(currentWeather.name) === true) {
        addFav.textContent = "❌ Remove Favorite";
    } else {
        addFav.textContent = "❤️ Add to Favorites"
    };
};

const showFavorites = () => {
    favContainer.replaceChildren();

    for (const city of favoriteCities) {
        const cityButton = document.createElement("button");
        cityButton.textContent = city;

        cityButton.classList.add(
            "border-2", 
            "rounded-md", 
            "p-2", 
            "border-white", 
            "m-2", 
            "text-center",
            "text-white");

        favContainer.appendChild(cityButton);

        cityButton.addEventListener("click", async function () {
            const todayData = await todayFetch(city);

            const forecastData = await forecastFetch(city);

            if (!todayData || !forecastData) {
                statusEl.textContent = "Unable to retrieve city data.";
                return;
            }

            currentWeather = todayData;

            showToday(todayData);
            showForecast(forecastData);

            updateFavoriteButton();

            statusEl.textContent = "";
        });
    };

};

// ----- listeners -----
searchForm.addEventListener("submit", search);

findButton.addEventListener("click", () => {
    locStatus.textContent = "Locating you...";
    navigator.geolocation.getCurrentPosition(success, error);
});

addFav.addEventListener("click", function () {
    if (currentWeather !== null) {
        addFavorite(currentWeather);
    }
});

favBtn.addEventListener("click", function () {
    favContainer.hidden = !favContainer.hidden;

    if (!favContainer.hidden) {
        showFavorites();
    }
});


// ----- run on load -----
const stocktonData = await todayFetch("Stockton");
const stocktonForecastaData = await forecastFetch("Stockton");

currentWeather = stocktonData;

showToday(stocktonData);
showForecast(stocktonForecastaData);

updateFavoriteButton();