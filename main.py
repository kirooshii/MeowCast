from datetime import datetime
import sys
from flask import Flask, request, jsonify
from waitress import serve
from weather_data import get_prediction

ARGS_LENGTH = 3
MAX_LATITUDE = 90
MIN_LATITUDE = -90
MAX_LONGITUDE = 180
MIN_LONGITUDE = -180
app = Flask(__name__)

# Serve the home page
@app.route("/")
def home_page():
    return app.send_static_file("index.html")

#API endpoint to get weather data
@app.route("/data", methods=["GET"])
def get_data():
    unix_time = request.args.get('unix-time', type=int)
    latitude = request.args.get('latitude', type=float)
    longitude = request.args.get('longitude', type=float)
    if unix_time is None or latitude is None or longitude is None or latitude < MIN_LATITUDE or latitude > MAX_LONGITUDE  or longitude < MIN_LONGITUDE or longitude > MAX_LONGITUDE:
        return jsonify({"error": "Missing required parameters: unix-time, latitude, longitude"}), 400
    #Examples
    #latitude = 41.711033
    #longitude = 44.758182
    day = datetime.fromtimestamp(unix_time).strftime("%m%d")
    data = get_prediction(day, latitude, longitude)
    if not data:
        return jsonify({"error": "Could not fetch weather data"}), 500
    return jsonify(data)

#Testing
@app.route("/test")
def test():
    # Test January 1st (day 1) and July 1st (day 182)
    jan_data = get_prediction(1, 41.711033, 44.758182)
    jul_data = get_prediction(182, 41.711033, 44.758182)
    
    return jsonify({
        "january_1_noon": jan_data.get(12, "No data"),
        "july_1_noon": jul_data.get(12, "No data")
    })

#Run the app using waitress for production, or Flask for development
if __name__ == "__main__":
    if len(sys.argv) == 1:
        app.run(port=8000, debug=True)
    elif len(sys.argv) == ARGS_LENGTH:
        try:
            host = sys.argv[1]
            port = int(sys.argv[2])
            serve(app, host=host, port=port)
        except ValueError:
            print("Port must be an integer.")
    else:
        print("Invalid number of arguments. Usage for production: python main.py <host> <port>")