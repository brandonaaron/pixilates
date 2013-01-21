jQuery(function($) {
  var $form = $('form'),
      $uri = $('#imageUriInput'),
      $button = $('#pixelateButton');
  $form.bind('submit', function(event) {
    if (!$uri.val()) {
      $uri[0].disabled = true;
      $form
        .attr('enctype', 'multipart/form-data')
        .attr('method', 'post');
    }
    $button[0].value = "Pixelating...";
    $button[0].disabled = true;
  });
});
