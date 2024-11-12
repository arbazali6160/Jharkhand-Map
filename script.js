const apiKey = "9244d142ba954fca875191713242810"; // Provided API Key
const baseUrl = "https://api.weatherapi.com/v1";

// Mapping of districts to coordinates
const districtCoords = {
    Palamu: { lat: 24.08, lon: 84.07 },
    Lohardaga: { lat: 23.43, lon: 84.68 },
    Gumla: { lat: 23.04, lon: 84.54 },
    West_Singhbhum: { lat: 22.57, lon: 85.82 },
    East_Singhbhum: { lat: 22.78, lon: 86.20 },
    Ranchi: { lat: 23.36, lon: 85.33 },
    Chatra: { lat: 24.20, lon: 84.87 },
    Hazaribag: { lat: 24.00, lon: 85.36 },
    Bokaro: { lat: 23.67, lon: 86.15 },
    Dhanbad: { lat: 23.80, lon: 86.43 },
    Giridih: { lat: 24.18, lon: 86.3 },
    Koderma: { lat: 24.46, lon: 85.60 },
    Deoghar: { lat: 24.49, lon: 86.7 },
    Dumka: { lat: 24.26, lon: 87.24 },
    Godda: { lat: 24.83, lon: 87.21 },
    Sahibganj: { lat: 25.26, lon: 87.64 },
    Pakur: { lat: 24.64, lon: 87.84 },
    Garhwa: { lat: 24.17, lon: 83.80 },
    Latehar: { lat: 23.6943, lon: 84.0417 },
    Jamtara: { lat: 23.9895, lon: 86.8320 },
    Ramgarh: { lat: 23.6820, lon: 85.4710 },
    Simdega: { lat: 23.5763, lon: 84.9617 },
    Khunti: { lat: 23.0718, lon: 85.3210 },
    Saraikela: { lat: 22.8037, lon: 85.8655 }
};

let currentHourIndex = new Date().getHours(); // Start index for current hour
let showHour = 6;
let forecastData = []; // Store fetched forecast data

async function showWeather(district) {
    currentDistrict = district;
    document.getElementById("districtName").textContent = `Weather Data for ${district}`;

    // Reset hour index and forecast display when a new district is selected
    currentHourIndex = new Date().getHours();
    forecastData = [];
    document.getElementById("hourlyForecastData").innerHTML = "";

    // Fetch coordinates and data
    if (!districtCoords[district]) {
        alert("Coordinates for this district are not available.");
        return;
    }

    const { lat, lon } = districtCoords[district];
    const location = `${lat},${lon}`;

    try {
        const response = await fetch(`${baseUrl}/forecast.json?key=${apiKey}&q=${location}&days=1&aqi=no&alerts=no`);
        const data = await response.json();

        // Display general weather info
        document.getElementById("weatherDate").textContent = `Data recorded on: ${new Date(data.location.localtime).toLocaleString()}`;
        document.getElementById("temperature").textContent = `${data.current.temp_c}°C`;
        document.getElementById("weatherIcon").src = `https:${data.current.condition.icon}`;

        const weatherLabel = `
            <p>Feels like:</p>
            <p>Humidity:</p>
            <p>Wind speed:</p>
            <p>Wind direction:</p>
            <p>Pressure:</p>
            <p>Cloudiness:</p>
        `;
        document.getElementById("weatherLabel").innerHTML = weatherLabel;

        const weatherDetails = `
            <p>${data.current.feelslike_c} °C</p>
            <p>${data.current.humidity} %</p>
            <p>${data.current.wind_kph} kph</p>
            <p>${data.current.wind_degree}°</p>
            <p>${data.current.pressure_mb} hPa</p>
            <p>${data.current.cloud} %</p>
        `;
        document.getElementById("weatherDetails").innerHTML = weatherDetails;

        // Store only today's hourly forecast data starting from the current hour
        forecastData = data.forecast.forecastday[0].hour.slice(currentHourIndex);
        displayHourlyForecast(); // Show the first 6 hours initially

    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Failed to fetch weather data.");
    }
}

function displayHourlyForecast() {
    const forecastTable = document.getElementById("hourlyForecastData");

    // Clear previous rows before appending new ones
    forecastTable.innerHTML = "";

    if(forecastData.length>6) document.getElementById("seeMoreBtn").style.display="block";

    // Append forecast data for today, limited to the next 6 hours per display
    forecastData.slice(0, showHour).forEach(hour => {
        const time = new Date(hour.time).getHours();
        if(time >=23){
            document.getElementById("seeMoreBtn").style.display="none";
            // return;
        }
        forecastTable.innerHTML += `
            <tr>
                <td>${time}:00</td>
                <td><img src="https:${hour.condition.icon}" alt="weather icon"></td>
                <td>${hour.temp_c} °C</td>
                <td>${hour.humidity} %</td>
                <td>${hour.wind_degree}°</td>
                <td>${hour.wind_kph} kph</td>
                <td>${hour.chance_of_rain} %</td>
            </tr>
        `;
    });

    // Update "See More" button visibility based on remaining data
    // document.getElementById("seeMoreBtn").style.display = forecastData.length > currentHourIndex + 6 ? "block" : "none";
}

// Expand forecast data on "See More" button click
document.getElementById("seeMoreBtn").addEventListener("click", () => {
    showHour += 6;
    displayHourlyForecast(); // Append the next 6 hours without repeating
});

// Draggable functionality for the weather info container
const container = document.querySelector(".weather-info");

function onMouseDrag({ movementX, movementY }) {
    let getContainerStyle = window.getComputedStyle(container);
    let leftValue = parseInt(getContainerStyle.left);
    let topValue = parseInt(getContainerStyle.top);
    container.style.left = `${leftValue + movementX}px`;
    container.style.top = `${topValue + movementY}px`;
}
container.addEventListener("mousedown", () => {
    container.addEventListener("mousemove", onMouseDrag);
});
document.addEventListener("mouseup", () => {
    container.removeEventListener("mousemove", onMouseDrag);
});

// Initial call to display the forecast for the current time onwards
displayHourlyForecast();
