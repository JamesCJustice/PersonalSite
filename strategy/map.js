// Cities and city management.
const DatabaseFile = './strategy.db';
const fs = require('fs'),
  Force = require('./force'),
  Db = require('../db').Db,
  DbSchema = require('../db').DbSchema,
  db = new Db(DatabaseFile);

const schema = new DbSchema({
  path: DatabaseFile,
  tables: [
    {
      name: 'city',
      columns: [ 
        'id INTEGER PRIMARY KEY AUTOINCREMENT', 
        'name VARCHAR(255)',
        'description TEXT',
        'population INTEGER',
        'x INTEGER',
        'y INTEGER',
        'gdp INTEGER', // Monthly
        'tax_rate INTEGER', // Out of 100
        'loyalty INTEGER',
        'faction_id INTEGER',
        'region_id INTEGER',
        'researchers INTEGER',
      ]
    },
    {
      name: 'city_research',
      columns: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'city_id INTEGER',
        'helper_city_id INTEGER',
        'progress INTEGER',
        'research_static_id INTEGER' // joins to research_static.id
      ]
    },
    {
      name: 'city_facility',
      columns: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'city_id INTEGER',
        `facility_static_id INTEGER` // joins to facility_static.id
      ]
    },
    {
      name: 'region',
      columns: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'name VARCHAR(255) NOT NULL',
        'x INTEGER NOT NULL',
        'y INTEGER NOT NULL'
      ]
    },
    {
      name: 'facility_static',
      columns: [
        'id INTEGER PRIMARY KEY',
        'name VARCHAR(255) NOT NULL',
        'maintenance INTEGER',
        'construction_cost INTEGER',
        'benefit TEXT',// JSON
        'description VARCHAR(255)'
      ]
    },
    {
      name: 'research_static',
      columns: [
        'id INTEGER PRIMARY KEY',
        'name VARCHAR(255)',
        'benefit TEXT', // JSON
        'description VARCHAR(255)',
        'cost INTEGER'
      ]
    },
    {
      name: 'research_static',
      columns: [
        'id INTEGER PRIMARY KEY',
        'name VARCHAR(255)',
        'benefit TEXT', // JSON
        'description VARCHAR(255)',
        'cost INTEGER'
      ]
    },
    {
      name: 'city_visibility',
      columns: [
        'id INTEGER PRIMARY KEY',
        'name VARCHAR(255)',
        'visibility ID', // 0 = NONE, 1 = name, 2 = description and facts, 3 = armies, 4 = spies
      ]
    },
  ]
});

module.exports = {
  install: async function(){
    await schema.install();
  },

  uninstall: async function(){
    await schema.uninstall();
  },

  getRegionData: async function(x, y){
    let region = getRegionByCoords(x, y);

    if(region.id == -1){
      return region;
    }

    region.cities = getCitiesByRegion(region.id);

    return region;
  },

  getRegionByCoords: async function(x, y){
    let rows = await db.select(` * from region WHERE x = ${x} AND y = ${y}`);

    if(rows.length < 1){
      return {
        id: -1,
        name: "No Data",
        x: x,
        y: y,
        cities: []
      };
    }
    return rows[0];
  },

  getCitiesByRegion: async function(regionId){
    let rows = db.select(` id FROM city WHERE region_id = ${regionId}`);
    let cities = [];
    for(let i in rows){
      let row = rows[i];
      cities.push(getCityById(row.id));
    }

  },

  getCityById: async function(id){
    let rows = db.select(` * FROM city WHERE id = ${id}`);
    if(rows.length < 1 || id == -1){
      throw new Error(`Invalid city id ${id}`);
    }
    let city = rows[0];

    city.research = db.select(`cf.id,
      fs.name,
      fs.benefit,
      fs.description,
      fs.construction_cost,
      fs.maintenance
      FROM city_facility cf WHERE city_id = ${id}
      JOIN facility_static fs ON cf.facility_static_id = fs.id`);

    city.facilities = db.select(` cr.id,
      cr.helper_city_id,
      cr.progress
      rs.name,
      rs.benefit,
      rs.description,
      rs.construction_cost,
      rs.maintenance
      FROM city_research cr WHERE city_id = ${id}
      JOIN research_static rs ON cr.research_static_id = rs.id`);

    city.forces = Force.getForcesByCity(id);

    return city;
  },

  getRegions: async function(){
    return await db.select("* FROM region");
  },

  createOrUpdateRegion: async function(region){
    this.validateRegion(region);
    let row = [ region.name, region.x, region.y];
    if(region.id == -1){
      return db.insert("INTO region (name, x, y) VALUES(?, ?, ?)", [row]);
    }
    row.push(region.id);
    return db.update(` region SET name = ?, x = ?, y = ? WHERE id = ?`, row);
  },

  validateRegion: function(region){
    return true; // TODO: Add legit validation
  },

  deleteRegion: async function(id){
    return await db.delete(`FROM region WHERE id = ${id}`);
  },

  getCities: async function(){
    return await db.select("* FROM city");
  },

  createOrUpdateCity: async function(city){
    this.validateCity(city);
    let row = [ city.name, city.description, city.population, city.x, city.y, city.gdp, city.tax_rate, city.loyalty, city.faction_id, city.region_id, city.researchers ];
    if(city.id == -1){
      return db.insert("INTO city (name, description, population, x, y, gdp, tax_rate, loyalty, faction_id, region_id, researchers) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [row]);
    }
    row.push(city.id);
    return db.update(` city SET name = ?, description = ?, population = ?, x = ?, y = ?, region_id = ? WHERE id = ?`, row);
  },

  validateCity: function(city){
    return true; // TODO: Legit validation
  },

  deleteCity: async function(id){
    return await db.delete(`FROM city WHERE id = ${id}`);
  },

  getMapRegion: async function(x, y, faction){
    let obj = this;
    let region = await obj.getRegionByCoords(x, y);
    region.cities = [];
    let cities = region.id > -1 ? await obj.getCitiesByRegion(region.id) : [];
    for(let i in cities){
      let city = cities[i];
      region.cities.push(city);
    }
    return region;
  },

  getRegionByCoords: async function(x, y){
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
  },

  getCitiesByRegion: async function(regionId){
    return db.select(`* FROM city WHERE region_id = ${regionId}`);
  }

}