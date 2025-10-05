const lat = 41.711033;
const lon = 44.758182;
const zoom = 13;
const map = L.map('map').setView([lat, lon], zoom);
const params = 0;
const probabilities = 1;
const temperature = "temperature";
const windSpeed = "wind_speed";
const precipitation = "precipitation";
let weatherData = {};
let myChart = {};
//Basic set up for Leaflet map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//Add default marker
var marker = L.marker([lat, lon]).addTo(map);

//Add marker on map click
function onMapClick(e) {
    map.removeLayer(marker);
    marker = L.marker(e.latlng).addTo(map); 
    document.getElementById("lat").value = e.latlng.lat;
    document.getElementById("lon").value = e.latlng.lng;
}
map.on('click', onMapClick);

//Form submit handler
async function handler(event){
    event.preventDefault();
    
    //validate the input
    const day = document.getElementById("day").value;
    const date = new Date(day);
    const now = new Date();
    
    if (isNaN(date)) {
      alert('Please enter a valid date.');
      return;
    }
    if (date <= now) {
      alert("Please enter a future date.");
      return;
    } 

    const lat = document.getElementById("lat").value;
    const lon = document.getElementById("lon").value;
    
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        alert('Please enter valid latitude and longitude values.');
        return;
    }
    
    //Show loading sign
    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    // Convert date to unix timestamp (in seconds)
    const unixTime = Math.floor(date.getTime() / 1000);
    
    // Fetch weather data from API
    try {
        const response = await fetch(`/data?unix-time=${unixTime}&latitude=${lat}&longitude=${lon}`);
        
        if (!response.ok) {
            const error = await response.json();
            console.log(`Error: ${error.error}`);
            return;
        }
        
        weatherData = await response.json();
        displayWeatherData(weatherData);
        
    } catch (error) {
        console.log(`Failed to fetch weather data: ${error.message}`);
    } finally {
        loading.style.display = 'none'; // hide loading
    }
}

// Display weather data in the result section
function displayWeatherData(data) {
    console.log(data);
    let mxTemp = -Infinity;
    let mnTemp = Infinity;
    let avgWindSpeed = 0;
    let avgPrecipitation = 0;
    let avgWindyProb = 0;
    let avgHotProb = 0;
    let avgColdProb = 0;
    let avgWetProb = 0;
    let avgUncomfortableProb = 0;
    for (let hour = 0; hour < 24; hour++) {
        mxTemp = Math.max(mxTemp, data[hour][params].temperature);
        mnTemp = Math.min(mnTemp, data[hour][params].temperature);
        avgWindSpeed += data[hour][params].wind_speed;
        avgPrecipitation += data[hour][params].precipitation;
        avgUncomfortableProb += data[hour][probabilities].very_uncomfortable;
        avgHotProb += data[hour][probabilities].very_hot;
        avgColdProb += data[hour][probabilities].very_cold;
        avgWindyProb += data[hour][probabilities].very_windy;
        avgWetProb += data[hour][probabilities].very_wet;
    }
    avgWindSpeed /= 24;
    avgPrecipitation /= 24;
    avgUncomfortableProb /= 24;
    avgHotProb /= 24;
    avgColdProb /= 24;
    avgWindyProb /= 24;
    avgWetProb /= 24;
    // Update temperature
    document.getElementById('comfort').style.setProperty('--uncomfort-percent', Math.round(avgUncomfortableProb * 100));
    document.getElementById('temp').innerHTML = `
    <h3>Temperature</h3>
    <p>Min: ${mnTemp.toFixed(2)}C°</p>
    <p>Max: ${mxTemp.toFixed(2)}C°</p>
    <p>Probability of a very hot weather: ${(avgHotProb*100).toFixed(2)}%</p>
    <p>Probability of a very cold weather: ${(avgColdProb*100).toFixed(2)}%</p>
    `;
    
    // Update precipitation
    document.getElementById('precip').innerHTML = `
    <h3>Precipitation</h3>
    <p>${avgPrecipitation.toFixed(2)} mm/hr</p>
    <p>Probability of a very wet weather: ${(avgWetProb*100).toFixed(2)}%</p>
    `;
    
    // Update wind speed
    document.getElementById('wind-speed').innerHTML = `
    <h3>Wind Speed</h3><p>${avgWindSpeed.toFixed(2)} m/s</p>
    <p>Probability of a very windy weather: ${(avgWindyProb*100).toFixed(2)}%</p>
    `;
    
    // Update comfort level
    document.getElementById('comfort').innerHTML = `
    <h3>Comfortability</h3>
    <p>Probability of a very uncomfortable weather: ${(avgUncomfortableProb*100).toFixed(2)}%</p>
    `;
    
    // Create wind speed graph
    document.getElementById("select-graph").removeAttribute("hidden");
    renderGraph(data, temperature);
}

// Create a simple wind speed graph
function renderGraph(data, type) {
    let label = "";
    if (type === "wind_speed") {
        label = "Average wind speed in m/s every hour";
    } else if (type === "precipitation") {
        label = "Average precipitation in mm/hr every hour";
    } else if (type === "temperature") {
        label = "Average temperature in C every hour";
    } else {
        return;
    }
    const ctx = document.getElementById('myChart');
    const hourlyData = []
    for (let i = 0; i < 24; i++) {
        hourlyData.push(data[i][params][type])
    }
    console.log(hourlyData)
    if (myChart && typeof myChart.destroy === 'function') {
        myChart.destroy();
    }
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
        labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
        datasets: [{
            label: label,
            data: hourlyData,
            borderWidth: 1,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
        },
        options: {
        scales: {
            y: {
            beginAtZero: true
            }
        }
        }
    });
}

function graphHandler(event) {
    event.preventDefault();
    if (weatherData && Object.keys(weatherData).length > 0) {
        const data = new FormData(event.target);
        console.log(data);
        const type = data.get('type');
        renderGraph(weatherData, type);
    }
}

