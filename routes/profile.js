var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('profile.db');
var url = require('url');
var bodyParser = require('body-parser')

module.exports = function(app){
app.use(bodyParser.json())

    app.post('/authorize_profile', function(req, res){
        var username = req.body.username;
        var password = req.body.password;
        console.log("Received " + username + " and " + password);
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

        db.get("SELECT username FROM profile WHERE username = ? AND password = ?", username, password, function(err, row){
            console.log(err  + "," +  row);
            if(row){
                result = {
                    token: "shinynewtoken",
                    success: 1,
                    msg: "success"
                };
                res.status(200).json(result);
                return;
            }
            else{
                result = {
                    success: 0,
                    msg: "Wrong username or password."
                };
                console.log(result["msg"]);
                res.status(400).json(result);
            }
        });



        //res.status(200).json(result);
    });

    app.post('/register_profile', function(req, res){
        var q = url.parse(req.url, true).query;
        var username = req.body.username;
        var password = req.body.password;
        var result;
        if(!username || !password){
            result = {
                success: 0,
                msg: "Username or password not specified."
            };
            console.log(result["msg"]);
            res.status(400).json(result);
            return;
        }
        
        db.get("SELECT username FROM profile WHERE username = ?", username, function(err, row){
            if(row){
                console.log("Log");
                res.status(400).json("Username " + username + " already exists.");
            }
            else{
                var stmt = db.prepare("INSERT INTO profile(username, password) VALUES (?, ?)");
                stmt.run(username, password, function(err){
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
}