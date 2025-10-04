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
    const day = document.getElementById("day").value;
    const lat = document.getElementById("lat").value;
    const lon = document.getElementById("lon").value;
    alert(`Day: ${day}, Lat: ${lat}, Lon: ${lon}`);
}

