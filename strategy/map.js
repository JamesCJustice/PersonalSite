// Cities and city management.
const DatabaseFile = './strategy.db';
const fs = require('fs'),
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
        'x INTEGER',
        'y INTEGER',
        'region_id INTEGER',
        'researchers INTEGER',
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
    }
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
    let rows = await db.select(` * FROM city WHERE id = ${id}`);
    if(rows.length < 1 || id == -1){
      throw new Error(`Invalid city id ${id}`);
    }
    let city = rows[0];

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
    return db.update(` city SET name = ?, description = ?, population = ?, x = ?, y = ?, gdp = ?, tax_rate = ?, loyalty = ?, faction_id = ?, region_id = ?, researchers = ? WHERE id = ?`, row);
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
        y: y
      };
    }
    let region = rows[0];
    return region;
  },

  getCitiesByRegion: async function(regionId){
    return db.select(`* FROM city WHERE region_id = ${regionId}`);
  },
}