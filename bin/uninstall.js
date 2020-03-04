console.log('Uninstalling...');
const profile = require('../profile');
const strategy = require('../strategy');

profile.uninstall()
.then(function(){
  return strategy.uninstall();
})
.catch(function(err){
    console.log(err);
});