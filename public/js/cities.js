/*

  Regions Code
*/
var globalRegionsList = [];

function getRegionsData(){
  $.ajax({
      type: 'GET',
      url: "/regions/data",
      contentType: "application/json; charset=utf-8",
      success: buildRegions,
      error: function(error){
          console.log(error);
      }
  });
}

function buildRegions(regions){
  globalRegionsList = Array.from(regions); 

  let newRegion = {
    id: -1,
    name: "New Region"
  };
  regions.unshift(newRegion);
  for(let i in regions){
    buildRegionRow(regions[i]);
  }
  refreshCities();
}

function getRegionFields(){
  return ["name", "x", "y"];
}

function buildRegionRow(region){  
  let fields = getRegionFields();

  let row = `<div id="region_${region.id}_div" class="region_row"><button id="delete_region_${region.id}">x</button>`;

  for(let i in fields){
    let field = fields[i];
    let fieldValue = region[field] == 0 ? 0 : region[field] || "";
    row += `<label class="region_label">${field}</label><input type="text" name="${field}" value="${fieldValue}"></input>`;
    if((i+1) % 3 == 0){
      row +="<br>";
    }
  }
  row += `<button id="update_region_${region.id}">Update</button>`;
  row += "</div>";

  $("#regions_ul")
    .append(row);

  $("#delete_region_" + region.id)
    .click(function(){
      deleteRegion(region.id);
    });
  $("#update_region_" + region.id)
    .click(function(){
      updateRegion(region.id);
    });
}

function deleteRegion(id){
  $.ajax({
      type: 'POST',
      url: `/regions/${id}/delete`,
      contentType: "application/json; charset=utf-8",
      success: refreshRegions,
      error: function(error){
          console.log(error);
      }
  });
}

function updateRegion(id){
  let data = {
    id: id
  };

  let fields = getRegionFields();
  for(let i in fields){
    let field = fields[i];
    data[field] = $(`#region_${id}_div`)
      .children(`input[name="${field}"]`).val();
  }

  $.ajax({
      type: 'POSt',
      url: `/regions/${id}/update`,
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      success: refreshRegions,
      error: function(error){
          console.log(error);
      }
  });
}

function refreshRegions(){
  $("#regions_ul").empty();
  getRegionsData();
}

/*

  Cities Code
*/

function getCitiesData(){
  $.ajax({
      type: 'GET',
      url: "/cities/data",
      contentType: "application/json; charset=utf-8",
      success: buildCities,
      error: function(error){
          console.log(error);
      }
  });
}

function buildCities(cities){
  let newCity = {
    id: -1,
    name: "New city"
  };
  cities.unshift(newCity);
  for(let i in cities){
    buildCityRow(cities[i]);
  }
}

function getCityFields(){
  return ["name", "description", "population", "x", "y"];
}

function buildCityRow(city){
  
  let fields = getCityFields();

  let row = `<div id="city_${city.id}_div" class="city_row"><button id="delete_city_${city.id}">x</button>`;

  for(let i in fields){
    let field = fields[i];
    let fieldValue = city[field] || "";
    row += `<label class="city_label">${field}</label><input type="text" name="${field}" value="${fieldValue}"></input>`;
    if((i+1) % 3 == 0){
      row +="<br>";
    }
  }
  row += `<select id="city_${city.id}_region"></select>`;
  row += `<button id="update_city_${city.id}">Update</button>`;
  row += "</div>";

  $("#cities_ul")
    .append(row);

  $("#delete_city_" + city.id)
    .click(function(){
      deleteCity(city.id);
    });
  $("#update_city_" + city.id)
    .click(function(){
      updateCity(city.id);
    });

  let regionSelect = $(`#city_${city.id}_region`);
  for(let i in globalRegionsList){
    let region = globalRegionsList[i];
    regionSelect.append(`<option value="${region.id}">${region.name}</option>`);
  }
  regionSelect.val(city.region_id);

}

function deleteCity(id){
  $.ajax({
      type: 'POSt',
      url: `/cities/${id}/delete`,
      contentType: "application/json; charset=utf-8",
      success: refreshCities,
      error: function(error){
          console.log(error);
      }
  });
}

function updateCity(id){
  let data = {
    id: id
  };

  let fields = getCityFields();
  for(let i in fields){
    let field = fields[i];
    data[field] = $(`#city_${id}_div`)
      .children(`input[name="${field}"]`).val();
  }
  data.region_id = $(`#city_${id}_region`).val();
  $.ajax({
      type: 'POSt',
      url: `/cities/${id}/update`,
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      success: refreshCities,
      error: function(error){
          console.log(error);
      }
  });
}

function refreshCities(){
  $("#cities_ul").empty();
  getCitiesData();
}

$(document).ready(function(){
  getRegionsData();
});