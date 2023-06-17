
$(document).ready(function() {
	//show delete confirmation modal on clicking delete button
	$('#projectbtnDelete').on('click', function() {
		$('#projdeleteConfirmationModal').modal('show');
	});
	// body...
	var $table = $('#projecttable')
	var $button = $('#projconfirmDeleteButton')

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
					$('#projdeleteConfirmationModal').modal('hide');
				},
			});
			return row.projectidz;
		});

		$table.bootstrapTable('remove', {
			field: 'projectidz',
			values: projectdel
		});
	});
});