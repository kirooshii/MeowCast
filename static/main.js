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
function handler(event){
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
    alert(`Day: ${day}, Lat: ${lat}, Lon: ${lon}`);
}

