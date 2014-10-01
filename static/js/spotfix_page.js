function current_loc_marker(latitude, longitude, stat) {
  var myLatlng = new google.maps.LatLng(latitude, longitude);
  mapOptions = {
    zoom: 14,
    center: myLatlng,
    scrollwheel: false
  };
  marker = new google.maps.Marker({
    position: myLatlng,
    title:"The Spot",
    icon: (stat == 'C' ? "/static/image/completed.png" : "/static/image/ongoing.png")
  });
  map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
  marker.setMap(map);
}

function getspotfix() {
  $.getJSON('/spotfix/get_details', {'sf_id': spotfix_id}, function(result) {
    var spotfix = result.spotfix_details;
    location_image = result.image_dict;
    open_joinspotfix(spotfix);
    current_loc_marker(spotfix.latitude, spotfix.longitude, spotfix.status);
    if(spotfix.status == 'C') {
      $('.action').html('<button class="btn btn-success">SpotFixed !</button>');
      $('.report, .joinee_contact').addClass('hide');
      $('.endtime').removeClass('hide');
    } else if (!user_id){
      $('.action').html('<div class="text-center"><a href="/accounts/login" class="text-center">SIGN IN TO JOIN THIS SPOTFIX</a></div>');
    }
    var plist_str = '';
    $.each(result.plist, function(i, v){
      plist_str += '<div style="padding: 5px 0px;"><img src="'+ v.user__profile_image +'" class="img-circle" width="40"/>' + 
        ' <span style="margin-left: 5px;"><a href="/profile/'+ v.user_id+'">' + v.user__first_name + ' ' + v.user__last_name + 
        '</a></span> <span class="pull-right" style="position: relative; top: 8px;">' + v.user__phone_num + '</span></div>'
    });
    $('.details .participants_list').html(plist_str);
    $('.see_plist').click(function(e){
      e.preventDefault();
      $('.participants_list').removeClass('hide');
    });
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
    image_str += '<img class="center-block" src="/'+ v[0] +'" style="width:90%; margin-bottom: 5px;'+ border_clr +'"/>'
  });
  $('.gallery_link').attr('href','/spotfix/gallery/' + loc.id );
  $('.photo_block').html(image_str);
  $('.join_spotfix .name').html(loc.name);
  $('.details .address').html(loc.address);
  $('.details .description').html(loc.description);
  $('.details .starttime').html(DF(loc.starttime));
  $('.details .endtime .data').html(DF(loc.endtime));
  $('.details .no_of_participants').html(loc.participate_no);
  $('.details .min_required').html(loc.min_required);
  $('.details .creator_name').html(loc.user__first_name + ' ' + loc.user__last_name);
  $('.details .phone_num').html(loc.user__phone_num);
  $('.details .sfid').html(loc.id);
  
  fb_share_click();
  $('#join_spotfix').click(function(){
    if(!$('.modal-body input[name="phone_num"]').val()){
      alert('Phone Number is required to join the Spot Fix');
      return false;
    } 
    $.post('/join_spotfix', {'sf_id': spotfix_id, 'phone_num': $('.modal-body input[name="phone_num"]').val() }, function(result){
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
    var title = parent_block.find('.name').html();
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
  getspotfix();
});

