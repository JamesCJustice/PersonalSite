
module.exports = function(app){
  const fs = require('fs'),
    userAuthenticated = require('../middleware/userAuthenticated'),
    strategy = require('../strategy'),
    url = require('url'),
    ejs = require('ejs');

  app.get('/map', function(req, res){
    return res.render('map');
  });

  app.get('/map/cells/:x/:y', function(req, res){
    let x = req.params.x;
    let y = req.params.y;
    let mapCellData = strategy.getMapCell(x, y);
    return res.send(mapCellData);
  });
}