module.exports = function(app){
  const fs = require('fs'),
    getHeaderData = require('../middleware/getHeaderData'),
    bodyParser = require('body-parser'),
    Factions = require('../strategy/faction'),
    Maps = require('../strategy/map'),
    Orders = require('../strategy/order'),
    permissions = require('../permissions'),
    url = require('url'),
    ejs = require('ejs');

  app.use(bodyParser.json());

  app.get('/map', function(req, res){
    return res.render('map', req.headerData);
  });

  app.get('/map/regions/:x/:y', getHeaderData, async function(req, res){
    try{
      let x = parseInt(req.params.x);
      let y = parseInt(req.params.y);
      if(isNaN(x) || isNaN(y)){
        throw new Error(`Invalid input ${req.params.x}, ${req.params.y}`);
      }
      let mapRegionData = await Maps.getMapRegion(x, y, req.headerData['username']);
      return res.send(mapRegionData);
    }catch(e){
      console.log(e);
      return res.send({name: "Error"});
    }
  });

  app.get('/cities', getHeaderData, function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.redirect('/map');
    }
    return res.render('cities', req.headerData);
  });

  app.get('/factions', getHeaderData, function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.redirect('/map');
    }
    return res.render('factions', req.headerData);
  });

  app.get('/orders', getHeaderData, function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.redirect('/map');
    }
    return res.render('orders', req.headerData);
  });

  app.get('/cities/data', getHeaderData, async function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.send({});
    }
    try{
      let cities = await Maps.getCities();
      return res.send(cities);
    } catch(e) {
      console.log(e);
      return res.send({});
    }
    
  });

  app.post('/cities/:id/delete', getHeaderData, async function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.send({status: 403});
    }
    let success = 0;
    try {
      await Maps.deleteCity(req.params.id);
      success = 1;
    } catch(e) {
      console.error(e);
      success = 0;
    }
    return res.send({success: success});
  });

  app.post('/cities/:id/update', getHeaderData, async function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.send({status: 403});
    }
    let city = req.body;
    try {
      await Maps.createOrUpdateCity(city);
      res.send({success: 1}); 
    } catch(e) {
      console.error(e);
      res.send({success: 0});
    }
  });

  app.get('/regions/data', getHeaderData, async function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.send({});
    }
    try{
      let regions = await Maps.getRegions();
      return res.send(regions);
    } catch(e) {
      console.log(e);
      return res.send({});
    }
    
  });

  app.post('/regions/:id/delete', getHeaderData, async function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.send({status: 403});
    }
    let success = 0;
    try {
      await Maps.deleteRegion(req.params.id);
      success = 1;
    } catch(e) {
      console.error(e);
      success = 0;
    }
    return res.send({success: success});
  });

  app.post('/regions/:id/update', getHeaderData, async function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.send({status: 403});
    }
    let region = req.body;
    try {
      await Maps.createOrUpdateRegion(region);
      res.send({success: 1}); 
    } catch(e) {
      console.error(e);
      res.send({success: 0});
    }
  });


  app.get('/factions/data', getHeaderData, async function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.send({});
    }
    try{
      let factions = await Factions.getFactions();
      return res.send(factions);
    } catch(e) {
      console.log(e);
      return res.send({});
    }
    
  });

  app.post('/factions/:id/delete', getHeaderData, async function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.send({status: 403});
    }
    let success = 0;
    try {
      await Factions.deleteFaction(req.params.id);
      success = 1;
    } catch(e) {
      console.error(e);
      success = 0;
    }
    return res.send({success: success});
  });

  app.post('/factions/:id/update', getHeaderData, async function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.send({status: 403});
    }
    let faction = req.body;
    try {
      await Factions.createOrUpdateFaction(faction);
      res.send({success: 1}); 
    } catch(e) {
      console.error(e);
      res.send({success: 0});
    }
  });

  app.get('/factions/manage', getHeaderData, async function(req, res){
    let username = req['headerData']['username'];
    let faction = await Factions.getFactionByUsername(username);
    console.log("Faction " + faction);
    if(faction != -1){
      res.render('manage_faction', req.headerData);
      return; 
    }
    res.render('map', req.headerData);
  });

  app.get('/faction/dashboard/:id', getHeaderData, async function(req, res){
    let username = req['headerData']['username'];
    let faction = await Factions.getFactionByUsername(username);
    console.log(`${faction} vs ${req.params.id}`);
    if(faction != -1 && faction == req.params.id){
      let data = await Factions.getDashboardInfo(faction);
      res.send(data);
      return; 
    }
    res.send({success: 0});
  });

  app.get('/orders/data', getHeaderData, async function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.send({});
    }
    try{
      let factions = await Orders.getAllOrders();
      return res.send(factions);
    } catch(e) {
      console.log(e);
      return res.send({});
    }
    
  });

  app.post('/orders/:id/delete', getHeaderData, async function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.send({status: 403});
    }
    let success = 0;
    try {
      await Orders.cancelOrder(req.params.id);
      success = 1;
    } catch(e) {
      console.error(e);
      success = 0;
    }
    return res.send({success: success});
  });

  app.post('/orders/:id/update', getHeaderData, async function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.send({status: 403});
    }
    let order = req.body;
    try {
      await Orders.createOrExecuteOrder(order);
      res.send({success: 1}); 
    } catch(e) {
      console.error(e);
      res.send({success: 0});
    }
  });

}