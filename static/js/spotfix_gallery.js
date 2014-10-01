function get_images(){
  $.getJSON('/spotfix/get_image', {'sf_id': spotfix_id}, function(result){
    if(result['status']){
      draw_image_block(result.image_list);
    }
  });
}

function draw_image_block(idata){
  var html_str = '';
  $.each(idata, function(i, v){
    cover_pic = '/' + v.image;
    console.log(cover_pic);
    html_str += '<div class="col-xs-12 col-sm-4 col-md-3 col-md-collapse-right photo_block" data-photo_id="'+
           v.id +'">' +
         '<div class="rubix-panel-container" style="overflow: visible;">' +
            '<div class="rubix-panel"> <div>' +
              '<div class="rubix-panel-header">' +
                '<div class="container-fluid rubix-grid gallery-item" style="z-index: 9981147;">' +
                  '<div class="row">' +
         '<div class="col-xs-12" style="padding: 12.5px;">' +
                      '<a class="gallery-1 gallery-item-link" href="'+ cover_pic +'">' +
                        '<img class="img-responsive" src="'+ cover_pic +'">' +
                        '<div class="black-wrapper text-center">' +
                          '<table class="table" style="height:100%;width:100%;">' +
                            '<tbody><tr><td><span class="rubix-icon icon-outlined-magnifier-plus icon-3x">' +
                          '</td></tr></table>' +
                      '</div></a>' +
                    '</div></div></div></div></div></div></div></div>';
  });
  $('.gallery_block').html(html_str);
}

function image_slider(container, item_cls){
  $(container).on('click', item_cls, function (e) {
    e.preventDefault();
    $(item_cls).removeClass('clicked')
    $(this).addClass('clicked')
    event = event || window.event;
    var index = $(item_cls).filter('.clicked').index(item_cls);
    var options = {
      index: index,
      event: event,
    };
    var links = $(this).parents(container).find(item_cls);
    blueimp.Gallery(links, options);
  });
}

$(document).ready(function(){
  get_images();
  image_slider('.gallery_block', '.gallery-item-link');
});
