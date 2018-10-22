// JQuery required.
// Collection of methods available on the login
var login = {};

login.login = function(){
    var username = $("#login_username_input").val();
    var password = $("#login_password_input").val();
    
    var data = {
        username: username,
        password: password
    };

    $.ajax({
        type: 'POST',
        url: "/authorize_profile",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        success: function(resp) {
            $("#response_div").text(resp.msg);
            $("#login_div").css("display: none");
        },
        error: function(error){
            var responseJSON = error.responseJSON;
            var msg = responseJSON.msg;
            $("#response_div").text(msg);
        }
    });
}

//TODO: Finish this
login.register = function(){
    var email = $("#reg_email_input").val();
    var username = $("#reg_username_input").val();
    var password = $("#reg_password_input").val();
    
    var data = {
        username: username,
        email: email,
        password: password
    };

    $.ajax({
        type: 'POST',
        url: "/register_profile",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        success: function(resp) {
            $("#response_div").text("Registration successful!");
            $("#login_div").css("display: none");
        },
        error: function(error){
            var responseJSON = error.responseJSON;
            console.log(error);
            var msg = responseJSON.msg;
            $("#response_div").text(msg);
        }
    });
}