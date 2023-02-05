$(document).ready(function() {
    $('body').on('change', '.imgz', (function() {
        readURL(this)
    }));
});