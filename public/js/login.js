// JQuery required.
var login = {};

login.login = function(){
    var username = $("#login_username_input").val();
    var password = $("#login_password_input").val();
    console.log("Sending " + username + "," + password);
    var data = {
        username: username,
        password: password
    };

    $.ajax({
        type: 'POST',
        url: "/auth",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        success: function(validationResponse) {
            $("#response_div").text("Success!");
            $("#login_div").css("visibility: hidden");
        },
        error: function(error){
            var responseJSON = error.responseJSON;
            var msg = responseJSON.msg;
            $("#response_div").text(msg);
        }
    });
}