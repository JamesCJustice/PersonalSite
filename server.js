var http = require('http');
var url = require('url');
var fs = require('fs');
var files;
const express = require('express')
const app = express()
var sqlite3 = require('sqlite3').verbose();

var LOCAL_ADDRESS;
var PORT = 8080; 

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  LOCAL_ADDRESS = add;
  console.log('Hosting on local address: ' + LOCAL_ADDRESS + ":" + PORT);
});

require('./routes/profile')(app);

// Init databases
init_profile_db();

// Index
app.get('/', function(req, res){
  var file = 'public/html/index.html';
  serveFile(file, res);
});

// Login
app.get('/login', function(req, res){
  var file = 'public/html/login.html';
  serveFile(file, res);
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

app.listen(PORT, function(){
 console.log("Listening"); 
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
  var _res = res;
  console.log('Serving file:' + file);
  fs.readFile(file, function(err, data){
    _res.writeHead(200, {'Content-Type': 'text/html'});
    _res.write(data);
    _res.end();
  });
}

function init_profile_db(){
  var path = "profile.db";
  var db = new sqlite3.Database('profile.db');
  

  db.get("SELECT username FROM profile", function(err, row){
    if(err){
      create_profile_db();
    }
  });

}

function create_profile_db(){
  console.log("profile table doesn't exist. Creating.");
  var path = "profile.db";
  var db = new sqlite3.Database('profile.db');
  var query = "";
  query += 'CREATE TABLE profile (';
  query += 'username VARCHAR(255),';
  query += 'email VARCHAR(255),';
  query += 'password VARCHAR(255),';
  query += 'salt VARCHAR(255)';
  query += ')';
  db.run(query);
}
