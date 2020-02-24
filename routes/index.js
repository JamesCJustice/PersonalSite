module.exports = function(app){
  const fs = require('fs'),
    userAuthenticated = require('../middleware/userAuthenticated'),
    url = require('url'),
    ejs = require('ejs');

  app.get('/', userAuthenticated, function(req, res){
    let data = req.headerData;

    res.render('index', data);
  });
}