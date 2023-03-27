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

	/* (1). Toggle login-logout buttons, (2) Show popup that prompts user to refresh session, 
	(3) Check the status every 5 seconds */
	setInterval(function(){
		//check cookies available in the document and split them by ; separator
		const cookies = document.cookie.split(';');
		let jwtToken = null;
		let refreshToken = null;

		for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].split('=');
			if (cookie[0] === 'jwtTokens') {
				//decode the url string
				const urldecodedcookie = decodeURIComponent(cookie[1]);
				//extract values from the second posit to the end; this removes the j
				const cookieValue = JSON.parse(urldecodedcookie.substring(2));
				jwtToken = cookieValue.jwt;
				refreshToken = cookieValue.reftok;
				break;
			}
		}
		// Decode the jwt_token to extract the expiration time
		const splittoken = jwtToken.split('.')
		const decodedToken = JSON.parse(atob(splittoken[1]));
		const exp = new Date(decodedToken.exp * 1000);
		console.log(exp);
		//check if the token is expired or if expiration time is less than one minute, else the token is valid
		const currentTime = new Date();
		const timeUntilExpiry = exp - currentTime;
		if (timeUntilExpiry <= 0){
			//token is expired: show the login button
			$('#projectlogin').show();
			$('#projectlogout').hide();
		} else if (timeUntilExpiry < 60000){
			//token is about to expire allow the user to refresh it and stay signed in
			$('#loginout').modal('show');
			//wait for 30 seconds, if no button is clicked log out the user anyway
			setTimeout(function(){
				if (!$('#loginout').data('clicked')) {
					window.location.href = "/website/logout";
				}
			}, 30000);
		} else {
			// token is valid: show the logout button
			$('#projectlogin').hide();
			$('#projectlogout').show();
		}
	}, 5000);

	//stay signed in 
	$('#modalbtnstaysignedin').click(function(){
        $.ajax({
			type: "GET",
			url: "/website/refreshlogin",
			success: function(data){
				console.log(data);
				if (data.status == true){
					//refreshed successfully
					; //do nothing
				}	
			}
		});
    });


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