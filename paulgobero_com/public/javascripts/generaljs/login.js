$(document).ready(function() {  
    //Get login details dor demouser and Toggle login demo button
    $('#demologin').click(function(){
        $.ajax({
			type: "GET",
			url: "author/demologin/userinfo",
			success: function(data){
				$('#dloginbtn, #demologin').toggle();
				$("#demo_email").val(data.login_details.email);
				$("#demo_password").val(data.login_details.password);	
			},
			error: function(xhr, status, error){
				$("#demologinErrors").text('Oops! looks like you didnot add the DemoUSER to the database');
		    }
		});
    }); 
	
	/* If a Demo user exits, hide the 'create demo user' button */
	$(window).load(function(){ 
		$.ajax({
			type: "GET",
			url: "author/demologin/availablity",
			success: function(data){
				console.log(data);
				if (data.status == "true"){
					$("#projectcreatedemouser").hide();
				}	
			}
		});
	});
}); 