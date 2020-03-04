console.log('Installing...');
const profile = require('../profile');
const strategy = require('../strategy');

return profile.install()
.then(function(){
  return strategy.install();
})
.then(function(){
  console.log('Install complete.');
})
.catch(function(err){
    console.log(err);
});