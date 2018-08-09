// JQuery required.
var login = {};

login.login = function(){
    var username = $("#username_input").text();
    var password = $("#password_input").text();
    

    $.ajax({
        type: 'POST',
        url: "/auth",
        data: {
            username: username,
            password: password
        },
        dataType: 'json',
        success: function(validationResponse) {
            $("#response_div").text("Success!")
        },
        error: function(error){
            console.error(error);   
        }
    });
}