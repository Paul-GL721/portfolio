$(document).ready(function() {
	//show delete confirmation modal on clicking delete button
	$('#specbtnDelete').on('click', function() {
		$('#SpecdeleteConfirmationModal').modal('show');
	});

	// body...
	var $table = $('#spectable')
	var $button = $('#SpecconfirmDeleteButton') 

	$button.click(function(){
		var specdel = $.map($table.bootstrapTable('getSelections'), function (row){
			var specid = row['spec_id'];
			console.log("The spec id to delete is"+specid);
			$.ajax({
				type: "POST",
				url: "specialisation/delete",
				data: {specid:specid},
				success: function(data) {
					alert('Successfully Deleted from Table!');
					$('#SpecdeleteConfirmationModal').modal('hide');
					removeRowFromTable(specid); // Remove the deleted row from the table
				},
				error: function(xhr, status, error) {
                    alert('Error deleting row: ' + error); // Handle error case
                }
			});
			return specid;
		});

		function removeRowFromTable(specid) {
			$table.bootstrapTable('remove', {
				field: 'spec_id',
				values: [specid]
			});
		}
	});
});