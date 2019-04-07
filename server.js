const express = require('express'),
  app = express(),
  path = require('path'),
  session = require('express-session');

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
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

require('./routes/profile')(app);
require('./routes/index')(app);

app.get('*', function(req, res){
  res.render('notFound');
});


app.listen(PORT, function(){
 console.log("Listening"); 
});