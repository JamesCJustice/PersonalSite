/*
  Provides user info for any logged-in pages.
*/

const Util = require('../util');

module.exports = function (req, res, next) {
  req['headerData'] = {
    username: req.session.username,
    loggedIn: req.session.loggedIn,
    faction: req.session.faction,
    siteUrl: Util.getAbsoluteUrl()
  };
  return next();
};