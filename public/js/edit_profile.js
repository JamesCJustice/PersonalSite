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