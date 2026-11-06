const apiKey = "bf397107bcc194308bec5cc3b977fe5f";
const baseUrl = `https://api.openweathermap.org`;


export const todayFetch = async (city) => {
    const response = await fetch(`${baseUrl}/data/2.5/weather?q=${city}&appid=${apiKey}`);
    const data = await response.json();

    if (!response.ok) {
        return;
    }

    return data;
};

export const forecastFetch = async (city) => {
    const response = await fetch(`${baseUrl}/data/2.5/forecast?q=${city}&appid=${apiKey}`);
    const forecastData = await response.json();

    if (!response.ok) {
        return;
    }

    return forecastData;
};

export const getLocationWeather = async (lat, lon) => {
    const res = await fetch(`${baseUrl}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const data = await res.json();
    
    if(!res.ok){
        return;
    }

    return data;
};

export const getLocationForecast = async (lat, lon) => {
    const res = await fetch(`${baseUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const forecastData = await res.json();

    if(!res.ok){
        return;
    }

    return forecastData;
};