function showLocation(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  current_loc_marker(latitude, longitude);
  get_address(latitude, longitude);
}

function errorHandler(err) {
  console.log(err);
  if(err.code == 1) {
    alert("Error: Geo loction access is denied!");
  } else if( err.code == 2) {
    alert("Error: Position is unavailable!");
  }
}

function getLocation(){
   if(navigator.geolocation){
      // timeout at 60000 milliseconds (60 seconds)
      var options = { timeout:60000 };
      navigator.geolocation.getCurrentPosition(showLocation, errorHandler, options);
   } else {
      alert("Sorry, browser does not support geolocation!");
   }
}

function get_address(lat, lng){
  //$.getJSON('//maps.googleapis.com/maps/api/geocode/json', {'latlng': lat+','+lng, 'sensor': true},
  console.log('//maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&sensor=true');
  $.getJSON('//maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&sensor=true', {},
    function(result){
     console.log(result);
  });
}

function show_spotfix_markers(locations) {
    var infowindow = new google.maps.InfoWindow();
    var marker, i;
    for (i = 0; i < locations.length; i++) { 
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(locations[i].latitude, locations[i].longitude),
        map: map
      });
      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          //infowindow.setContent(locations[i].description);
          //infowindow.open(map, marker);
          open_joinspotfix(locations[i]);
        }
      })(marker, i));
    }
}

function current_loc_marker(latitude, longitude) {
  var myLatlng = new google.maps.LatLng(latitude, longitude);
  mapOptions = {
    zoom: 14,
    center: myLatlng
  };
  marker = new google.maps.Marker({
    position: myLatlng,
    title:"My Current Location",
    //icon: "/static/image/green-pin.png"
  });
  map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
  marker.setMap(map);
  create_circle(map, myLatlng);
}

function create_circle(map, myLatlng) {
  var circle_params = {
      strokeColor: '#428bca',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#428bca',
      fillOpacity: 0.2,
      map: map,
      center: myLatlng,
      radius: radius,
      editable: true,
      draggable: true,
      radius_changed: function(){ radius = circle.getRadius();  getspotfix(); },
      center_changed: function(){ 
        var center = circle.getCenter();  
        latitude = center.k;
        longitude = center.B;
        getspotfix(); 
      },
  }
  var circle = new google.maps.Circle(circle_params);
  getspotfix();
}


function getspotfix() {
  $.getJSON('/get_spotfix', {'latitude': latitude, 'longitude': longitude , 'radius': radius}, function(result) {
    show_spotfix_markers(result.locations);
    locations = result.locations; 
    location_image = result.image_dict
    var ard = radius > 1000 ? parseInt(radius)/1000 + ' kms' : parseInt(radius) + ' meters';
    var str = locations.length ? locations.length +' Spotfix Found in vicinity of ' + ard : 'No Spotfix found in vicinity of ' + ard; 
    $('.result_stats').html(str);
  });
}

function open_joinspotfix(loc) {
  console.log(loc);
  $('.photo_block').html('<img src="'+ location_image[loc.id][0][0] +'" style="width:100%;"/>');
  $('.details .address').html(loc.address);
  $('.details .description').html(loc.description);
  $('.details .starttime').html(new Date(loc.starttime));
  $('.details .no_of_participants').html(loc.participate_no);
  $('.details .min_required').html(loc.min_required);
  $('.details .creator_name').html(loc.user__first_name + ' ' + loc.user__last_name);
  $('.details .phone_num').html(loc.user__phone_num);
  $('.details .sfid').html(loc.id);

  open_modal('Join this SpotFix', $('.join_spotfix').html(), 
    '<button class="fb_share btn btn-facebook icon-fontello-facebook">&nbsp;Share on Facebook</button>&nbsp;&nbsp;' + 
    '<button id="join_spotfix" class="btn btn-success"> JOIN THIS SPOTFIX </button>');
  fb_share_click();
  $('#join_spotfix').click(function(){
    if(!$('.modal-body input[name="phone_num"]').val()){
      alert('Phone Number is required to join the Spot Fix');
      return false;
    }
    $.post('/join_spotfix', 
      {'sf_id': $('.join_spotfix .sfid').html(),
       'phone_num': $('.modal-body input[name="phone_num"]').val()  }, 
      function(result){
      result = JSON.parse(result);
      if(result['status'] == 1){
        open_modal('Join SpotFix Alert', '<div class="text-success">Successfuly Joined the SpotFix drive</div> <br>' +
          '<div class="text-center"><button class="btn fb_share btn-facebook icon-fontello-facebook">' +
          ' &nbsp;Share on Facebook </button> </div>', '');
      } else if(result['status'] == 2){
        open_modal('Join SpotFix Alert', '<div class="text-success">Already joined this Spotfix drive</div> <br>' +
          '<div class="text-center"><button class="btn fb_share btn-facebook icon-fontello-facebook">' +
          ' &nbsp;Share on Facebook </button> </div>', '');
      } else {
        open_modal('Join SpotFix Alert', '<div class="text-danger">Error while joining this Spotfix drive</div> <br>' +
          '<div class="text-center"><button class="btn fb_share btn-facebook icon-fontello-facebook">' +
          ' &nbsp;Share on Facebook </button> </div>', '');
      }
      fb_share_click();
    });
  });
} 

function fb_share_click(){
  $('.fb_share').click(function(){
    var parent_block = $('.join_spotfix');            
    var sfid = parent_block.find('.sfid').html();
    var link = 'http://tajinderpalsingh.com/spotfix/join/' + sfid;
    var title = 'Let\'s Clean this Spot';
    var desc = parent_block.find('.description').html();
    var picture = 'http://tajinderpalsingh.com' + parent_block.find('.photo_block img').attr('src');
    share_content(link, title, desc, picture, sfid);
  });
}

var latitude;
var longitude;
var radius = 1000;
var locations = [];
var location_image;

$(document).ready(function(){
  getLocation();
});

