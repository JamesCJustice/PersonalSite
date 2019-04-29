/*
  Provides user info for any logged-in pages.
*/
const currency = require('../currency');

module.exports = function (req, res, next) {
  if(!req.session.loggedIn) {
    req['headerData'] = {
      username: req.session.username,
      loggedIn: req.session.loggedIn,
      currency: 0
    };
    return next();
  }
  return currency.getBalance(req.session.profile_id, 'cash')
  .then(function(cash){
    req['headerData'] = {
      username: req.session.username,
      loggedIn: req.session.loggedIn,
      currency: cash
    };
    return next();
  });
};