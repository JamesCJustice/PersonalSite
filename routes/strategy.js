
module.exports = function(app){
  const fs = require('fs'),
    getHeaderData = require('../middleware/getHeaderData'),
    bodyParser = require('body-parser'),
    strategy = require('../strategy'),
    url = require('url'),
    ejs = require('ejs');

  app.use(bodyParser.json());

  app.get('/map', function(req, res){
    return res.render('map');
  });

  app.get('/map/cells/:x/:y', getHeaderData, function(req, res){
    let x = req.params.x;
    let y = req.params.y;
    let mapCellData = strategy.getMapCell(x, y, req.headerData['username']);
    return res.send(mapCellData);
  });

  app.get('/cities', getHeaderData, function(req, res){
    if(!strategy.isAdmin(getHeaderData['username'])){
      return res.redirect('/map');
    }
    return res.render('cities');
  });

  app.get('/cities/data', getHeaderData, async function(req, res){
    if(!strategy.isAdmin(getHeaderData['username'])){
      return res.send({});
    }
    try{
      let cities = await strategy.getCities();
      return res.send(cities);
    } catch(e) {
      console.log(e);
      return res.send({});
    }
    
  });

  app.post('/cities/:id/delete', getHeaderData, async function(req, res){
    if(!strategy.isAdmin(getHeaderData['username'])){
      return res.send({status: 403});
    }
    let success = 0;
    try {
      await strategy.deleteCity(req.params.id);
      success = 1;
    } catch(e) {
      console.error(e);
      success = 0;
    }
    return res.send({success: success});
  });

  app.post('/cities/:id/update', getHeaderData, async function(req, res){
    if(!strategy.isAdmin(getHeaderData['username'])){
      return res.send({status: 403});
    }
    let city = req.body;
    try {
      await strategy.createOrUpdateCity(city);
      res.send({success: 1}); 
    } catch(e) {
      console.error(e);
      res.send({success: 0});
    }
  });

  app.get('/regions/data', getHeaderData, async function(req, res){
    if(!strategy.isAdmin(getHeaderData['username'])){
      return res.send({});
    }
    try{
      let regions = await strategy.getRegions();
      return res.send(regions);
    } catch(e) {
      console.log(e);
      return res.send({});
    }
    
  });

  app.post('/regions/:id/delete', getHeaderData, async function(req, res){
    if(!strategy.isAdmin(getHeaderData['username'])){
      return res.send({status: 403});
    }
    let success = 0;
    try {
      await strategy.deleteRegion(req.params.id);
      success = 1;
    } catch(e) {
      console.error(e);
      success = 0;
    }
    return res.send({success: success});
  });

  app.post('/regions/:id/update', getHeaderData, async function(req, res){
    if(!strategy.isAdmin(getHeaderData['username'])){
      return res.send({status: 403});
    }
    let region = req.body;
    try {
      await strategy.createOrUpdateRegion(region);
      res.send({success: 1}); 
    } catch(e) {
      console.error(e);
      res.send({success: 0});
    }
  });

}