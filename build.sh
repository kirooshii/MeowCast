#Pass version using command line argument
command sudo docker build --no-cache  --platform linux/amd64 -t dafraer/weather-app:$1 .
command  docker push dafraer/weather-app:$1