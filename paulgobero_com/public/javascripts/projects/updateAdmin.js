$(document).ready(function(){
	$(document).on("click", ".projectedit", function(){
		//get value of second column
		$(this).parents("tr").find("td").slice(1,2).each(function(){
			const updateid = $(this).html();
			$.ajax({
				type: "GET",
				url: "project/update",
				data: { updateid:updateid },
				success: function(data){
					$("#projectUpdateModal").modal('show');					
					$("#projtitle").val(data.ptitle);
					$("#projproblem").val(data.problemStatement);
					$("#projsummary").val(data.psummary);
					$("#projsoln").val(data.solution);
					$("#prorole").val(data.role);
					$("#progithub").val(data.githubUrl);
					$("#projcontibutor").val(data.contributor);
					$("#proskills").val(data.skill);
					$("#projauthor").val(data.author);
					$("#projspecialisation").val(data.specialisation);
					$("#div1").attr("src", data.videoUrl);
					$("#projectUpdateid").val(data._id);	
				}
			});
		});
	});
});