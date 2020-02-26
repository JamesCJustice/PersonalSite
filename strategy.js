const fs = require('fs');


function getMapData(){
  let rawData = fs.readFileSync('./data/world.json');
  let mapData = JSON.parse(rawData);
  return mapData;
}

function getMapCell(x, y){
  let mapData = getMapData();
  const NoData = "No data";
  let foundMapCell = {
    name: NoData,
    x: x,
    y: y,
    cities: []
  };
  for(let i = 0; i < mapData.cells.length; i++){
    let cell = mapData.cells[i];
    if(cell.x == x && cell.y == y){
      foundMapCell = cell;
    }
  }
  if(foundMapCell.name === NoData){
    return foundMapCell;
  }

  let factionsData = getFactionsData();
  let forces = buildForcesData(factionsData, foundMapCell);
  foundMapCell.forces = forces;

  return foundMapCell;
}

function buildForcesData(factionsData, mapCell){
  let ret = [];
  let forces = getAllForcesInFactions(factionsData);

  buildForcesCityData(ret, forces, mapCell.cities);
  buildForcesWildernessData(ret, mapCell.name.toLowerCase(), forces);

  return ret;
}

function buildForcesCityData(foundForces, forces, cities){
  for(let i = 0; i < cities.length; i++){
    let city = cities[i];
    city.forces = [];
    for(let j = 0; j < forces.length; j++){
      let force = forces[j];
      if(force.location.toLowerCase() === city.name.toLowerCase()){
        foundForces.push(force);
        city.forces.push(force.faction + ": " + force.name);
      }
    }
  }
}

function buildForcesWildernessData(foundForces, cell, forces){
  for(let i = 0; i < forces.length; i++){
    let force = forces[i];
    let location = force.location.toLowerCase();
    let coords = location.match(/\d+/g);

    if(location.includes(cell) && coords.length > 0){
      force.x = coords[0];
      force.y = coords[1];
      foundForces.push(force);
    }
  }
}

function getAllForcesInFactions(factionsData){
  let ret = [];

  for(let i = 0; i < factionsData.factions.length; i++){
    let faction = factionsData.factions[i];

    for(let j = 0; j < faction.forces.length; j++){
      let force = faction.forces[j];
      force.faction = faction.name;
      ret.push(force);
    }
  }

  return ret;
}

function getFactionsData(){
  let rawData = fs.readFileSync('./data/factions.json');
  let factionsData = JSON.parse(rawData);
  return factionsData;
}

module.exports = {
  getMapData: getMapData,
  getMapCell: getMapCell
};