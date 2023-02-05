$(document).ready(function(){
	$(document).on("click", ".edit", function(){
		//get value of second column
		$(this).parents("tr").find("td").slice(1,2).each(function(){
			const updateid = $(this).html();
			$.ajax({
				type: "GET",
				url: "skill/update",
				dataType: "json",
				data: { updateid:updateid },
				success: function(data){
					console.log(data);
					location.href='skill/create';
					$("#skillname").val(data.update_skill.name);
					$("#skilldescription").val(data.update_skill.description);
					$("div1").attr("src", data.update_skill.imageUrl);
				}
			});
		});
	});
});