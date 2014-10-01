function get_spotfix(url) {
  $.getJSON('/spotfix/'+ url, {'user_id': spuser_id}, function(result){
    console.log(result);
    if(result['status']){
      draw_spotfix_block(result['locations'], url);
    } else {
      $('.spotfix_block').html('<h4 class="text-center">No Spotfix created yet !</h4>' + 
        '<div class="text-center"> <a role="button" class="btn btn-primary" href="/spotfix/create">Create Sporfix</a> </div>');
    } 
  });
}

function draw_spotfix_block(spdata, url){
  var html_str = '';
  var stats = 'Active';
  var end_spotfix;
  $.each( spdata, function(i, v){
    end_spotfix = '<div><a href="/spotfix/report/'+ v.id +'" class="btn btn-outlined btn-warning">Report Spotfix Completed</a></div>';
    stats = 'Active';
    if( v.status == 'C') { 
      stats= 'SpotFixed'; 
      end_spotfix = '<div><button class="btn btn-success">SPOTFIXED !</button></div>'; 
    }
    html_str += '<div class="rubix-panel-container" style="padding:10px 15px;">' + 
        '<div>Initiator Name: '+ v.user__first_name +' '+ v.user__last_name+'</div>' +
        '<div>Contact No.: '+ v.user__phone_num + '</div>' +
        '<div>Start Time: '+ new Date(v.starttime) + '</div>' +
        '<div>Address: '+ v.address + '</div>' +
        '<div>Status: '+ stats + '</div>' +
        '<a class="pull-right" href="/spotfix/join/'+ v.id +'">know more</a>' + end_spotfix +
      '</div>'
  });

  $('.spotfix_block').html(html_str);
}

