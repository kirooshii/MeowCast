from collections import defaultdict
from datetime import datetime, date
from statistics import mean
import requests
import asyncio
import aiohttp
HOT_THRESH = 30.0
COLD_THRESH = -20.0    
WINDY_THRESH = 10.0   # m/s
WET_THRESH = 1.0      # mm/hr
POWER_HOURLY_API = "https://power.larc.nasa.gov/api/temporal/hourly/point"
START_YEAR= 2001
END_YEAR = 2024

def get_tasks(session, base_params, fmt_day):
    tasks = []
    for year in range (START_YEAR, END_YEAR+1):
        params = base_params.copy()
        params["start"] = f"{year}{fmt_day}"
        params["end"] = f"{year}{fmt_day}"
        tasks.append(session.get(POWER_HOURLY_API, params=params))
    return tasks

# Fetch temperature, precipitation and wind speed data from NASA POWER API
async def get_nasa_data(fmt_day:str, lat:float, lon:float) -> list:
    data = []

    params = {
        "start": fmt_day,
        "end": fmt_day,
        "latitude": lat,
        "longitude": lon,
        "community": "re",
        "parameters": "T2M,PRECTOTCORR,WS2M", #temperature, precipitation, wind speed
        "format": "JSON",
        "units": "metric"
    }
    async with aiohttp.ClientSession() as session: 
       tasks = get_tasks(session, params, fmt_day)
       responses = await asyncio.gather(*tasks)
       for response in responses:
           data.append(await response.json())
    return data

def get_prediction(fmt_day:str, lat:float, lon:float)->dict:
    weather_stats = {}
    
    grouped = defaultdict(lambda: {'temp': [], 'precip': [], 'wind': []})

    #Fetch data year by year asynchronously
    data = asyncio.run(get_nasa_data(fmt_day, lat, lon))

    if 'parameters' not in data[0]:
        print("Error fetching data")
        return {}
    
    for d in data:
        temps = d['properties']['parameter']['T2M']
        precip = d['properties']['parameter']['PRECTOTCORR']
        winds = d['properties']['parameter']['WS2M']
        for timestamp_str in temps:
            if not timestamp_str.isdigit():  # Skip non-timestamp keys like 'units'
                continue
            year = int(timestamp_str[:4])
            month = int(timestamp_str[4:6])
            day = int(timestamp_str[6:8])
            hour = int(timestamp_str[8:10])
            
            temp_val = temps[timestamp_str]
            precip_val = precip[timestamp_str]
            wind_val = winds[timestamp_str]
            
            if temp_val != -999:
                grouped[hour]['temp'].append(temp_val)
            if precip_val != -999:
                grouped[hour]['precip'].append(precip_val)
            if wind_val != -999:
                grouped[hour]['wind'].append(wind_val)

    for hour in range(24):
        if hour not in grouped or not grouped[hour]['temp']:
            weather_stats[hour] = [
                {"temperature": 0.0, "precipitation": 0.0, "wind_speed": 0.0},
                {"very_hot": 0.0, "very_cold": 0.0, "very_windy": 0.0, 
                    "very_wet": 0.0, "very_uncomfortable": 0.0}
            ]
            continue
        
        temp_list = grouped[hour]['temp']
        precip_list = grouped[hour]['precip']
        wind_list = grouped[hour]['wind']
        
        avg_temp = mean(temp_list) if temp_list else 0.0
        avg_precip = mean(precip_list) if precip_list else 0.0
        avg_wind = mean(wind_list) if wind_list else 0.0
        
        prob_hot = sum(1 for t in temp_list if t > HOT_THRESH) / len(temp_list) if temp_list else 0.0
        prob_cold = sum(1 for t in temp_list if t < COLD_THRESH) / len(temp_list) if temp_list else 0.0
        prob_windy = sum(1 for w in wind_list if w > WINDY_THRESH) / len(wind_list) if wind_list else 0.0
        prob_wet = sum(1 for p in precip_list if p > WET_THRESH) / len(precip_list) if precip_list else 0.0
        
        prob_uncomfortable = max(prob_hot, prob_cold, prob_windy, prob_wet)
        
        weather_stats[hour] = [
            {"temperature": round(avg_temp, 1), "precipitation": round(avg_precip, 2), "wind_speed": round(avg_wind, 1)},
            {"very_hot": round(prob_hot, 2), "very_cold": round(prob_cold, 2), "very_windy": round(prob_windy, 2), 
                "very_wet": round(prob_wet, 2), "very_uncomfortable": round(prob_uncomfortable, 2)}
        ]
    return weather_stats