function showLocation(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  $('input[name="latitude"]').val(latitude);
  $('input[name="longitude"]').val(longitude);
  current_loc_marker(latitude, longitude);
  get_address(latitude, longitude);
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
   } else {
      alert("Sorry, browser does not support geolocation!");
   }
}

function get_address(lat, lng){
  //$.getJSON('//maps.googleapis.com/maps/api/geocode/json', {'latlng': lat+','+lng, 'sensor': true},
  console.log('//maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&sensor=true');
  $.getJSON('//maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&sensor=true', {},
    function(result){
     if(result.status == 'OK'){
       $('textarea[name="address"]').val( result.results[0].formatted_address );
     }
  });
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
}

$(document).ready(function(){
  getLocation();
  $('input[name="starttime"]').datetimepicker({'format': 'YYYY-MM-DD HH:mm', pick12HourFormat: false });
  $('.current_location_btn').click(function(e){
    e.preventDefault();
    getLocation();
  });
 
  $('.camera_click_btn').click(function(e){
     e.preventDefault();
    $('.camera_pic').click();
  });

  $('.upload_pic_btn').click(function(e){
     e.preventDefault();
    $('.upload_pic').click();
  }); 

  $('.upload_pic, .camera_pic').change(function(e){
    handleFileSelect(e);
  });
 
  $('.close_image').click(function(e){
    e.preventDefault(); 
    $(this).parent().addClass('hide');
    $('.upload_pic, .camera_pic').val('');
  });

  $('#spotfix_form').submit(function(e){
    e.preventDefault();
    var err_list = [];
    if( !$('.upload_pic').val() && !$('.camera_pic').val()){
      err_list.push('<div>Upload or Click a picture of Spot !</div>');
    }
    if(!$('textarea[name="description"]').val()){
      err_list.push('<div>Description required for Spot !</div>');
    }
    if(!$('textarea[name="address"]').val()){
      err_list.push('<div>Address required for Spot !</div>');
    }
    if(!$('input[name="starttime"]').val()){
      err_list.push('<div>Start Time required for Spot !</div>');
    }
    if(!$('input[name="phone_num"]').val()){
      err_list.push('<div>Phone Number required for Spot !</div>');
    }
    if(!$('input[name="latitude"]').val() || !$('input[name="longitude"]').val()){
      err_list.push('<div>Location of Spot required !</div>');
    }
    if(err_list.length){
      open_modal('Spotfix Alert', err_list.join(''), '');
      return false;
    }

    var formData = new FormData(this);
      $.ajax({
        url: '/spotfix/create/new/',
        type: 'POST',
        data: formData,
        async: true,
        contentType: "application/json",
        dataType: 'text',
        success: function (data) {
          data = JSON.parse(data);
          if(data['status']){
            $('input, textarea').val('');
            open_modal('Spotfix Alert', 
              '<div class="text-success">Successfuly created</div> <br>' + 
              '<div class="text-center"><button class="btn btn-darkblue icon-fontello-facebook">' + 
              ' &nbsp;Share on Facebook </button> </div>', '');
          } else {
            open_modal('Spotfix Alert', '<div class="text-danger"> Error while creating SpotFix</div>', '');
          }
        },
        cache: false,
        contentType: false,
        processData: false
      });
  });
});

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object
  // Loop through the FileList and render image files as thumbnails.
  for (var i = 0, f; f = files[i]; i++) {
    // Only process image files.
    if (!f.type.match('image.*')) {
      continue;
    }
    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {
        // Render thumbnail.
        var source = e.target.result;
        $('.uploaded_picture .image_container').css('background', 'url('+ source +')');
        $('.uploaded_picture').removeClass('hide');
      };
    })(f);
    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
  }
}

