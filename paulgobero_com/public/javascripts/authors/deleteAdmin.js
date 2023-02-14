
$(document).ready(function() {
	// body...
	var $table = $('#authortable')
	var $button = $('#authorbtnDelete')

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
				},
			});
			return row.authoridz;
		});

		$table.bootstrapTable('remove', {
			field: 'authoridz',
			values: authordel
		});
	});
});