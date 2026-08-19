function setupContactFormValidation() {
  $("#contactForm").validate({
    errorClass: "formValidationError",
    
    rules: {
      contactreason: { required: true },
      contactname: { required: true, minlength: 3 },
      contactemail: { required: true, email: true },
      contactmessage: { required: true, minlength: 3 }
    },

    messages: {
      contactreason: {
        required: "Please select the reason for contacting"
      },
      contactname: {
        required: "I need your name to address you correctly",
        minlength: jQuery.validator.format("At least {3} characters required!")
      },
      contactemail: {
        required: "I need your email address to email you back",
        email: "Your email address must be in the format of name@domain.com"
      },
      contactmessage: {
        required: "Please type your message here",
        minlength: jQuery.validator.format("At least {3} characters required!")
      }
    },

    submitHandler: function(form) {
      const formData = $(form).serialize();
	  // Show spinner
      $("#submitSpinner").removeClass("d-none");
      $("#submitText").text("Sending...");

      $.ajax({
        url: "/portfolio",
        method: "POST",
        data: formData,
        dataType: "json",
        success: function(response) {
			// Replace the form content with the new partial (including success alert)
			$("#contact_form_div").html(response.html);

			// Re-bind validation to the new form
			setupContactFormValidation();

			// Smooth scroll to contact section
			$('html, body').animate({
				scrollTop: $('#contact_section').offset().top
			}, 600);

			// Auto-dismiss alert after 5 seconds
			setTimeout(() => {
				$('.alert-success').fadeOut('slow', function () {
				$(this).remove();
				});
			}, 5000);
        },
        error: function(xhr, status, error) {
          console.error(error);
          alert("An error occurred");
        }
      });
      return false;
    }
  });
}

$(document).ready(setupContactFormValidation);
