var http = require('http');
var url = require('url');
var fs = require('fs');
var files;
//create a server object:
http.createServer(function (req, res) {
  var q = url.parse(req.url, true).query;
  var r = res;
  var file = page_to_file(q.page);
  if(file == ''){
    serveFile('templates/index.html', r);
    return;
  }
  serveFile(file, res);
}).listen(8080);

function page_to_file(page){  
  var pages = {
    'index' : 'index.html'
  };
  if(!(page in pages)){ return ''; }
  return 'templates/' + pages[page];
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
