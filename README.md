<br />
<div align="center">

<h3 align="center">WeatherBuddy Web Application</h3>

  <p align="center">
    WeatherBuddy is a Web Application designed to help users explore and predict the weather by providing temperature, wind speed, and precipitation forecasts for any chosen place and date — making weather tracking smarter and more engaging.
    <br />
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#try-weatherbuddy-for-yourself">Try WeatherBuddy for Yourself</a></li>
        <li><a href="#run-locally">Run locally</a></li>
      </ul>
    </li>
    <li><a href="#features">Features</a></li>
    <li><a href="#under-the-hood">Under the hood</a></li>
    <li><a href="#contact-info">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

WeatherBuddy is a web application built to help users plan outdoor activities with confidence by exploring the likelihood of different weather conditions for any place and date. Using NASA Earth observation data from 2001–2024, it analyzes long-term climate patterns to estimate the chances of “very hot,” “very cold,” “very wet,” “very windy,” or “very uncomfortable” weather.

Whether you’re organizing a trip, planning a hike, or scheduling an outdoor event, WeatherBuddy provides personalized insights based on decades of real data — not just short-term forecasts. Simply select your location and date, and WeatherBuddy will show you the probabilities of key weather conditions, along with temperature, wind speed, and precipitation predictions.

With clear visualizations and downloadable data options, WeatherBuddy helps you make informed decisions, prepare for the unexpected, and better understand how weather patterns are changing over time.





<!-- GETTING STARTED -->
## Getting Started

### Try WeatherBuddy for Yourself
WordBuddy is available on web! Try it out: [WeatherBuddy](http://147.45.210.161/).  
For a full list of features, check out the [Features](#features) section.

### Run Locally
You can easily run WeatherBuddy locally using Docker Compose by following these steps:  

#### 1. Download the `docker-compose.yaml` file  
Open your terminal and run:  

```sh
wget https://raw.githubusercontent.com/kirooshii/MeowCast/refs/heads/main/docker-compose.yaml
```  

#### 2. Set Up  Environment Variables  
- Change `PORT` and `HOST` environment variables if needed. 

#### 3. Start the Web Application
Run the following command to start WeatherBuddy in the background:  

```sh
sudo docker-compose up -d
```  

Now your app should be up and running locally! 

<!-- FEATURES -->
## Features

* **Flexible location input:**
    Drop a pin on the map to target exactly where you care about.

* **Choose any date:**
    Query a specific calendar date  (handy for planning seasonal events).

* **Probability-based condition flags:**
    See chances of “very hot,” “very cold,” “very windy,” “very wet,” or “very uncomfortable” conditions, derived from NASA POWER API data (2001–2024).

* **Clear visualizations:**
    Visualize hourly data using graphs.

* **Downloadable outputs:**
  Export JSON that includes source data.

> Note: WeatherBuddy uses historical NASA data to estimate probabilities—not a short-term forecast. Results describe historical likelihoods and trends and may not reflect sudden real-time changes.

## Under the Hood

A quick look at the stack that powers WeatherBuddy:

* **Core backend**
  Built with **Python** using **Flask** — a lightweight REST API that handles location/date queries, data processing, and serves static files to the frontend.

* **Data source**
  NASA **POWER** API (historic records 2001–2024) is used to fetch temperature, wind speed and precipitation. Backend logic computes  probability metrics from those datasets.

* **Frontend**
  Plain **HTML / CSS / JavaScript** for the UI and interactions.

  * **Leaflet** for map input (pin drop).
  * **Chart.js** for hourly charts.

* **Deployment**
  Packaged with **Docker Compose** and deployed to a VPS for straightforward, reproducible operation and easy updates.

<!-- CONTACT -->
## Contact Info
Kamil Nuriev - kdnuriev@gmail.com