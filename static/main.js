const lat = 41.711033;
const lon = 44.758182;
const zoom = 13;
const map = L.map('map').setView([lat, lon], zoom);

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
    
    // Convert date to unix timestamp (in seconds)
    const unixTime = Math.floor(date.getTime() / 1000);
    
    // Fetch weather data from API
    try {
        const response = await fetch(`/data?unix-time=${unixTime}&latitude=${lat}&longitude=${lon}`);
        
        if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.error}`);
            return;
        }
        
        const weatherData = await response.json();
        displayWeatherData(weatherData);
        
    } catch (error) {
        alert(`Failed to fetch weather data: ${error.message}`);
    }
}

// Display weather data in the result section
function displayWeatherData(data) {
    // Use noon (hour 12) as the primary display
    const noonData = data[12];
    
    if (!noonData) {
        alert('No weather data available for this location and date.');
        return;
    }
    
    const [measurements, probabilities] = noonData;
    
    // Update temperature
    document.querySelector('#temp p').textContent = `${measurements.temperature}°C`;
    
    // Update precipitation
    document.querySelector('#precip p').textContent = `${measurements.precipitation} mm/hr`;
    
    // Update wind speed
    document.querySelector('#wind-speed p').textContent = `${measurements.wind_speed} m/s`;
    
    // Update comfort level
    const comfortLevel = getComfortLevel(probabilities);
    document.querySelector('#comfort p').textContent = comfortLevel;
    
    // Create wind speed graph
    createWindSpeedGraph(data);
}

// Determine comfort level based on probabilities
function getComfortLevel(prob) {
    if (prob.very_uncomfortable > 0.5) return "Very Uncomfortable";
    if (prob.very_uncomfortable > 0.2) return "Uncomfortable";
    if (prob.very_hot > 0.5) return "Very Hot";
    if (prob.very_cold > 0.5) return "Very Cold";
    if (prob.very_windy > 0.5) return "Very Windy";
    if (prob.very_wet > 0.5) return "Very Wet";
    return "Comfortable";
}

// Create a simple wind speed graph
function createWindSpeedGraph(data) {
    const graphContainer = document.querySelector('#graph');
    
    // Clear previous graph
    const existingCanvas = graphContainer.querySelector('canvas');
    if (existingCanvas) {
        existingCanvas.remove();
    }
    
    // Create canvas for simple visualization
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 200;
    graphContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const padding = 40;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;
    
    // Extract wind speeds for each hour
    const windSpeeds = [];
    for (let hour = 0; hour < 24; hour++) {
        windSpeeds.push(data[hour][0].wind_speed);
    }
    
    const maxWind = Math.max(...windSpeeds, 10);
    
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw wind speed line
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < 24; i++) {
        const x = padding + (i / 23) * graphWidth;
        const y = canvas.height - padding - (windSpeeds[i] / maxWind) * graphHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw hour labels
    ctx.fillStyle = '#333';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    for (let i = 0; i < 24; i += 3) {
        const x = padding + (i / 23) * graphWidth;
        ctx.fillText(i + 'h', x, canvas.height - padding + 15);
    }
    
    // Draw wind speed labels
    ctx.textAlign = 'right';
    ctx.fillText('0', padding - 5, canvas.height - padding + 5);
    ctx.fillText(maxWind.toFixed(1), padding - 5, padding + 5);
}