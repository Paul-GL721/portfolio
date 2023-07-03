$(document).ready(function() {
    $('body').on('change', '.imgz', (function() {
        readURL(this)

        /*
		code to enalbe preview of the image before
		uploading it to the server.
		*/
		function readURL(input) {
		    if (input.files && input.files[0]) {
		        var reader = new FileReader();
		        var pic  = $(input).attr('set-to');
		        reader.onload = function (e) {
		            $('#'+pic).attr('src', e.target.result).width(70).height(100);
		        }

		        reader.readAsDataURL(input.files[0]);
		    }
		}
    }));
});