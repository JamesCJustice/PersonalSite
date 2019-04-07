module.exports = function (req, res, next) {
  if(req.session.loggedIn == undefined || !req.session.loggedIn){
    res.writeHead(302, {
      'Location': 'login'
    });
    return res.end();
  }
  next()
}