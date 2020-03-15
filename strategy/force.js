const StrategyFile = './strategy.db';
const fs = require('fs'),
  Db = require('../db').Db,
  DbSchema = require('../db').DbSchema,
  db = new Db(StrategyFile);

const schema = new DbSchema({
  path: StrategyFile,
  tables: [
    {
      name: 'force',
      columns: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'name VARCHAR(255) NOT NULL',
        'force_types VARCHAR(255) NOT NULL',
        `region_id INTEGER`,
        'x INTEGER',
        'y INTEGER',
        'city_id INTEGER',
        'faction_id INTEGER'
      ]
    },
    {
      name: 'unit',
      columns: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'xp INTEGER',
        'stat_block_id INTEGER NOT NULL', // Joins to stat_block_static.id
        'force_id INTEGER NOT NULL',
        'name VARCHAR(255) NOT NULL',
        'race_static_id VARCHAR(255)' // Joins to race_static.id
      ]
    },
    {
      name: 'stat_block_static',
      columns: [
        'id INTEGER PRIMARY KEY',
        'data TEXT NOT NULL' // JSON
      ]
    },
    {
      name: 'unit_item',
      columns: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'item_id INTEGER NOT NULL',
        'unit_id INTEGER NOT NULL'
      ]
    },
    {
      name: 'item_static',
      columns: [
        'id INTEGER PRIMARY KEY',
        'data TEXT' // JSON
      ]
    },
    {
      name: `race_static`,
      columns: [
        'id INTEGER PRIMARY KEY',
        'name VARCHAR(255)',
        'data TEXT' // JSON
      ]
    }

  ]
});

module.exports = {
  install: async function(){
    await schema.install();
    this.populate_item_static(); // This chains, because SQLite3 needs it to
  },

  uninstall: async function(){
    await schema.uninstall();
  },

  getForcesByCity: async function(cityId){
    let rows = await db.select(` id FROM force WHERE city_id = ${cityId}`);
    let forces = [];
    for(let i in rows){
      let row = rows[i];
      forces.push(await getForceById(row.id));
    }
    return forces;
  },

  getForceById: async function (id){
    let rows = await db.select(` * FROM force WHERE city_id = ${id}`);
    if(rows.length < 1 || id == -1){
      throw new Error(`Invalid force id ${id}`);
    }
    let force = rows[0];
    force.units = [];
    rows = await db.select(`id FROM unit WHERE force_id = ${id}`);

    for(let i in rows){
      let row = rows[i];
      force.units.append(await getUnitById(row.id));
    }
    return force;
  },

  getUnitById: async function(id){
    let rows = await db.select(`
      u.xp,
      u.name,
      rs.name as 'race',
      rs.data as 'raceData',
      sbs.data as 'stat',

      FROM unit u WHERE id = ${id}
      JOIN race_static rs ON rs.id = u.race_static_id
      JOIN stat_block_static sbs ON sbs.id = u.stat_block_id
    `);
    if(rows.length < 1 || id == -1){
      throw new Error(`Invalid unit id ${id}`);
    }

    let unit = rows[0];
    unit.raceData = JSON.parse(unit.raceData);
    rows = await db.select(`
      is.data as 'data'
      FROM unit_item ui WHERE unit_id = ${id}
      JOIN item_static is ON ui.item_id = is.id
    `);

    unit.inventory = [];
    for(let i in rows){
      let row = rows[i];
      unit.inventory.push(JSON.parse(row.data));
    }
    return item;
  },

  populate_item_static: async function(){
    let obj = this;
    await db.run("DELETE FROM item_static");
    let rawData = fs.readFileSync('./data/item_static.json');
    let itemData = JSON.parse(rawData); 
    let insertRows = [];
    for(let i in itemData){
      let item = itemData[i];
      let id = i;
      let data = JSON.stringify(item);
      let insertRow = [id, data];
      insertRows.push(insertRow);
    }
    await db.insert("INTO item_static(id, data) VALUES (?, ?)", insertRows);
    obj.populate_race_static();
  },

  populate_race_static: async function(){
    let obj = this;
    await db.run("DELETE FROM race_static");
    let rawData = fs.readFileSync('./data/race_static.json');
    let raceData = JSON.parse(rawData);
    let insertRows = [];
    for(let i in raceData){
      let race = raceData[i];
      let id = i;
      let name = race.name;
      let data = JSON.stringify(race);
      let insertRow = [id, name, data];
      insertRows.push(insertRow);
    }
    await db.insert("INTO race_static(id, name, data) VALUES (?, ?, ?)", insertRows);
    obj.populate_stat_block_static();
  },

  populate_stat_block_static: async function(){
    await db.run("DELETE FROM stat_block_static");
    let rawData = fs.readFileSync('./data/stat_block_static.json');
    let statData = JSON.parse(rawData);
    let insertRows = [];
    for(let i in statData){
      let stat = statData[i];
      let id = i;
      let data = JSON.stringify(stat);
      let insertRow = [id, data];
      insertRows.push(insertRow);
    }
    await db.insert("INTO stat_block_static(id, data) VALUES (?, ?)", insertRows);
  },
}