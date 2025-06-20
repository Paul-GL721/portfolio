

$(document).ready(function() {

  submitForm('#contactForm', '#contactmodal', '/portfolio');
  //submitForm('#authorcreateid', '#createAuthormodal', 'create' );

  $('.project-modal-link').on('click', function() {
    var projectId = $(this).data('project-id');
    $('#projectmodal-' + projectId).modal()
  });

  function submitForm(formId, modalId, posturl) {
    $(formId).ajaxForm({
      url: posturl,
      type: 'POST',
      dataType: 'html',
      success: function(data) {
        console.log('data is', data)
        $('#contact-section').html(data);
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
    
    /*$('#contactForm').on('submit', function(event) {
      event.preventDefault();
      $.ajax({
        url: "/",
        method: "POST",
        data: $(this).serialize(),
        success: function(response) {
          $("#contactForm")[0].reset();
          $('#contactmodal').modal('show');
        },
        error: function(error) {
          console.log(error);
          alert("An error occured while sending the message, please try again later")
        }
      });
    }); */ 
    /*$('#authorcreateid').ajaxForm(function() {
      alert('done with submission')

    });*/
});