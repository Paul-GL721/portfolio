$(document).ready(function(){
	$(document).on("click", ".authoredit", function(){
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
					$("#authorshortdesc").val(data.about.short_description);
					$("#authorfulldesc").val(data.about.full_description);
					$("#authorbrandname").val(data.brandName);
					$("#authoremail").val(data.email);
					var originalgitUrl = data.socialmedia.github;
					var originallinkUrl = data.socialmedia.linkedin;
					$("#githuburl").val(originalgitUrl.replace(/&#x2F;/g, '/'));
					$("#linkeninurl").val(originallinkUrl.replace(/&#x2F;/g, '/'));
					$("#div1").attr("src", data.imageUrl);
					$("#authorUpdateid").val(data._id);
					$("#authorpassword").val(data.password);
					$("#authorstatus").val(data.authorStatus);
					$("#authorRole").val(data.authorRole);
					
					
				}
			});
		});
	});

	$(document).on("click", "#authordetailbtnEdit", function(){
		//get value of second column
		const updateid = $("#author_idvalue").text();
		console.log('updated ')
		$.ajax({
			type: "GET",
			url: "update",
			data: { updateid:updateid },
			success: function(data){
				$("#authorUpdateModal").modal('show');					
				$("#authorfirstname").val(data.name.first);
				$("#authormiddlename").val(data.name.middle);
				$("#authorlastname").val(data.name.last);
				$("#authorshortdesc").val(data.about.short_description);
				$("#authorfulldesc").val(data.about.full_description);
				$("#authorbrandname").val(data.brandName);
				$("#authoremail").val(data.email);
				var originalgitUrl = data.socialmedia.github;
				var originallinkUrl = data.socialmedia.linkedin;
				$("#githuburl").val(originalgitUrl.replace(/&#x2F;/g, '/'));
				$("#linkeninurl").val(originallinkUrl.replace(/&#x2F;/g, '/'));
				$("#div1").attr("src", data.imageUrl);
				$("#authorUpdateid").val(data._id);
				$("#authorpassword").val(data.password);
				$("#authorstatus").val(data.authorStatus);
				$("#authorRole").val(data.authorRole);	
			}
		});
	});
});