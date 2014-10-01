function showLocation(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  current_loc_marker(latitude, longitude);
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
var markers = []
function show_spotfix_markers(locations) {
    var infowindow = new google.maps.InfoWindow();
    var marker, i;
    var icon;
    setAllMap(null);
    for (i = 0; i < locations.length; i++) {  
      icon = "/static/image/ongoing.png"
      if( new Date(locations[i].starttime) < new Date()) {
        if( locations[i].status == 'C'){
        icon = "/static/image/completed.png";
        } else {
          icon = "/static/image/active.png";
        }
      }
      //marker.setMap(null);
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(locations[i].latitude, locations[i].longitude),
        map: map,
        icon: icon
      });
      markers.push(marker);
      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          //infowindow.setContent(locations[i].description);
          //infowindow.open(map, marker);
          open_joinspotfix(locations[i]);
        }
      })(marker, i));
    }
}

// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  } 
  markers = [];
}

function current_loc_marker(latitude, longitude) {
  var myLatlng = new google.maps.LatLng(latitude, longitude);
  mapOptions = {
    zoom: 14,
    center: myLatlng
  };
  var marker = new google.maps.Marker({
    position: myLatlng,
    title:"My Current Location",
    icon: "/static/image/curr_loc.png"
  });
  map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
  marker.setMap(map);
  create_circle(map, myLatlng);
}

var dragc_timeout;
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
        clearTimeout(dragc_timeout);
        dragc_timeout  = setTimeout(function(){
          var center = circle.getCenter();  
          latitude = center.k;
          longitude = center.B;
          getspotfix(); 
        },200);
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
  var image_str = '';
  var border_clr;
  $.each(location_image[loc.id], function(i, v){
    border_clr = 'border: 5px solid rgb(209, 81, 57);';
    if(v[1] == 'A'){
      border_clr = 'border: 5px solid rgb(64, 189, 74);';
    }
    image_str += '<img class="center-block" src="'+ v[0] +'" style="width:90%; margin-bottom: 5px;'+ border_clr +'"/>'
  });
  $('.gallery_link').attr('href','/spotfix/gallery/' + loc.id );
  $('.photo_block').html(image_str);
  $('.details .title').html(loc.name || '-');
  $('.details .address').html(loc.address);
  $('.details .description').html(loc.description);
  $('.details .starttime').html(DF(loc.starttime));
  $('.details .no_of_participants').html(loc.participate_no);
  $('.details .min_required').html(loc.min_required);
  $('.details .creator_name').html(loc.user__first_name + ' ' + loc.user__last_name);
  $('.details .phone_num').html(loc.user__phone_num);
  $('.joinee_contact').show();
  if(loc.status == 'C'){
    $('.joinee_contact').hide();
    $('.details .endtime .data').html(DF(loc.endtime));
    $('.details .endtime').removeClass('hide');
  }
  $('.details .sfid').html(loc.id);

  var join_btn = '<div class="text-center"><button id="join_spotfix" class="btn btn-success center-block"> JOIN THIS SPOTFIX</button></div>';
  if(!user_id) { 
    join_btn = '<div class="text-center"><a href="/accounts/login" class="text-center">SIGN IN TO JOIN THIS SPOTFIX</a></div>'; 
  }
  var final_text = 'Join this SpotFix';
  if(loc.status == 'C') {
    join_btn = '<div class="text-center"><a role="button" href="/spotfix/join/'+ loc.id +
      '" class="text-center btn btn-outlined btn-success">SPOTFIXED !</a></div>';
    final_text = '<div class="text-success">SpotFixed !!!</div>'; 
  }
  var final_btn = join_btn + '<div><button class="fb_share btn btn-facebook center-block icon-fontello-facebook">&nbsp;Share on Facebook</button></div>';
  if(loc.status != 'C'){
    final_btn += '<div class="text-center"><a href="/spotfix/report/'+ loc.id +'" role="button" class="btn btn-outlined btn-warning"> REPORT SPOTFIX</button></div>';
  }
  open_modal(final_text, $('.join_spotfix').html(), final_btn); 
  fb_share_click();

  $('#join_spotfix').click(function() {
    if(!user_id) {
      window.location.href = '/accounts/login';
      return false;
    }
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
  $('html').on('click', '.fb_share', function(){
    var parent_block = $('.join_spotfix');            
    var sfid = parent_block.find('.sfid').html();
    var link = 'http://tajinderpalsingh.com/spotfix/join/' + sfid;
    var title = $('.details .title').html();
    var desc = parent_block.find('.description').html();
    var picture = 'http://tajinderpalsingh.com/' + parent_block.find('.photo_block img').attr('src');
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

