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
  console.log(JSON.stringify(cities));
  let newCity = {
    id: -1,
    name: "New city"
  };
  cities.push(newCity);
  for(let i in cities){
    buildCityRow(cities[i]);
  }
}

function getCityFields(){
  return ["name", "description", "population", "region", "x", "y"];
}

function buildCityRow(city){
  console.log("City " + JSON.stringify(city));
  
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
  console.log("Updating " + JSON.stringify(data));
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
  getCitiesData();
});