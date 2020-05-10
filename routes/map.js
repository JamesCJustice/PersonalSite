module.exports = function(app){
  const fs = require('fs'),
    getHeaderData = require('../middleware/getHeaderData'),
    bodyParser = require('body-parser'),
    Maps = require('../strategy/map'),
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

}