
module.exports = function(app){
  const fs = require('fs'),
    getHeaderData = require('../middleware/getHeaderData'),
    strategy = require('../strategy'),
    url = require('url'),
    ejs = require('ejs');

  app.get('/map', function(req, res){
    return res.render('map');
  });

  app.get('/map/cells/:x/:y', getHeaderData, function(req, res){
    let x = req.params.x;
    let y = req.params.y;
    let mapCellData = strategy.getMapCell(x, y, req.headerData['username']);
    return res.send(mapCellData);
  });
}