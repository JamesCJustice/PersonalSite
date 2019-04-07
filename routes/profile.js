const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('profile.db');
const url = require('url');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const randomstring = require("randomstring");

module.exports = function(app){
app.use(bodyParser.json())

    app.post('/authorize_profile', function(req, res){
        var username = req.body.username;
        var password = req.body.password;

        var result = {};

        if( !username || !password){
            result = {
                msg: "Missing username or password",
                success: false
            };
            console.log(result["msg"]);
            res.status(400).json(result);
            return;
        }

        getProfileByUserName(username)
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
                res.status(200).json({
                    msg: "Authorization successful",
                    success: true
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


        //res.status(200).json(result);
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
        
        const hash = crypto.createHash('sha256');
        var salt = randomstring.generate(8);

        hash.update(password + salt);
        var hashedPassword = hash.digest('base64');

        db.get("SELECT username FROM profile WHERE username = ?", username, function(err, row){
            if(row){
                console.log("Duplicate user");
                res.status(400).json("Username " + username + " already exists.");
            }
            else{
                var stmt = db.prepare("INSERT INTO profile(username, email, password, salt) VALUES (?, ?, ?, ?)");
                stmt.run(username, email, hashedPassword, salt, function(err){
                    console.log("err: " + err);
                    result = {
                        success: 1,
                        msg: "Registered " + username
                    };
                    console.log(result["msg"]);
                    res.status(200).json(result);
                });
                stmt.finalize();

                    
            };
        });
    });


    app.post('/', function(req, res){
        res.send("Cool stuff!");
    });


    function getProfileByUserName(username){
        return new Promise(function(resolve, reject){
            db.get("SELECT * FROM profile WHERE username = ?", username, function(err, row){
                if(err){
                    reject(err);
                }
                resolve(row);
            });
            
        });
        
    }


}
