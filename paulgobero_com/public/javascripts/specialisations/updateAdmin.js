$(document).ready(function(){
	$(document).on("click", ".specedit", function(){
		//get value of second column
		$(this).parents("tr").find("td").slice(1,2).each(function(){
			const updateid = $(this).html();
			$.ajax({
				type: "GET",
				url: "specialisation/update",
				data: { updateid:updateid },
				success: function(data){
					$("#SpecUpdateModal").modal('show');					
					$("#specialisationname").val(data.name);
					$("#specialisationdescription").val(data.description);
					$("#specUpdateid").val(data._id);
					
				}
			});
		});
	});
});