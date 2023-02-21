
$(document).ready(function() {
	// body...
	var $table = $('#projecttable')
	var $button = $('#projectbtnDelete')

	$button.click(function(){
		var projectdel = $.map($table.bootstrapTable('getSelections'), function (row){
			var projectid = row['projectidz'];
			console.log("The id to delete is"+projectid);
			$.ajax({
				type: "POST",
				url: "project/delete",
				data: {projectid:projectid},
				success: function(data) {
					alert('Successfully Deleted from Table!');
				},
			});
			return projectid;
		});

		$table.bootstrapTable('remove', {
			field: 'projectidz',
			values: projectdel
		});
	});
});