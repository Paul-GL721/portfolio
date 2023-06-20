
$(document).ready(function() {
	//show delete confirmation modal on clicking delete button
	$('#skillbtnDelete').on('click', function() {
		$('#skilldeleteConfirmationModal').modal('show');
	});
	// body...
	var $table = $('#skilltable')
	var $button = $('#skillconfirmDeleteButton')

	$button.click(function(){
		var skildel = $.map($table.bootstrapTable('getSelections'), function (row){
			var skilid = row['skills_id'];
			console.log(skilid);
			$.ajax({
				type: "POST",
				url: "skill/delete",
				data: {skilid:skilid},
				success: function(data) {
					alert('Successfully Deleted from Table!');
					$('#skilldeleteConfirmationModal').modal('hide');
					removeRowFromTable(skilid); // Remove the deleted row from the table
				},
				error: function(xhr, status, error) {
                    alert('Error deleting row: ' + error); // Handle error case
                }
			});
			return skilid;
		});

		function removeRowFromTable(skilid) {
			$table.bootstrapTable('remove', {
				field: 'skills_id',
				values: [skilid]
			});
		}
	});
});