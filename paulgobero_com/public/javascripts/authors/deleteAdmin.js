
$(document).ready(function() {
	//show delete confirmation modal on clicking delete button
	$('#authorbtnDelete').on('click', function() {
		$('#deleteConfirmationModal').modal('show');
	});

	// body...
	var $table = $('#authortable')
	var $button = $('#confirmDeleteButton') 

	$button.click(function(){
		var authordel = $.map($table.bootstrapTable('getSelections'), function (row){
			var authorid = row['authoridz'];
			console.log("The id to delete is"+authorid);
			$.ajax({
				type: "POST",
				url: "author/delete",
				data: {authorid:authorid},
				success: function(data) {
					alert('Successfully Deleted from Table!');
					$('#deleteConfirmationModal').modal('hide');
					removeRowFromTable(authorid); // Remove the deleted row from the table
				},
				error: function(xhr, status, error) {
                    alert('Error deleting row: ' + error); // Handle error case
                }
			});
			return authorid;
		});

		function removeRowFromTable(authorid) {
			$table.bootstrapTable('remove', {
				field: 'authoridz',
				values: [authorid]
			});
		}
	});
});