$(document).ready(function() {
    $('.project-modal-link').on('click', function() {
      var projectId = $(this).data('project-id');
      $('#projectmodal-' + projectId).modal()
    });

    $('#contactForm').on('submit', function(event) {
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
    });  
});