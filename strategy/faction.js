const DatabasePath = './strategy.db';
const fs = require('fs'),
  Dice = require('../dice'),
  Db = require('../db').Db,
  DbSchema = require('../db').DbSchema,
  db = new Db(DatabasePath),
  Maps = require('./map'),
  Forces = require('./force');

const schema = new DbSchema({
  path: DatabasePath,
  tables: [
    {
      name: 'faction',
      columns: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'name VARCHAR(255) NOT NULL',
        'user VARCHAR(255)' // Username of controller
      ]
    }
  ]
});

module.exports = {
  install: async function(){
    schema.install();
  },

  uninstall: async function(){
    schema.uninstall();
  },

  deleteFaction: async function(id){
    return db.delete(`FROM faction WHERE id = ${id}`);
  },

  createOrUpdateFaction: async function(faction){
    this.validateFaction(faction);
    let row = [ faction.name, faction.user];
    if(faction.id == -1){
      return db.insert("INTO faction (name, user) VALUES(?, ?)", [row]);
    }
    row.push(faction.id);
    return db.update(` faction SET name = ?, user = ? WHERE id = ?`, row);
  },

  validateFaction: function(faction){
    return true; // TODO: Legit validation when the data firms up
  },

  getFactions: async function(){
    return await db.select("* FROM faction");
  },

  getFactionByUsername: async function(username){
    let rows = await db.select(`* FROM faction WHERE user = '${username}'`);
    if(rows.length > 0){
      let faction = rows[0];
      return faction.id;
    }
    return -1;
  },

  getFinancesInfo: function(cities){
    let finances = {
      revenue: 0,
      upkeep: 0,
      net: 0
    }; 

    cities.forEach(function(city){
      let cityFinances = city.finances;
      finances.revenue += cityFinances.revenue;
      finances.upkeep += cityFinances.upkeep;
    });

    finances.net = finances.revenue - finances.upkeep;

    return finances;
  },

  getMilitaryInfo: function(forces){
    let info = {
      defendingUnits: 0,
      defendingForces: 0,
      mobilizedForces: 0,
      mobilizedUnits: 0
    };
    forces.forEach(function(force){
      if(force.city_id == -1){
        info.mobilizedForces += 1;
        info.mobilizedUnits += force.units.length;
      }
      else{
        info.defendingForces += 1;
        info.defendingUnits += force.units.length;
      }
    });
    return info;
  },

  getCivicsInfo: function(cities){
    let info = {
      totalLoyaltyBonuses: "",
      totalLoyalty: 0,
      loyalCities: 0,
      neutralCities: 0,
      unloyalCities: 0
    };
    let bonusDice = [];
    cities.forEach(function(city){
      if(typeof city.loyaltyBonuses.total !== 'undefined'){
        bonusDice.push(city.loyaltyBonuses.total);
      }
      info.totalLoyalty += city.loyalty;
      if(city.loyalty > 30){
        info.loyalCities += 1;
      }
      else if(city.loyalty > 0){
        info.neutralCities += 1;
      }
      else{
        info.unloyalCities += 1;
      }
    });
    info.totalLoyaltyBonuses = Dice.combineDice(bonusDice);
    return info;
  },

  getDashboardInfo: async function(factionId){
    let obj = this;
    let cities = await Maps.getCitiesByFaction(factionId);
    let finances = obj.getFinancesInfo(cities);
    let forces = await Forces.getForcesByFaction(factionId);
    let military = obj.getMilitaryInfo(forces);
    let civics = obj.getCivicsInfo(cities);
    return {
      finances: finances,
      cities: cities,
      military: military,
      forces: forces,
      civics: civics,
    };
  },

  executeOrder: async function(order){
    let obj = this;
    console.log("Executing order " + JSON.stringify(order));
  }

}