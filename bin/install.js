console.log('Installing...');
const profile = require('../profile'),
    currency = require('../currency');

return profile.install()
.then(function(){
    return currency.install();
})
.then(function(){
  console.log('Install complete.');
})
.catch(function(err){
    console.log(err);
});