/*
  Handles orders, delegating execution to other modules.
*/
const DatabasePath = './strategy.db';
const fs = require('fs'),
  Dice = require('../dice'),
  Db = require('../db').Db,
  DbSchema = require('../db').DbSchema,
  db = new Db(DatabasePath, true),
  Factions = require('./faction'),
  Maps = require('./map'),
  Forces = require('./force');

const schema = new DbSchema({
  path: DatabasePath,
  tables: [
    {
      name: 'faction_order',
      columns: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'faction_id INTEGER NOT NULL', // id of faction issuing order
        'user_id INTEGER NOT NULL', // id of user issuing order
        'order_type VARCHAR(255) NOT NULL', // Which module will perform this order
        'order_data TEXT NOT NULL', // json object with details of order
        'extra_info VARCHAR(255)', // Human-entered information
        'status VARCHAR(255)', // Completion status
        'executed DATETIME', // Date of execution
        'created DATETIME DEFAULT CURRENT_TIMESTAMP'
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

  getOrderById: async function getOrderById(orderId){
    orderId = parseInt(orderId);
    let results = db.select(`* FROM faction_order WHERE id = ${orderId}`);
    return results[0];
  },

  getFactionOrders: async function(factionId, includeExecuted=false){
    let cleanFactionId = parseInt(factionId);
    if(includeExecuted){
      return await db.select(`* FROM faction_order WHERE faction_id = ${cleanFactionId}`);
    }
    return await db.select(`* FROM faction_order WHERE faction_id = ${cleanFactionId} AND executed IS NULL`);
  },

  getAllOrders: async function(includeExecuted=false){
    let sql = '* FROM faction_order';
    sql += includeExecuted ? '' : ' WHERE executed IS NULL';
    return await db.select(sql);
  },

  getOrderModule: function getOrderModule(order){
    if(typeof order.order_type === 'undefined'){
      throw new Error("Order lacks a type " + JSON.stringify(order));
    }
    let orderType = order.order_type.toUpperCase();
    let moduleMap = {
      "FACTION": Factions,
      "CITY": Maps,
      "FORCES": Forces
    };
    if(typeof moduleMap[orderType] === 'undefined'){
      throw new Error(`Invalid order type ${orderType}`);
    }
    return moduleMap[orderType];
  },

  executeOrderById: async function(orderId){
    let order = await getOrderById(orderId);
    await executeOrder(order);
  },

  executeOrder: async function executeOrder(order){
    if(typeof order.id === 'undefined'){
      throw new Error('order lacks id ' + JSON.stringify(order));
    }
    let orderModule = getOrderModule(order);
    let status = 'successful';
    try{
      await orderModule.executeOrder(order);
    }
    catch(e){
      status = 'error: ' + e;
    }
    await db.run(`UPDATE faction_order SET executed = DATETIME('now'), status = '${status}' WHERE id = ${order.id}`);
  },

  cancelOrder: async function(orderId){
    await db.run(`UPDATE faction_order SET executed = DATETIME('now'), status = 'cancelled' WHERE id = ${orderId}`);
  },

  createOrder: async function createOrder(order){
    let orderRow = {};
    let fieldsToCopy = ['faction_id', 'user_id', 'order_type', 'extra_info'];
    fieldsToCopy.forEach(function(field){
      orderRow[field] = order[field];
    });
    orderRow.order_data = JSON.stringify(order.order_data);
    orderRow.status = 'pending';
    orderRow = [orderRow.faction_id, orderRow.user_id, orderRow.order_type, orderRow.order_data, orderRow.extra_info, orderRow.status];
    console.log("Creating order" + JSON.stringify(orderRow));
    await db.insert(`INTO faction_order(faction_id, user_id, order_type, order_data, extra_info, status) VALUES ($faction_id, $user_id, $order_type, $order_data, $extra_info, $status)`, [orderRow]);
  },

  createOrExecuteOrder: async function(order){
    let obj = this;
    if(order.id == -1){
      await obj.createOrder(order);
    }
    else{
      await obj.executeOrder(order);
    }
  }
}