const fs = require('fs'),
  Db = require('./db').Db,
  db = new Db('strategy.db');

function install(){
  console.log("Installing city");
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
    console.log("Installing region");
    let query = "";
    query += 'CREATE TABLE IF NOT EXISTS region (';
    query += 'id INTEGER PRIMARY KEY AUTOINCREMENT,';
    query += 'name VARCHAR(255) NOT NULL,';
    query += 'x INTEGER NOT NULL,';
    query += 'y INTEGER NOT NULL';
    query += ');';
    return db.run(query); 
  })
  .then(function(){
    console.log("Installing faction");
    let query = "";
    query += 'CREATE TABLE IF NOT EXISTS faction (';
    query += 'id INTEGER PRIMARY KEY AUTOINCREMENT,';
    query += 'name VARCHAR(255) NOT NULL,';
    query += 'x INTEGER NOT NULL,';
    query += 'y INTEGER NOT NULL';
    query += ');';
    return db.run(query); 
  })
  .then(function(){
    console.log("Installing force");
    let query = "";
    query += 'CREATE TABLE IF NOT EXISTS force (';
    query += 'id INTEGER PRIMARY KEY AUTOINCREMENT,';
    query += 'name VARCHAR(255) NOT NULL,';
    query += 'force_types VARCHAR(255) NOT NULL,';
    query += 'x INTEGER,';
    query += 'y INTEGER,';
    query += 'city_id INTEGER';
    query += ');';
    return db.run(query); 
  })
  .then(function(){
    console.log("Installing unit");
    let query = "";
    query += 'CREATE TABLE IF NOT EXISTS unit (';
    query += 'id INTEGER PRIMARY KEY AUTOINCREMENT,';
    query += 'level INTEGER NOT NULL,';
    query += 'archetype_id INTEGER NOT NULL,';
    query += 'force_id INTEGER NOT NULL,';
    query += 'name VARCHAR(255) NOT NULL';
    query += ');';
    return db.run(query); 
  })
  .then(function(){
    console.log("Installing unit_archetype");
    let query = "";
    query += 'CREATE TABLE IF NOT EXISTS unit_archetype (';
    query += 'id INTEGER PRIMARY KEY AUTOINCREMENT,';
    query += 'data TEXT NOT NULL,';
    query += 'issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,';
    query += 'execution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
    query += ');';
    return db.run(query)
  })
  .then(function(){
    console.log("Installing unit_inventory_item");
    let query = "";
    query += 'CREATE TABLE IF NOT EXISTS unit_inventory_item (';
    query += 'id INTEGER PRIMARY KEY AUTOINCREMENT,';
    query += 'quantity INTEGER NOT NULL,';
    query += 'faction_id INTEGER NOT NULL,';
    query += 'unit_id INTEGER NOT NULL';
    query += ');';
    return db.run(query); 
  })
  .then(function(){
    console.log("Installing order");
    let query = "";
    query += 'CREATE TABLE IF NOT EXISTS faction_order (';
    query += 'id INTEGER PRIMARY KEY AUTOINCREMENT,';
    query += 'faction_id INTEGER NOT NULL,';
    query += 'text TEXT NOT NULL,';
    query += 'issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,';
    query += 'execution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
    query += ');';
    return db.run(query); 
  })
  .then(function(){
    console.log("Installing item_archetype");
    let query = "";
    query += 'CREATE TABLE IF NOT EXISTS item_archetype (';
    query += 'id INTEGER PRIMARY KEY AUTOINCREMENT,';
    query += 'name VARCHAR(255) NOT NULL,';
    query += 'damage VARCHAR(255) NOT NULL,';
    query += 'copper_cost INTEGER NOT NULL,';
    query += 'weight INTEGER NOT NULL,';
    query += 'description TEXT NOT NULL,';
    query += 'properties TEXT NOT NULL';
    query += ');';
    return db.run(query); 
  });
}

async function uninstall(){
  let tables = ["city", "region", "faction", "force", "unit", "unit_archetype", "unit_inventory_item", "faction_order", "item_archetype"];
  for(let i in tables){
    let table = tables[i];
    await db.run("DROP TABLE IF EXISTS " + table);
  }
}

function getForceTypes(){
  return ["spy", "scout", "army"];
}

function getMapData(){
  let rawData = fs.readFileSync('./data/world.json');
  let mapData = JSON.parse(rawData);
  return mapData;
}

async function getMapRegion(x, y, faction){
  let region = await getRegionByCoords(x, y);
  region.cities = [];
  let cities = region.id > -1 ? await getCitiesByRegion(region.id) : [];
  for(let i in cities){
    let city = cities[i];
    region.cities.push(city);
  }
  return region;
}

async function getRegionByCoords(x, y){
  let rows = await db.select(`* FROM region WHERE x = ${x} AND y = ${y}`);
  
  if(rows.length < 1){
    return {
      id: -1,
      name: "No Data",
      x: x,
      y: y,
      cities: []
    };
  }
  let region = rows[0];
  return region;
}

async function getCitiesByRegion(regionId){
  return db.select(`* FROM city WHERE region_id = ${regionId}`);
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
    return db.insert("INTO city (name, description, population, x, y, region_id) VALUES(?, ?, ?, ?, ?, ?)", row);
  }
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

async function getRegions(){
  let mapData = getMapData();
  let regions = await db.select("* FROM region");
  
  return regions;
}

function deleteRegion(id){
  return db.delete(`FROM region WHERE id = ${id}`);
}

function validateRegion(region){
  return true;
}

function createOrUpdateRegion(region){
  validateRegion(region);
  let row = [ region.name, region.x, region.y];
  if(region.id == -1){
    return db.insert("INTO region (name, x, y) VALUES(?, ?, ?)", row);
  }
  row.push(region.id);
  return db.update(` region SET name = ?, x = ?, y = ? WHERE id = ?`, row);
}



module.exports = {
  getMapData: getMapData,
  getMapRegion: getMapRegion,
  isAdmin: isAdmin,
  getCities: getCities,
  install: install,
  uninstall: uninstall,
  deleteCity: deleteCity,
  createOrUpdateCity: createOrUpdateCity,
  getRegions: getRegions,
  deleteRegion: deleteRegion,
  createOrUpdateRegion: createOrUpdateRegion
};