console.log('Installing...');
const profile = require('../profile');

profile.install()
.then(function(){
  console.log('Install complete.');
});