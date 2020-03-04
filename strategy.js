const fs = require('fs'),
  Db = require('./db').Db,
  db = new Db('strategy.db');

function install(){
  console.log('Creating city');
  let query = "";
  query += 'CREATE TABLE IF NOT EXISTS city (';
  query += 'id INTEGER PRIMARY KEY AUTOINCREMENT,';
  query += 'name VARCHAR(255),';
  query += 'description TEXT,';
  query += 'population INTEGER,';
  query += 'x INTEGER,';
  query += 'y INTEGER,';
  query += 'region_id INTEGER';
  query += ')';
  return db.run(query)
  .then(function(){
    console.log('Creating region');
    let query = "";
    query += 'CREATE TABLE IF NOT EXISTS region (';
    query += 'id INTEGER PRIMARY KEY AUTOINCREMENT,';
    query += 'name VARCHAR(255) NOT NULL,';
    query += 'x INTEGER NOT NULL,';
    query += 'y INTEGER NOT NULL';
    query += ');';
    return db.run(query); 
  });
}

function uninstall(){
  return db.run("DROP TABLE IF EXISTS city")
  .then(function(){
    return db.run("DROP TABLE IF EXISTS region");
  });
}

function getMapData(){
  let rawData = fs.readFileSync('./data/world.json');
  let mapData = JSON.parse(rawData);
  return mapData;
}

function getMapCell(x, y, faction){
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

  foundMapCell = filterPrivilegedData(foundMapCell, faction);

  return foundMapCell;
}

function filterPrivilegedData(data, faction){
  let factionName = faction || "";
  for(let i = 0; i < data.forces.length; i++){
    force = data.forces[i];
    if(!forceVisibleToFaction(force, factionName)){
      data.forces.splice(i, 1);
      i--;
    }
  }

  let privateCityFields = ['population', 'faction'];

  for(let i = 0; i < data.cities.length; i++){
    let city = data.cities[i];
    for(let j = 0; j < city.forces.length; j++){
      if(!forceVisibleToFaction(force, factionName)){
        city.forces.splice(j, 1);
        j--;
      }
    }
    if(!cityVisibleToFaction(city, factionName)){
      for(let j = 0; j < privateCityFields.length; j++){
        let field = privateCityFields[j];
        if(typeof city[field] !== 'undefined'){
          delete city[field];
        }
      }
    }
    city.id = i + 1;
  }

  return data;
}

function cityVisibleToFaction(city, faction){
  for(let i = 0; i < city.forces.length; i++){
    let force = city.forces[i];
    if(force.faction.toLowerCase() === faction.toLowerCase()){
      return true;
    }
  }
  return false;
}

function forceVisibleToFaction(force, faction){
  if(force.faction.toLowerCase() !== faction.toLowerCase()){
    return false;
  }

  return true;
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
        city.forces.push(force);
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

function getUserFaction(userName){
  let factionsData = getFactionsData();
  for(let i = 0; i < factionsData.factions.length; i++){
    let faction = factionsData.factions[i];
    for(let j = 0; j < faction.whitelist.length; i++){
      if(userName === faction.whitelist[j]){
        return faction.name;
      }
    }
  }
  return "";
}

function getAllForcesInFactions(factionsData){
  let ret = [];

  for(let i = 0; i < factionsData.factions.length; i++){
    let faction = factionsData.factions[i];

    for(let j = 0; j < faction.forces.length; j++){
      let force = faction.forces[j];
      force.id = ret.length;
      force.faction = faction.name;
      ret.push(force);
    }
  }

  return ret;
}

function isAdmin(username){
  return true;
}

function createOrUpdateCity(city){
  validateCity(city);
  let row = [ city.name, city.description, city.population, city.x, city.y, city.region_id ];
  if(city.id == -1){
    console.log("Insert city");
    return db.insert("INTO city (name, description, population, x, y, region_id) VALUES(?, ?, ?, ?, ?, ?)", row);
  }
  console.log("Update city");
  row.push(city.id);
  return db.update(` city SET name = ?, description = ?, population = ?, x = ?, y = ?, region_id = ? WHERE id = ?`, row);
}


function validateCity(city){
  return true;
}

function deleteCity(id){
  return db.delete(`FROM city WHERE id = ${id}`);
}

let factionsDataCache;
function getFactionsData(){
  if(factionsDataCache){
    return factionsDataCache;
  }
  let rawData = fs.readFileSync('./data/factions.json');
  let factionsData = JSON.parse(rawData);
  return factionsData;
}

async function getCities(){
  let mapData = getMapData();
  let cities = await db.select("* FROM city");
  
  return cities;
}

module.exports = {
  getMapData: getMapData,
  getMapCell: getMapCell,
  isAdmin: isAdmin,
  getCities: getCities,
  install: install,
  uninstall: uninstall,
  deleteCity: deleteCity,
  createOrUpdateCity: createOrUpdateCity
};