$(document).ready(function(){
	$(document).on("click", ".edit", function(){
		//get value of second column
		$(this).parents("tr").find("td").slice(1,2).each(function(){
			const updateid = $(this).html();
			$.ajax({
				type: "GET",
				url: "author/update",
				data: { updateid:updateid },
				success: function(data){
					$("#authorUpdateModal").modal('show');					
					$("#authorfirstname").val(data.name.first);
					$("#authormiddlename").val(data.name.middle);
					$("#authorlastname").val(data.name.last);
					$("#mobilenumber").val(data.contact.phoneNumber.mobile);
					$("#worknumber").val(data..contact.phoneNumber.work);
					$("#authoremail").val(data.contact.email);
					$("#authorwebsite").val(data.contact.personal_website);
					$("#facebookurl").val(data.socialmedia.facebook);
					$("#twitterurl").val(data.socialmedia.twitter);
					$("#githuburl").val(data.socialmedia.github);
					$("#linkeninurl").val(data.socialmedia.linkedin);
					$("#div1").attr("src", data.imageUrl);
					$("#authorUpdateid").val(data._id);
					
				}
			});
		});
	});
});