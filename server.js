const http = require('http'),
  url = require('url'),
  fs = require('fs'),
  express = require('express'),
  app = express(),
  sqlite3 = require('sqlite3').verbose(),
  session = require('express-session'),
  ejs = require('ejs'),
  profile = require('./profile');

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

app.listen(PORT, function(){
 console.log("Listening"); 
});

profile.install();