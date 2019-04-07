const sqlite3 = require('sqlite3').verbose(),
    url = require('url'),
    userAuthenticated = require('../middleware/userAuthenticated'),
    bodyParser = require('body-parser'),
    crypto = require('crypto'),
    randomstring = require("randomstring"),
    fs = require('fs'),
    db = new sqlite3.Database('profile.db'),
    profile = require('../profile'),
    ejs = require('ejs');

module.exports = function(app){
    app.use(bodyParser.json());

    app.get('/login', function(req, res){
        if(req.session.loggedIn){
            return res.send("Welcome back, " + req.session.username + "!");
        }

        res.render('login');
    });

    app.get('/profile/:id', userAuthenticated, function(req, res){
        return profile.getProfileById(req.params.id)
        .then(function(profile){
            let data = {
                username: profile.username
            };   
            res.render('profile', data);    
        });
    });

    app.post('/authorize_profile', function(req, res){
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

        profile.getProfileByUsername(username)
        .then(function(profile){
            if(profile == undefined){
                return res.status(401).json({
                    msg: "Authorization unsuccessful. User " + username + " doesn't exist.",
                    success: false
                });
            }

            const hash = crypto.createHash('sha256');

            hash.update(password + profile.salt);
            var hashedPassword = hash.digest('base64');


            if(hashedPassword === profile.password){
                req.session.loggedIn = true;
                req.session.username = profile.username;
                return res.status(200).json({
                    msg: "Authorization successful",
                    success: true,
                    redirect: '/'
                });

            }
            else{
                return res.status(401).json({
                    msg: "Authorization unsuccessful",
                    success: false
                });
            }

            
        })
        .catch(function(err){
            console.log(err);
            return res.status(401).json(result);
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
            console.log(result["msg"]);
            res.status(400).json(result);
            return;
        }

        return profile.createProfile({
            username: username,
            password: password
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
