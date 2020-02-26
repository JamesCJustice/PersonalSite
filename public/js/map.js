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

    let cityText = city.name;
      if(typeof city.forces !== 'undefined'){
      cityText += "[" + city.forces.length + "]";
    }

    $('#map_div').append('<div id="city_' + id + '" class="map_city_icon"></div>');
    $('#city_' + id)
      .text("X " + cityText)
      .css("top", y + "px")
      .css("left", x + "px")
      .click( () => map.displayCityInformation(i));  
  }

  for(let i = 0; i < mapData.forces.length; i++){
    let force = mapData.forces[i];
    if(typeof force.x !== 'undefined' && typeof force.y !== 'undefined'){
      let x = force.x * MapCoordsPixelScale;
      let y = (100 - force.y - 15) * MapCoordsPixelScale;

      $('#map_div').append('<div id="force_' + force.id + '" class="map_force_icon"></div>');
      $('#force_' + force.id)
        .text("[X]")
        .css("top", y + "px")
        .css("left", x + "px")
        .click( () => map.displayForceInformation(force.id));  
    }

  }
}

map.recenter = function(xMovement, yMovement){
  map.x += xMovement;
  map.y += yMovement;
  map.render();
}

map.displayCityInformation = function(cityId){
  let city = map.data.cities[cityId];
  city.id = cityId;
  $('#map_info_div')
    .css("visibility", "visible")
    .css("overflow-wrap", "break-word")
    .html(map.formatCityDetail(city));
}

map.displayForceInformation = function(forceId){
  let force = -1;
  for(let i = 0; i < map.data.forces.length; i++){
   if(map.data.forces[i].id == forceId){
    force = map.data.forces[i];
   }
  }

  $('#map_info_div')
    .css("visibility", "visible")
    .css("overflow-wrap", "break-word")
    .html(map.formatForceDetail(force));
}

map.formatForceDetail = function(force){
  let ret = "";
  if(typeof force.name !== 'undefined'){
    ret += "<b>" + force.name + "</b><br>";
  }
  if(typeof force.faction !== 'undefined'){
    ret += "Faction: " + force.faction + "<br>";
  }
  if(typeof force.orders !== 'undefined'){
    ret += "Orders: " + force.orders + "<br>";
  }
  if(typeof force.categories !== 'undefined'){
    ret += "Categories: " + force.categories.join(",") + "<br>";
  }
  if(typeof force.personnel !== 'undefined'){
    ret += "Personnel<br>";
    for(let i = 0; i < force.personnel.length; i++){
      let person = force.personnel[i];
      if(typeof person.archetype !== 'undefined'){
        ret += "&emsp;" + person.archetype + "<br>";
      }
      if(typeof person.extra !== 'undefined'){
        ret += "&emsp;&emsp;[" + person.extra + "]<br>";
      }
    }
  }
  return ret;
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
  if(typeof city.forces !== 'undefined'){
    ret += "<br>Forces in city:"
    for(let i = 0; i < city.forces.length; i++){
      let force = city.forces[i];
      let forceName = force.faction + ": " + force.name;
      ret += '<br><a id="city_' + city.id + "_force_" + force.id  + '" onclick="map.displayForceInformation(' + force.id + ');">' + forceName + "</a>"
    }
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