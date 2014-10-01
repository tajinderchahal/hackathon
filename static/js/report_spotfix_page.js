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
    location_image = result.image_dict;
    open_joinspotfix(spotfix);
    current_loc_marker(spotfix.latitude, spotfix.longitude);
    if(spotfix.status == 'D') {
      $('.action').html('<button class="btn btn-green">SpotFixed !</button>');
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
  $('.photo_block').html('<img src="/'+ location_image[loc.id][0][0] +'" style="width:100%; max-width: 500px;"/>');
  $('.details .address').html(loc.address);
  $('.details .description').html(loc.description);
  $('.details .starttime').html(new Date(loc.starttime));
  $('.details .no_of_participants').html(loc.participate_no);
  $('.details .min_required').html(loc.min_required);
  $('.details .creator_name').html(loc.user__first_name + ' ' + loc.user__last_name);
  $('.details .phone_num').html(loc.user__phone_num);
  $('.details .sfid').html(loc.id);
  
  fb_share_click();
  $('#report_spotfix_form').submit(function(e) {
    e.preventDefault(); 
    var err_list = [];
    if(!$('.join_spotfix input[name="phone_num"]').val()){
      err_list.push('<div>Phone Number is required to report the Spot Fix</div>');
    }
    if(!$('.join_spotfix input[name="endtime"]').val()){
      err_list.push('<div>End Date and time is required to report the Spot Fix</div>');
    }
    if(!$('.join_spotfix input[name="spotfix_image"]').val()){
      err_list.push('<div>Select atleast one spotfix picture</div>');
    }
    if(err_list.length) {
      open_modal('Report Spotfix Alert', err_list.join(''), '');
      return false;
    }
    var formData = new FormData(this);
    $.ajax({
        url: '/spotfix/report/done',
        type: 'POST',
        data: formData,
        async: true,
        contentType: "application/json",
        dataType: 'text',
        success: function (data) {
          data = JSON.parse(data);
          if(data['status']){
            open_modal('Report SpotFix Alert', '<div class="text-success">Successfuly Reported the SpotFix drive</div> <br>' +
            '<div class="text-center"><button class="btn fb_share btn-facebook icon-fontello-facebook">' +
            ' &nbsp;Share on Facebook </button> </div>', '');
          } else {
            open_modal('Spotfix Alert', '<div class="text-danger"> Error while Reporting SpotFix</div>', '');
          }
        },
        cache: false,
        contentType: false,
        processData: false
    });
    return false;
  });
} 

function fb_share_click() {
  $('html').on('click', '.fb_share', function(e) {
    e.preventDefault()
    var parent_block = $('.join_spotfix');            
    var sfid = spotfix_id;
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
  $('input[name="endtime"]').datetimepicker({'format': 'YYYY-MM-DD HH:mm', pick12HourFormat: false });
  getspotfix();
});

