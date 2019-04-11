
module.exports = function (req, res, next) {
  req['headerData'] = {
    username: req.session.username,
    loggedIn: req.session.loggedIn
  };
  next();
};