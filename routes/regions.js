module.exports = function(app){
  const fs = require('fs'),
    getHeaderData = require('../middleware/getHeaderData'),
    bodyParser = require('body-parser'),
    Maps = require('../strategy/map'),
    permissions = require('../permissions'),
    url = require('url'),
    ejs = require('ejs');

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

}