

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
    
    /*$('#contactForm').on('submit', function(event) {
      event.preventDefault();

      const formData = $(this).serialize(); 
      console.log("This is the form data", formData);

      $.ajax({
        url: "/portfolio",
        method: "POST",
        data: formData,  // serialized
        dataType: 'json',
        success: function(response) {
          console.log("This is the data from the server",response);
          
          $('#contact_form_div').html(response.html); 
          $("#contactForm")[0].reset();
          //$('#contactmodal').modal('show'); 
          alert("Message sent successfuly"); 
          //alert(response.success ? 'Message sent Successfully' : 'Message failed');
        },
        error: function(xhr, status, error) {
          console.error(error);
          alert('An error occurred');
        }
      });
    });*/

    /*$('#authorcreateid').ajaxForm(function() {
      alert('done with submission')

    });*/
});