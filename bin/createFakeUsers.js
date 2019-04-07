console.log('Creating fake users...');
const profile = require('../profile');

return profile.createProfile({
    email: 'john@john.test',
    username: 'john',
    password: 'pword'
})
.then(function(){
    return profile.updateProfileExtra(1, {
        "favorite color": "blue",
        "favorite band": "rubber band",
        "hours spent asleep in elevator": "11"
    });
})
.then(function(){
    console.log('Fake users created');
})
.catch(function(error){
    console.log("oh no, an error!" + error);
});
