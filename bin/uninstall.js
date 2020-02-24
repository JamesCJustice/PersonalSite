console.log('Uninstalling...');
const profile = require('../profile');

profile.uninstall()
.catch(function(err){
    console.log(err);
});