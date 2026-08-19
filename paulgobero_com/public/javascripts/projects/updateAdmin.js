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
					var originalgitUrl = data.all_projs.githubUrl || "";
					$("#progithub").val(originalgitUrl.replace(/&#x2F;/g, '/'));
					$("#prolivelink").val((data.all_projs.livelinkUrl || "").replace(/&#x2F;/g, '/'));
					$("#projcontibutor").val(data.all_projs.contributor);
					$("#projslug").val(data.all_projs.slug || "");
					$("#projsubtitle").val(data.all_projs.subtitle || "");
					$("#projindustry").val(data.all_projs.industry || "");
					$("#projtype").val(data.all_projs.projectType || "");
					$("#projstatus").val(data.all_projs.status || "draft");
					$("#projfeaturedrank").val(data.all_projs.featuredRank || "");
					$("#projcontext").val(data.all_projs.context || "");
					$("#projconstraints").val((data.all_projs.constraints || []).join("\n"));
					$("#projarchitecture").val(data.all_projs.architectureSummary || "");
					$("#projarchitectureurl").val(data.all_projs.architectureDiagramUrl || "");
					$("#projmetrics").val((data.all_projs.metrics || []).map(function(metric) {
						return [metric.value, metric.label, metric.evidenceNote].filter(Boolean).join(" | ");
					}).join("\n"));
					$("#projdecisions").val((data.all_projs.decisions || []).map(function(decision) {
						return [decision.title, decision.context, decision.choice, decision.tradeoff].map(function(value) {
							return value || "";
						}).join(" | ");
					}).join("\n"));
					$("#projresults").val((data.all_projs.results || []).join("\n"));
					$("#projlessons").val((data.all_projs.lessonsLearned || []).join("\n"));
					$("#projusercount").val(data.all_projs.operationalProof?.userCount || "");
					$("#projrecordcount").val(data.all_projs.operationalProof?.recordCount || "");
					$("#projavailability").val(data.all_projs.operationalProof?.availability || "");
					$("#projdeploymentscale").val(data.all_projs.operationalProof?.deploymentScale || "");
					$("#projtestimonial").val(data.all_projs.testimonial?.quote || "");
					$("#projtestimonialperson").val(data.all_projs.testimonial?.person || "");
					$("#projtestimonialrole").val(data.all_projs.testimonial?.role || "");
					$("#projtestimonialorg").val(data.all_projs.testimonial?.organisation || "");
					$("#projtestimonialapproved").prop("checked", !!data.all_projs.testimonial?.approvedForPublication);
					$("#projarticle").val(data.all_projs.articleUrl || "");
					$("#projconfidential").prop("checked", !!data.all_projs.confidential);
					$(`#proskills option[value='${data.authorzproj._id}']`).prop('selected', true);
					//$("#proskills").val(data.skill);
					//$("#projauthor").val(data.author);
					//$("#projspecialisation").val(data.specialisation);
					$("#div1").attr("src", data.all_projs.mediaUrl.imageUrl);
					$("#div2").attr("src", data.all_projs.mediaUrl.videoUrl);
					$("#projectUpdateid").val(data.all_projs._id);	
					// Dates 
					if (data.all_projs.projectDates?.startDate) {
						$("#projstartDate").val(new Date(data.all_projs.projectDates.startDate).toISOString().split("T")[0]);
					} else {
						$("#projstartDate").val("");
					}
					if (data.all_projs.projectDates?.endDate) {
						$("#projendDate").val(new Date(data.all_projs.projectDates.endDate).toISOString().split("T")[0]);
					} else {
						$("#projendDate").val("");
					}
					if (data.all_projs.operationalProof?.operationalSince) {
						$("#projoperationalsince").val(new Date(data.all_projs.operationalProof.operationalSince).toISOString().split("T")[0]);
					} else {
						$("#projoperationalsince").val("");
					}
					// Checkbox (Show on Homepage) ===
					if (data.all_projs.checked) {
						$("#checked").prop("checked", true);
					} else {
						$("#checked").prop("checked", false);
					}
				}
			});
		});
	});
});
