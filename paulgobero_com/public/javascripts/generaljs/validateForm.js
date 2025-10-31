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
		submitHandler: function(form,e) {
			e.preventDefault();
			const formsdata = new FormData($("#contactForm")[0]);
			/*console.log("formsdata is");
			console.log(formsdata);
			formsdata.has("contactmessage");
			// Display the values
			for (const value of formsdata.values()) {
				console.log(value);
			}*/
			form.submit(function(){
				alert("Message successfully sent");

			});
		}
	});
});