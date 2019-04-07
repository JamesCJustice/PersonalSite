console.log('Uninstalling...');
const profile = require('../profile');

profile.uninstall()
.then(function(){
  console.log('Uninstall complete.');
});