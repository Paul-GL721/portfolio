$('select[data-source]').each(function() {
  var $select = $(this);
  
  //$select.append('<option></option>');
  
  $.ajax({
    url: $select.attr('data-source'),
    dataType: "json",
  }).then(function(options) {
    options.map(function(option) {
      var $option = $('<option>');
      
      $option
        .val(option[$select.attr('data-valueKey')])
        .text(option[$select.attr('data-displayKey')]);
      
      $select.append($option);
    });
  });
});