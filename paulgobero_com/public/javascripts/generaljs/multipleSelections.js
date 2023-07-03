
$(document).ready(function() { 

  //intialise multiselect
  $('#proskills, #projspecialisation, #projauthor').multiselect({
      buttonWidth: '200px',
      enableFiltering: true,
      widthSynchronizationMode: 'ifPopupIsSmaller',
      includeSelectAllOption: true
  });
     
});  