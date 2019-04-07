console.log('Checking on fake users');
const profile = require('../profile');


return profile.getProfileExtra(1)
.then(function(extra){
    console.log("Extra here " + JSON.stringify(extra));
});