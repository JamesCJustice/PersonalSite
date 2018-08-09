var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('profile.db');
var url = require('url');
module.exports = function(app){

    app.post('/auth', function(req, res){
        var result = {
            token: "shinynewtoken",
            success: 1
        };
        res.json(result);
    });

    app.post('/register_profile', function(req, res){
        var q = url.parse(req.url, true).query;
        var username = q.username;
        var password = q.password;

        if(!username || !password){
            res.send("Username or password not specified.");
            return;
        }
        
        db.get("SELECT username FROM profile WHERE username = ?", username, function(err, row){
            if(row){
                res.send("Username " + username + " already exists.");
            }
            else{
                var stmt = db.prepare("INSERT INTO profile(username, password) VALUES (?, ?)");
                    stmt.run(username, password);
                    stmt.finalize();
                    res.send("Registered " + username);
                }
        });
        
    });

    app.post('/', function(req, res){
        res.send("Cool stuff!");
    });

}

