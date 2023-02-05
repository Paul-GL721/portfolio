
$(document).ready(function() {
	// body...
	var $table = $('#skilltable')
	var $button = $('#skillbtnDelete')

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
				},
			});
			return row.skills_id;
		});

		$table.bootstrapTable('remove', {
			field: 'skills_id',
			values: skildel
		});
	});
});