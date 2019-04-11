var edit_profile = {};

edit_profile.submit = function(){
  let extra = {};
  $("input").each(function(index){
    extra[$( this ).attr('name')] = $( this ).val();
  });
  let data = { extra: extra };

  $.ajax({
      type: 'POST',
      url: "/profile/edit",
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      success: function(resp) {
        window.location.href = resp.redirect;
      },
      error: function(error){
        console.log(error);
      }
  });

};

edit_profile.update_password = function(){
  let currentPass = $("#old_pass").val();
  let newPass     = $("#new_pass").val();
  let confirmPass = $("#confirm_pass").val();

  let data = {
    currentPass: currentPass,
    newPass: newPass,
    confirmPass: confirmPass
  };

  $.ajax({
      type: 'POST',
      url: "/profile/password/update",
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      success: function(resp) {
        //window.location.href = resp.redirect;
      },
      error: function(error){
        console.log(error);
      }
  });

};