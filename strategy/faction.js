const DatabasePath = './strategy.db';
const fs = require('fs'),
  Db = require('../db').Db,
  DbSchema = require('../db').DbSchema,
  db = new Db(DatabasePath),
  Maps = require('./map');

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

  getFinances: async function(factionId){
    let cities = await Maps.getCitiesByFaction(factionId);
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

  getDashboardInfo: async function(factionId){
    let obj = this;
    return {
      finances: await obj.getFinances(factionId),
      cities: await Maps.getCitiesByFaction(factionId),
    }
  }

}