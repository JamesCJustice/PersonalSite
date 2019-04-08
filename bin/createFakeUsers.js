console.log('Creating fake users...');
const profile = require('../profile');

return profile.uninstall()
.then(function(){
    return profile.install();
})
.then(function(){
    return profile.createProfile({
        email: 'john@john.test',
        username: 'john',
        password: 'pword'
    })
})
.then(function(){
    return profile.updateProfileExtra(1, {
        "favorite color": "blue",
        "favorite band": "rubber band",
        "hours spent asleep in elevator": "11"
    });
})
.then(function(){
    return profile.updateProfileExtra(1, {
        "favorite color": "orange",
        "favorite band": "arm band",
        "hours spent asleep in elevator": "15"
    });
})
.then(function(){
    console.log('Fake users created');
})
.then(function(){
    return profile.getProfileExtra(1);
})
.then(function(extra){
    console.log("Extra here " + JSON.stringify(extra));
})
.catch(function(error){
    console.log("oh no, an error!" + error);
});
