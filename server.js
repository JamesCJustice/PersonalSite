const http = require('http'),
  url = require('url'),
  fs = require('fs'),
  express = require('express'),
  app = express(),
  sqlite3 = require('sqlite3').verbose(),
  session = require('express-session')
  ejs = require('ejs');

var files;
var LOCAL_ADDRESS;
var PORT = 8080; 

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  LOCAL_ADDRESS = add;
  console.log('Hosting on local address: ' + LOCAL_ADDRESS + ":" + PORT);
});

app.use(session({
  secret: "Ravioli, ravioli, give me the securioli!",
  resave: false,
  saveUninitialized: false
}));

require('./routes/profile')(app);
require('./routes/index')(app);

// Init databases
init_profile_db();

app.listen(PORT, function(){
 console.log("Listening"); 
});

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
