function setupContactFormValidation() {
  $("#contactForm").validate({
    errorClass: "formValidationError",
    
    rules: {
      contactname: { required: true, minlength: 3 },
      contactemail: { required: true, email: true },
      contactmessage: { required: true, minlength: 3 }
    },

    messages: {
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

      $.ajax({
        url: "/portfolio",
        method: "POST",
        data: formData,
        dataType: "json",
        success: function(response) {
          $("#contact_form_div").html(response.html);
          
          //Re-bind validation on the new form
          setupContactFormValidation();

          alert("Message sent successfully");
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
