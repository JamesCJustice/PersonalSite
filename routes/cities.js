module.exports = function(app){
  const fs = require('fs'),
    getHeaderData = require('../middleware/getHeaderData'),
    bodyParser = require('body-parser'),
    Maps = require('../strategy/map'),
    permissions = require('../permissions'),
    url = require('url'),
    ejs = require('ejs');

  app.get('/cities', getHeaderData, function(req, res){
    if(!permissions.isAdmin(req['headerData']['username'])){
      return res.redirect('/map');
    }
    return res.render('cities', req.headerData);
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
}