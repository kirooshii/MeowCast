import json
from collections import defaultdict
from datetime import datetime, date
from statistics import mean
import requests

HOT_THRESH = 30.0
COLD_THRESH = -20.0    
WINDY_THRESH = 10.0   # m/s
WET_THRESH = 1.0      # mm/hr
POWER_HOURLY_API = "https://power.larc.nasa.gov/api/temporal/hourly/point"
START_DAY = 20200101 
END_DAY = 20241231


# Fetch temperature, precipitation and wind speed data from NASA POWER API
def get_nasa_data(start_day:int, end_day:int, lat:float, lon:float) -> dict:
    params = {
        "start": start_day,
        "end": end_day,
        "latitude": lat,
        "longitude": lon,
        "community": "re",
        "parameters": "T2M,PRECTOTCORR,WS2M", #temperature, precipitation, wind speed
        "format": "JSON",
        "units": "metric"
    }
    response = requests.get(POWER_HOURLY_API, params=params)
    return response.json()

def calculate(lat:float, lon:float)->dict:
    weather_stats = {}
    
    # Fetch data year by year (API has limits on JSON response size)
    grouped = defaultdict(lambda: defaultdict(lambda: {'temp': [], 'precip': [], 'wind': []}))
    

    data = get_nasa_data(START_DAY, END_DAY, lat, lon)
    
    if 'parameters' not in data:
        print(f"Error fetching data for {year}: {data}")
        return {}
    
    temps = data['properties']['parameter']['T2M']
    precip = data['properties']['parameter']['PRECTOTCORR']
    winds = data['properties']['parameter']['WS2M']
    
    for timestamp_str in temps.keys():
        if not timestamp_str.isdigit():  # Skip non-timestamp keys like 'units'
            continue
        year = int(timestamp_str[:4])
        month = int(timestamp_str[4:6])
        day = int(timestamp_str[6:8])
        hour = int(timestamp_str[8:10])
        
        dt = datetime(year, month, day)
        day_of_year = dt.timetuple().tm_yday
        
        temp_val = temps[timestamp_str]
        precip_val = precip[timestamp_str]
        wind_val = winds[timestamp_str]
        
        if temp_val != -999:
            grouped[day_of_year][hour]['temp'].append(temp_val)
        if precip_val != -999:
            grouped[day_of_year][hour]['precip'].append(precip_val)
        if wind_val != -999:
            grouped[day_of_year][hour]['wind'].append(wind_val)
    


    # Calculate statistics for each day-hour combination
    for day_of_year in range(1, 367):
        weather_stats[day_of_year] = {}
        
        for hour in range(24):
            if hour not in grouped[day_of_year] or not grouped[day_of_year][hour]['temp']:
                weather_stats[day_of_year][hour] = [
                    {"temperature": 0.0, "precipitation": 0.0, "wind_speed": 0.0},
                    {"very_hot": 0.0, "very_cold": 0.0, "very_windy": 0.0, 
                     "very_wet": 0.0, "very_uncomfortable": 0.0}
                ]
                continue
            
            temp_list = grouped[day_of_year][hour]['temp']
            precip_list = grouped[day_of_year][hour]['precip']
            wind_list = grouped[day_of_year][hour]['wind']
            
            avg_temp = mean(temp_list) if temp_list else 0.0
            avg_precip = mean(precip_list) if precip_list else 0.0
            avg_wind = mean(wind_list) if wind_list else 0.0
            
            prob_hot = sum(1 for t in temp_list if t > HOT_THRESH) / len(temp_list) if temp_list else 0.0
            prob_cold = sum(1 for t in temp_list if t < COLD_THRESH) / len(temp_list) if temp_list else 0.0
            prob_windy = sum(1 for w in wind_list if w > WINDY_THRESH) / len(wind_list) if wind_list else 0.0
            prob_wet = sum(1 for p in precip_list if p > WET_THRESH) / len(precip_list) if precip_list else 0.0
            
            prob_uncomfortable = max(prob_hot, prob_cold, prob_windy, prob_wet)
            
            weather_stats[day_of_year][hour] = [
                {"temperature": round(avg_temp, 1), "precipitation": round(avg_precip, 2), "wind_speed": round(avg_wind, 1)},
                {"very_hot": round(prob_hot, 2), "very_cold": round(prob_cold, 2), "very_windy": round(prob_windy, 2), 
                 "very_wet": round(prob_wet, 2), "very_uncomfortable": round(prob_uncomfortable, 2)}
            ]
    
    return weather_stats


def get_prediction(day:int, lat:float, lon:float)->dict:
    """
    Get weather prediction for a specific day of year.
    Returns hourly statistics (0-23) for that day.
    """
    # Convert date to day of year if needed
    if isinstance(day, date):
        day_of_year = day.timetuple().tm_yday
    else:
        day_of_year = day
    
    # Return calculated stats, or empty dict if not available
    return calculate().get(day_of_year, {})