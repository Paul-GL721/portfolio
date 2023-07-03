

/*  Select if data is not nested */
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
        .text(String(option[$select.attr('data-displayKey')]));
      $select.append($option);
    
    });
    //multiselct reload the options
    $('#proskills, #projspecialisation, #projauthor').multiselect('rebuild');
  });
});


/*  Select when data is nested */
$('select[data-source1]').each(function() {
  var $select = $(this);
  $.ajax({
    type: "GET",
    url: $select.attr('data-source1'),
    dataType: "json",
  }).then(function(dataz) {
      $.each(dataz, function (i, item) {
        var valuekey = item[$select.attr('data-valueKey')];
        var fname =item.name.first;
        var mname =item.name.middle;
        var lname =item.name.last;
        //join to create a full name
        var fullname = fname.concat(" "+mname+" "+lname);
        
        $('select[data-source1][id]').append($('<option>', { 
          value: valuekey,
          text : fullname
        }));
      });
      //multiselct reload the options
      $('#proskills, #projspecialisation, #projauthor').multiselect('rebuild');
  });
}); 