var http = require('http');
var url = require('url');
var fs = require('fs');
var files;

var LOCAL_ADDRESS;
var PORT = 8080; 

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  LOCAL_ADDRESS = add;
  console.log('Hosting on local address: ' + LOCAL_ADDRESS + ":" + PORT);
});

//create a server object:
http.createServer(function (req, res) {
  var q = url.parse(req.url, true).query;
  var page = req.url.substr(1);
  console.log("page:" + page)
  var r = res;
  var file = page_to_file(page);
  serveFile(file, res);
}).listen(8080);

function page_to_file(page){
  if( typeof page === 'undefined' || page === ""){
    return "public/html/index.html";
  }
  else{
    console.log("Page defined as " + page);
  }

  var path = "public/html/" + page + ".html";
  if (fs.existsSync(path)) {
    return path;
  }

  path = "public/js/" + page;
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
