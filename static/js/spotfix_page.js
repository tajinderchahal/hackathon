function current_loc_marker(latitude, longitude) {
  var myLatlng = new google.maps.LatLng(latitude, longitude);
  mapOptions = {
    zoom: 14,
    center: myLatlng
  };
  marker = new google.maps.Marker({
    position: myLatlng,
    title:"The Spot",
    //icon: "/static/image/green-pin.png"
  });
  map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
  marker.setMap(map);
}

function getspotfix() {
  $.getJSON('/spotfix/get_details', {'sf_id': spotfix_id}, function(result) {
    var spotfix = result.spotfix_details;
    location_image = result.image_dict;n
    open_joinspotfix(spotfix);
  });
}

function open_joinspotfix(loc) {
  $('.photo_block').html('<img src="'+ location_image[loc.id][0][0] +'" style="width:100%;"/>');
  $('.details .address').html(loc.address);
  $('.details .description').html(loc.description);
  $('.details .starttime').html(new Date(loc.starttime));
  $('.details .no_of_participants').html(loc.participate_no);
  $('.details .min_required').html(loc.min_required);
  $('.details .creator_name').html(loc.user__first_name + ' ' + loc.user__last_name);
  $('.details .phone_num').html(loc.user__phone_num);
  $('.details .sfid').html(loc.id);

  fb_share_click();
  $('#join_spotfix').click(function(){
    $.post('/join_spotfix', {'sf_id': spotfix_id }, function(result){
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

