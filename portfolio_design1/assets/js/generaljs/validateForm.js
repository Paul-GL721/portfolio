$(document).ready(function() {
	$("#contactForm").validate({
		errorClass:"formValidationError",
				
		rules:{
			contactname: {
		      required: true,
		      minlength: 3
		    },
		    contactemail: {
		      required: true,
		      email: true
		    },
		    contactmessage: {
		      required: true,
		      minlength: 3
		    }
		},

		messages:{
			contactname: {
		      required: "I need your name to address you correctly",
		      minlength: jQuery.validator.format("At least {0} characters required!")
		    },
		    contactemail: {
		      required: "We need your email address to contact you",
		      email: "Your email address must be in the format of name@domain.com"
		    },
		    contactmessage: {
		      required: "Please type your message here",
		      minlength: jQuery.validator.format("At least {0} characters required!")
		    }
		}		
	});
});