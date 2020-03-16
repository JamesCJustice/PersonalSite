// TODO: Make something more robust than hardcoding.
module.exports = {
  isAdmin: function(username){
    let admins = ['admin'];
    return admins.includes(username);
  },
}