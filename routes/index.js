
module.exports = function(app){
  const fs = require('fs'),
    userAuthenticated = require('../middleware/userAuthenticated'),
    url = require('url'),
    ejs = require('ejs');

  app.get('/', userAuthenticated, function(req, res){
    let data = {
      loggedIn: req.session.loggedIn,
      username: req.session.username
    };

    res.render('index', data);
  });

  // Request arbitrary public file
  app.get('/public', function(req, res){
    var q = url.parse(req.url, true).query;
    var file = q.file;
    console.log("file " + file);
    
    file = string_to_file(file);
    if(file === 'public/html/notfound.html'){
      console.log("File not found");
    }
    serveFile(file, res);
  });

  function string_to_file(file){
    if( typeof file === 'undefined' || file === ""){
      return 'public/html/notfound.html';
    }
    else{
      console.log("File defined as " + file);
    }

    var path = "public/html/" + file;
    if (fs.existsSync(path)) {
      return path;
    }

    path = "public/js/" + file;
    if (fs.existsSync(path)) {
      return path;
    }  

    return 'public/html/notfound.html';
  }

  function getFiles(_path){
    var path = typeof _path !== 'undefined' ?  _path  : '.';
    console.log("Path=" + path);
    fs.readdir(path, function(err, items) {
      files = items;
      console.log('found' + files);
    });
  }

  function serveFile(file, res){
    console.log('Serving file:' + file);
    fs.readFile(file, function(err, data){
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
    });
  }
}