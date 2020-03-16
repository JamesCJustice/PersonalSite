const sqlite3 = require('sqlite3').verbose(),
    url = require('url'),
    userAuthenticated = require('../middleware/userAuthenticated'),
    bodyParser = require('body-parser'),
    crypto = require('crypto'),
    randomstring = require("randomstring"),
    fs = require('fs'),
    db = new sqlite3.Database('profile.db'),
    profile = require('../profile'),
    ejs = require('ejs'),
    getHeaderData = require('../middleware/getHeaderData'),
    Faction = require('../strategy/faction');

module.exports = function(app){
    app.use(bodyParser.json());
    console.log(JSON.stringify(getHeaderData));
    app.use(getHeaderData);

    app.get('/login', function(req, res){
        if(req.session.loggedIn){
            return res.send("Welcome back, " + req.session.username + "!");
        }

        res.render('login');
    });

    app.get('/logout', function(req, res){
        req.session.loggedIn = false;
        req.session.username = "";
        return res.redirect('/login');
    });

    app.get('/profile/view/:id', userAuthenticated, function(req, res){
        let data = req.headerData;

        return profile.getProfileById(req.params.id)
        .then(function(prof){
            if(typeof prof === "undefined"){
                return res.render('notFound');
            }
            data['displayedUser'] = prof.username;   
            return profile.getProfileExtra(req.params.id);
        })
        .then(function(extra){
            data['extra'] = profile.filterExtra(extra);
            return res.render('profile', data);
        })
        .catch(function(err){
            return new Error(err);
        });
    });

    app.get('/profile/edit', userAuthenticated, function(req, res){
        return profile.getProfileExtra(req.session.profile_id)
        .then(function(extra){
            let data = req.headerData;
            let visibleExtra = profile.filterExtra(extra);
            profile.getValidFieldNames().forEach(function(field){
                visibleExtra[field] = extra[field] || "";
            });
            data['extra'] = visibleExtra;
            res.render('edit_profile', data);
        });
    });

    app.post('/profile/edit', userAuthenticated, function(req, res){
        let profileExtra = profile.filterExtra(req.body.extra);
        return profile.updateProfileExtra(req.session.profile_id, profileExtra)
        .then(function(){
            res.status(200).json({
                msg: "Profile update successful",
                success: true,
                redirect: '/profile/view/' + req.session.profile_id
            });
        })
        .catch(function(err){
            return res.status(401).json({
                msg: err,
                success: false,
                redirect: '/profile/edit/'
            });
        });
    });

    app.post('/profile/password/update', userAuthenticated, function(req, res){
        let newPass = req.body.newPass;
        let confirmPass = req.body.confirmPass;
        if (newPass !== confirmPass) {
            return res.status(400).json({
                msg: 'Passwords do not match',
                success: false
            }); 
        }

        return profile.authenticateUser(req.session.username, req.body.currentPass)
        .then(function(authedUser){
            if(!authedUser){
                throw new Error('Auth failed');
            }
            return profile.updatePassword(authedUser, newPass);
        })
        .then(function(){
            return res.status(200).json({
                msg: "Profile update successful",
                success: true,
                redirect: '/profile/view/' + req.session.profile_id
            });
        })
        .catch(function(err){
            return res.status(500).json({
                msg: 'Internal error',
                success: false
            }); 
        });
    });

    app.post('/login', async function(req, res){
        var username = req.body.username;
        var password = req.body.password;

        var result = {};

        if( !username || !password){
            res.status(400).json({
                msg: "Missing username or password",
                success: false
            });
            return;
        }
        profile.authenticateUser(username, password)
        .then(function(authenticatedProfile){
            if(authenticatedProfile){
                req.session.loggedIn = 1;
                req.session.username = authenticatedProfile.username;
                req.session.profile_id = authenticatedProfile.id;
                req.session.faction = Faction.getFactionByUsername(req.session.username);
                return res.status(200).json({
                    msg: "Authorization successful",
                    success: true,
                    redirect: '/'
                });
            }
            return res.status(401).json({
                msg: "Authorization unsuccessful",
                success: false
            });
        });
    });

    app.post('/register_profile', function(req, res){
        var q = url.parse(req.url, true).query;
        var username = req.body.username;
        var email = req.body.email;
        var password = req.body.password;
        var result;
        if(!username || !password || !email){
            result = {
                success: 0,
                msg: "Please fill out all fields."
            };
            console.log("message " + JSON.stringify(result["msg"]));
            res.status(400).json(result);
            return;
        }

        return profile.createProfile({
            username: username,
            password: password
        })
        .then(function(){
            return profile.getProfileByUsername(username);
        })
        .then(function(){
            return res.status(201).json({
                success: 1,
                msg: "User registered successfully.",
                redirect: "/login"
            });
        })
        .catch(function(err){
            return res.status(400).json({
                success: 0,
                msg: err
            });
        });
    });

}
