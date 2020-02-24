console.log('Installing...');
const profile = require('../profile');

return profile.install()
.then(function(){
  console.log('Install complete.');
})
.catch(function(err){
    console.log(err);
});