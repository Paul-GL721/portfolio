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
					console.log(data);
					$("#projectUpdateModal").modal('show');					
					$("#projtitle").val(data.all_projs.ptitle);
					var originalprob = data.all_projs.problemStatement; //replace the "/" in the text
					$("#projproblem").val(originalprob.replace(/&amp;#x2F;/g, '/'));
					var originalsum = data.all_projs.psummary; //replace the "/" in the text
					$("#projsummary").val(originalsum.replace(/&amp;#x2F;/g, '/'));
					var originalsoln = data.all_projs.solution; //replace the "/" in the text
					$("#projsoln").val(originalsoln.replace(/&amp;#x2F;/g, '/'));
					$("#prorole").val(data.all_projs.role);
					var originalgitUrl = data.all_projs.githubUrl;
					$("#progithub").val(originalgitUrl.replace(/&#x2F;/g, '/'));
					$("#projcontibutor").val(data.all_projs.contributor);
					$(`#proskills option[value='${data.authorzproj._id}']`).prop('selected', true);
					//$("#proskills").val(data.skill);
					//$("#projauthor").val(data.author);
					//$("#projspecialisation").val(data.specialisation);
					$("#div1").attr("src", data.all_projs.mediaUrl.imageUrl);
					$("#div2").attr("src", data.all_projs.mediaUrl.videoUrl);
					$("#projectUpdateid").val(data.all_projs._id);	
				}
			});
		});
	});
});