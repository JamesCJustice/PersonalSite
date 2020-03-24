// Cities and city management.
const DatabaseFile = './strategy.db';
const fs = require('fs'),
  Force = require('./force'),
  Db = require('../db').Db,
  Dice = require('../dice'),
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
    await this.populateFacilityStatic();
  },

  uninstall: async function(){
    await schema.uninstall();
  },

  populateFacilityStatic: async function(){
    let obj = this;
    await db.run("DELETE FROM item_static");
    let rawData = fs.readFileSync('./data/facility_static.json');
    let facilityData = JSON.parse(rawData); 
    let insertRows = [];
    for(let i in facilityData){
      let facility = facilityData[i];
      let id = i;
      let insertRow = [id, facility.name, facility.maintenance, facility.construction_cost, facility.benefit, facility.description];
      insertRows.push(insertRow);
    }
    await db.insert("INTO facility_static(id, name, maintenance, construction_cost, benefit, description) VALUES (?, ?, ?, ?, ?, ?)", insertRows);
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

  getCitiesByFaction: async function(factionId){
    let obj = this;
    let rows = await db.select(`* FROM city WHERE faction_id = '${factionId}'`);

    let cities = [];

    for(let i in rows){
      let row = rows[i];
      let city = await obj.getCityById(row.id);
      cities.push(city);
    }
    return cities;
  },

  getCityById: async function(id){
    let rows = await db.select(` * FROM city WHERE id = ${id}`);
    if(rows.length < 1 || id == -1){
      throw new Error(`Invalid city id ${id}`);
    }
    let city = rows[0];

    city.facilities = await db.select(`cf.id,
      fs.name,
      fs.benefit,
      fs.description,
      fs.construction_cost,
      fs.maintenance
      FROM city_facility cf
      JOIN facility_static fs ON cf.facility_static_id = fs.id
      WHERE cf.city_id = '${id}'`);

    // city.research = await db.select(` cr.id,
    //   cr.helper_city_id,
    //   cr.progress,
    //   rs.name,
    //   rs.benefit,
    //   rs.description,
    //   rs.cost
    //   FROM city_research cr
    //   JOIN research_static rs ON cr.research_static_id = rs.id
    //   WHERE cr.city_id = '${id}'`);

    city.forces = await Force.getForcesByCity(id);

    city.loyaltyBonuses = this.getCityLoyaltyBonuses(city);

    let gdpModifier = 1.0;
    city.gdpBonuses = this.getCityGdpBonuses(city);
    city.baseGdp = city.gdp;

    city.gdpBonuses.forEach(function(bonus){
      gdpModifier += bonus.value;
    });
    city.gdp *= gdpModifier;

    city.finances = this.getCityFinances(city);

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
        y: y,
        cities: []
      };
    }
    let region = rows[0];
    return region;
  },

  getCitiesByRegion: async function(regionId){
    return db.select(`* FROM city WHERE region_id = ${regionId}`);
  },

  getCityLoyaltyBonuses: function(city){
    let bonuses = [];
    
    // Facility bonuses
    let facilities = city.facilities;
    let facilityLoyaltyDict = {
      "government center": "+1d4",
      "law center": "+1d4",
      "recreation center": "+1d4"
    };
    let bonusDice = [];
    let facilityDict = {};
    facilities.forEach(function(facility){
      facilityDict[`${facility.name}`] = 1;
      if(typeof facilityLoyaltyDict[facility.name] !== 'undefined'){
        bonuses.push({
          value: facilityLoyaltyDict[facility.name],
          reason: facility.name
        });
        bonusDice.push(facilityLoyaltyDict[facility.name]);
      }
    });

    // TODO: research bonuses

    let total = Dice.combineDice(bonusDice);
    return {
      bonuses: bonuses,
      total: total
    };
  },

  getCityFinances: function(city){
    let obj = this;
    
    let finances = {
      revenue: 0,
      upkeep: 0,
      net: 0
    };    

    let tax_rate = city.tax_rate / 100.0;
    let taxes = tax_rate * city.gdp;

    for(let j in city.facilities){
      let facility = city.facilities[j];
      finances.upkeep += facility.maintenance;
    }

    finances.revenue += taxes;
    finances.net = finances.revenue - finances.upkeep;
    return finances;
  },

  getCityGdpBonuses: function(city){
    let bonuses = [];
    
    // Facility bonuses
    let facilities = city.facilities;
    let facilityGdpDict = {
      "trade center": 0.2,
      "port": 0.2,
      "industry center": 1,
    };
    let facilityDict = {};
    facilities.forEach(function(facility){
      facilityDict[`${facility.name}`] = 1;
      if(typeof facilityGdpDict[facility.name] !== 'undefined'){
        bonuses.push({
          value: facilityGdpDict[facility.name],
          reason: facility.name
        });
      }
    });

    // TODO: research bonuses

    return bonuses;
  }

}