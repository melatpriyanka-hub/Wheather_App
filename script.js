
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

async function getWeather() {

    const city = cityInput.value.trim();

    if (!city) {
        weatherResult.innerHTML = "<p>Please enter a city name!</p>";
        return;
    }

    weatherResult.innerHTML = "<p>Loading weather...</p>";

    try {
        // Find city coordinates
        const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);
        if (!geoResponse.ok) throw new Error("Unable to find city.");

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found!");
        }

        const location = geoData.results[0];

        // Get live weather data
        const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);
        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        // Weather condition
        function getCondition(code) {
            if (code === 0) return "Clear Sky ☀️";
            if ([1, 2, 3].includes(code)) return "Partly Cloudy ⛅";
            if ([45, 48].includes(code)) return "Foggy 🌫️";
            if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle 🌦️";
            if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rainy 🌧️";
            if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowy ❄️";
            if ([95, 96, 99].includes(code)) return "Thunderstorm ⛈️";
            return "Unknown";
        }

        weatherResult.innerHTML = `
            <h2>${location.name}, ${location.country}</h2>

            <h1 style="font-size:55px; margin:15px 0;">
                ${Math.round(current.temperature_2m)}°C
            </h1>

            <h3>${getCondition(current.weather_code)}</h3>

            <p>Feels Like: ${current.apparent_temperature}°C</p>
            <p>Humidity: ${current.relative_humidity_2m}%</p>
            <p>Wind Speed: ${current.wind_speed_10m} km/h</p>
            <p>Precipitation: ${current.precipitation} mm</p>

            <p style="font-size:12px;">
                Updated: ${current.time.replace("T", " ")}
            </p>
        `;

    } catch (error) {
        weatherResult.innerHTML = `<p>${error.message}</p>`;
    }
}
