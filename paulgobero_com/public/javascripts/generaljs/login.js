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
	$.ajax({
		type: "GET",
		url: "demologin/availablity",
		success: function(data){
			//console.log(data);
			if (data.status == true){
				$("#projectcreatedemouser").hide();
			}	
		}
	});

	/* Toggle login-logout buttons */
	//check cookies available in the document and split them by ; separator
	const cookies = document.cookie.split(';');
	let jwt;
	for (let i = 0; i < cookies.length; i++){
		const cookie = cookies[i].trim();
		if (cookie.startsWith('jwtTokens=')){
			jwt = cookie.substring('jwtTokens='.length, cookie.length);
			break;
		}
	}
	if (jwt !== 'undefined'){
		//show the logout button
		$('#projectlogin').hide();
		$('#projectlogout').show();
	} else {
		//show the login button
		$('#projectlogin').show();
		$('#projectlogout').hide();
	}


	//Get login details dor demouser and Toggle login demo button
    $('#loginbtn').click(function(){
        $.ajax({
			type: "GET",
			url: "/login",
			success: function(data){
				console.log(data);
				if (data.status == false){
					$(".loginerrors").text('Oops! Wrong Password or Username');
				}	
			}
		});
    });
}); 