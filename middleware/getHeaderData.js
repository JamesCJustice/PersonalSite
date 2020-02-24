/*
  Provides user info for any logged-in pages.
*/

module.exports = function (req, res, next) {
  req['headerData'] = {
    username: req.session.username,
    loggedIn: req.session.loggedIn
  };
  return next();  
};