$(document).ready(function() {
	// body...
	var $table = $('skilltable')
	var $button = $('skillbtnDelete')

	$button.click(function(){
		var skildel = $.map($table.bootstrapTable('getSelections'), function (row){
			var skilid = row['skilid'];
			console.log(skilid);
			$.ajax({
				type: "POST",
				url: "http://localhost:3001/website/skill/delete",
				data: {skilid:skilid},
				success: function(data) {
					alert('Successfully Deleted from Table!');
				},
			});
			return row.skilid;
		});

		$table.bootstrapTable('remove', {
			field: 'skills_id',
			values: skildel
		});
	});
});