// TODO: Make something more robust than hardcoding.
module.exports = {
  isAdmin: function(username){
    return true;
    let admins = ['admin'];
    return admins.include(username);
  },
}