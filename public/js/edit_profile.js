var edit_profile = {};

edit_profile.submit = function(){
  let extra = {};
  $("input").each(function(index){
    extra[$( this ).attr('name')] = $( this ).val();
  });
  let data = { extra: extra };

  $.ajax({
      type: 'POST',
      url: "/edit/profile",
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      success: function(resp) {
          console.log("success!");
      },
      error: function(error){
          console.log(error);
      }
  });

};