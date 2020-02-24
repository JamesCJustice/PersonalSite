// JQuery required
// Builds map from map data
var map = {
  x: 0,
  y: 0,
  data: null
};
const MapCoordsPixelScale = 6;


map.render = function(){
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
  map.data = mapData;
  $('#map_title').text(mapData.name + " [" + mapData.x + "," + mapData.y + "]");

  $('#map_div').replaceWith('<div id="map_div" class="map_div"></div>');

  for(let i = 0; i < mapData.cities.length; i++){
    
    let city = mapData.cities[i];
    let id = "city_" + i + "_div";
    let x = city.x * MapCoordsPixelScale;
    let y = (100 - city.y - 15) * MapCoordsPixelScale;
    console.log("Placing " + city.name + " at [" + x + "," + y + "]" );

    $('#map_div').append('<div id="' + id + '" class="map_city_icon"></div>');
    $('#' + id)
      .text("X " + city.name)
      .css("top", y + "px")
      .css("left", x + "px")
      .click( () => map.displayCityInformation(i));  
  }
}

map.recenter = function(xMovement, yMovement){
  map.x += xMovement;
  map.y += yMovement;
  map.render();
}

map.displayCityInformation = function(cityId){
  console.log(map.data);
  let city = map.data.cities[cityId];
  $('#map_info_div')
    .css("visibility", "visible")
    .css("overflow-wrap", "break-word")
    .html(map.formatCityDetail(city));
}

map.formatCityDetail = function(city){
  let ret = "";
  if(typeof city.name !== 'undefined'){
    ret += city.name;
  }

  if(typeof city.description !== 'undefined'){
    ret += "<br>Description:<br>" + city.description;
  }
  if(typeof city.population !== 'undefined'){
    ret += "<br>Population: " + city.population
  }
  if(typeof city.faction !== 'undefined'){
    ret += "<br>Faction: " + city.faction; 
  }
  return ret;
}


$(document).ready(function(){
  map.render();
  $('#map_nav_nw').click( () => map.recenter(-1, 1));
  $('#map_nav_n').click( () => map.recenter(0, 1));
  $('#map_nav_ne').click( () => map.recenter(1, 1));
  $('#map_nav_w').click( () => map.recenter(-1, 0));
  $('#map_nav_e').click( () => map.recenter(1, 0));
  $('#map_nav_sw').click( () => map.recenter(-1, -1));
  $('#map_nav_s').click( () => map.recenter(0, -1));
  $('#map_nav_se').click( () => map.recenter(1, -1));
});