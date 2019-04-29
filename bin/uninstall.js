console.log('Uninstalling...');
const profile = require('../profile'),
  currency = require('../currency');

profile.uninstall()
.then(function(){
  return currency.uninstall();
})
.then(function(){
  console.log('Uninstall complete.');
})
.catch(function(err){
    console.log(err);
});