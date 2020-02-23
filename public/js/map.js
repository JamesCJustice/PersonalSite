// JQuery required
// Builds map from map data
var map = {
  x: 0,
  y: 0,
  data: null
};

map.render = function(){
  console.log("Render");
  $.ajax({
      type: 'GET',
      url: "/map/cells/" + map.x + "/" + map.y + "/",
      contentType: "application/json; charset=utf-8",
      success: map.renderMapData,
      error: function(error){
          console.log("Error");
          var responseJSON = error.responseJSON;
          console.log(error);
          $("#map_div").text("Error" + JSON.stringify(error));
      }
  });
}

map.renderMapData = function(mapData){
  this.data = mapData;
  $("#map_div").text(mapData.name);
}