$('select[data-source]').each(function() {
  var $select = $(this);
  
  $.ajax({
    type: "GET",
    url: $select.attr('data-source'),
    dataType: "json",
  }).then(function(datas) {
    datas.map(function(option) {
      var $option = $('<option>');
      
      $option
        .val(option[$select.attr('data-valueKey')])
        .text(option[$select.attr('data-displayKey')]);
      $select.append($option);
      
    });
    console.log(datas)
    //multiselct reload the options
    $('#proskills, #projspecialisation, #projauthor').multiselect('rebuild');
  });
});