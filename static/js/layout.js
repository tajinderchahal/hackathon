
$(document).ready(function(){
  $('a.sidebar-btn').click(function(){
    if($('#container').hasClass('container-open')){
      $('#container').removeClass('container-open');
    } else {
      $('#container').addClass('container-open');
    }
  });
});
