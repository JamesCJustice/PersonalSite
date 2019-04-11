module.exports = function (req, res, next) {
  if(req.session.loggedIn == undefined || !req.session.loggedIn){
    return res.redirect('/login');
  }
  next();
};