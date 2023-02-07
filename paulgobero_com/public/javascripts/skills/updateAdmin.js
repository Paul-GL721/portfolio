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
					$("#skillUpdateModal").modal('show');					
					$("#skillname").val(data.name);
					$("#skilldescription").val(data.description);
					$("#div1").attr("src", data.imageUrl);
					$("#skillUpdateid").val(data._id);
					
				}
			});
		});
	});
});