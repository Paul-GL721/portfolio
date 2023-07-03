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

	let accessToken = null;
	let refreshToken = null;

	/* (1). Toggle login-logout buttons, (2) Show popup that prompts user to refresh session, 
	(3) Check the status every 5 seconds */
	setInterval(function(){
		//check cookies available in the document and split them by ; separator
		const cookies = document.cookie.split(';');
		
		for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].split('=');
			if (cookie[0] === 'jwtTokens') {
				//decode the url string
				const urldecodedcookie = decodeURIComponent(cookie[1]);
				//extract values from the second posit to the end; this removes the j
				const cookieValue = JSON.parse(urldecodedcookie.substring(2));
				accessToken = cookieValue.jwt;
				refreshToken = cookieValue.reftok;
				break;
			}
		}
		// Decode the jwt_token to extract the expiration time
		const splittoken = accessToken.split('.')
		const decodedToken = JSON.parse(atob(splittoken[1]));
		const exp = new Date(decodedToken.exp * 1000);
		//console.log(exp);
		//check if the token is expired or if expiration time is less than one minute, else the token is valid
		const currentTime = new Date();
		const timeUntilExpiry = exp - currentTime;
		if (timeUntilExpiry <= 0){
			//token is expired: show the login button
			$('#projectlogin').show();
			$('#projectlogout').hide();
		} else if (timeUntilExpiry < 60000){
			//token is about to expire allow the user to refresh it and stay signed in
			let istokenRefreshed = false;
			$('#loginout').modal('show');
			//stay signed in 
			$('#modalbtnstaysignedin').click(function(){
				//from the localstorage, get the current jwtToken cookie value
				//send a post request (with the cookie value) to the backend endpoint to refresh the token
				//if successfully refreshed , update the cookies value
				const expiryDate = new Date(Date.now() + 7 * 60 * 1000);
				$.ajax({
					type: "POST",
					data: { accessToken: accessToken, refreshToken: refreshToken },
					url: "/portfolio/refreshlogin",
					success: function(data){
						// If the request is successful, update the cookie with the value sent from the server
						var newjwt_token = data.jwt;
						var newrefresh_jwt_token = data.reftok;
						// Delete the existing cookie by setting its expiry time to a past date
						document.cookie = 'jwtTokens=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
						//set new cookies
						document.cookie = `jwtTokens=${encodeURIComponent('j:'+JSON.stringify({jwt:newjwt_token, reftok:newrefresh_jwt_token}))};path=/;expires=${expiryDate.toUTCString()}`;
						console.log("Updated cookie")
						istokenRefreshed = true;
					},
					error: function(xhr, status, error){
						// If there was an error, handle it here
						console.error(xhr.responseText);
					}
				});
			});
			//wait for 30 seconds, if no button is clicked and token is not refreshed log out the user
			setTimeout(function(){
				if (!$('#loginout').data('clicked') && !istokenRefreshed) {
					window.location.href = "/portfolio/logout";
				}
			}, 30000);	
		} else {
			// token is valid: show the logout button
			$('#projectlogin').hide();
			$('#projectlogout').show();
		}
	}, 5000);

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