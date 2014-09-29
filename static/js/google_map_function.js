function showLocation(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  $('input[name="latitude"]').val(latitude);
  $('input[name="longitude"]').val(longitude);
}

function errorHandler(err) {
  if(err.code == 1) {
    alert("Error: Access is denied!");
  } else if( err.code == 2) {
    alert("Error: Position is unavailable!");
  }
}

function getLocation(){
   if(navigator.geolocation){
      // timeout at 60000 milliseconds (60 seconds)
      var options = { timeout:60000 };
      navigator.geolocation.getCurrentPosition(showLocation, errorHandler, options);
      current_loc_marker(latitude, longitude);
   } else {
      alert("Sorry, browser does not support geolocation!");
   }
}

var myLatlng;
var mapOptions;
var marker;
var map;
var latitude;
var longitude;
var radius = 1000;

var locations;

function current_loc_marker(latitude, longitude) {
  myLatlng = new google.maps.LatLng(latitude, longitude);
  mapOptions = {
    zoom: 14,
    center: myLatlng
  };
  marker = new google.maps.Marker({
    position: myLatlng,
    title:"My Current Location"
  });
  map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
  marker.setMap(map);
}

function create_circle() {
  var circle_params = {
      strokeColor: '#428bca',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#428bca',
      fillOpacity: 0.2,
      map: map,
      center: myLatlng,
      radius: 1000,
      editable: true,
      draggable: true,
      radius_changed: function(){ radius = circle.getRadius(); },
      center_changed: function(){ center = circle.getCenter(); },
  }
  var circle = new google.maps.Circle(circle_params);
}





