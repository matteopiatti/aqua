$(document).ready(function() {

  $(function () {
    $('html').hover(function () {
      $('#navigation').animate({'opacity': '1'}, 300)
    }, function () {
      $('#navigation').animate({'opacity': '0'}, 300)
    });
  });
})