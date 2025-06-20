

$(document).ready(function() {

  //submitForm('#contactForm', '#contactmodal', '/portfolio');
  //submitForm('#authorcreateid', '#createAuthormodal', 'create' );

  $('.project-modal-link').on('click', function() {
    var projectId = $(this).data('project-id');
    $('#projectmodal-' + projectId).modal()
  });

  function submitForm(formId, modalId, posturl) {
    $(formId).ajaxForm({
      url: posturl,
      type: 'POST',
      dataType: 'json',
      success: function(data) {
        console.log('data is', data)
        $('#contact-div').html(data.html);
      },
      error: function(error) {
        console.log(error);
        alert("An error occurred when submitting the form" + formId);
      }
    });
  }
    

    //function to submit forms
    /* On success, clear the form and show a message */
    /*function submitForm (formId, modalId, posturl) {
      $(formId).on('submit', function(event){
        event.preventDefault();
        var formData = new FormData($(formId)[0]);
        //console.log(formData);
        alert("submit in  process successfull");
        $.ajax({
          url:  'http://localhost:3002/portfolio/author/create',
          method: 'POST',
          dataType: 'json',
          data: formData,
          success: function(data){
            
            //const data = JSON.parse(response);
            console.log('The data is', JSON.stringify(data));
            $(formId)[0].reset();
            $(modalId).modal('show');
          },
          error: function(error){
            console.log(error);
            alert("An error occured when submitting the form" + formId)
          }
        })
      })
    }*/    
    
    $('#contactForm').on('submit', function(event) {
      event.preventDefault();
      var formData = new FormData($('#contactForm')[0]);
      console.log('data is sent successfully');
      $.ajax({
        url: "/portfolio",
        method: "POST",
        data: formData,
        processData: false, 
        contentType: false,
        dataType: 'json',
        success: function(response) {
          console.log("response is");
          console.log(response);
          $("#contactForm")[0].reset();
          $('#contactmodal').modal('show');
          $('#contact-div').html(response.html); 
        },
        error: function(xhr, status, error) {
          console.error("An error occurred: ", error);
          alert('An error occured while receiving data from server');
        }
      });
    });  
    /*$('#authorcreateid').ajaxForm(function() {
      alert('done with submission')

    });*/
});