$(document).ready(function() {
    $('#demologin').click(function() {
        $.ajax({
            type: 'GET',
            url: '/portfolio/demologin/userinfo',
            success: function(data) {
                $('#dloginbtn, #demologin').toggle();
                $('#demo_email').val(data.login_details.email);
                $('#demo_password').val(data.login_details.password);
            },
            error: function() {
                $('#demologinErrors').text('The demo user has not been configured.');
            }
        });
    });

    $.ajax({
        type: 'GET',
        url: '/portfolio/demologin/availablity',
        success: function(data) {
            if (data.status === true) {
                $('#projectcreatedemouser').hide();
            }
        }
    });
});
