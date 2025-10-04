import sys
from flask import Flask, request, jsonify
from waitress import serve
import weather_data 
ARGS_LENGTH = 3
app = Flask(__name__)
@app.route("/")
def home_page():
    return app.send_static_file("index.html")


@app.route("/data", methods=["GET"])
def get_data():
    day = request.args.get('day', type=int)
    #latitude = request.args.get('latitude', type=float)
    #longitude = request.args.get('longitude', type=float)
    latitude = 41.711033
    data = weather_data.get_prediction(day, latitude, longitude)
    return jsonify(data)

@app.route("/test")
def test():
    # Test January 1st (day 1) and July 1st (day 182)
    jan_data = weather_data.get_prediction(1, 41.711033, 44.758182)
    jul_data = weather_data.get_prediction(182, 41.711033, 44.758182)
    
    return jsonify({
        "january_1_noon": jan_data.get(12, "No data"),
        "july_1_noon": jul_data.get(12, "No data"),
        "total_days_calculated": len(weather_data.WEATHER_STATS)
    })

#Run the app using waitress for production, or Flask for development
if __name__ == "__main__":
    if len(sys.argv) == 1:
        app.run(debug=True)
    elif len(sys.argv) == ARGS_LENGTH:
        try:
            host = sys.argv[1]
            port = int(sys.argv[2])
            serve(app, host=host, port=port)
        except ValueError:
            print("Port must be an integer.")
    else:
        print("Invalid number of arguments. Usage for production: python main.py <host> <port>")