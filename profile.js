const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('profile.db');

module.exports = {
  install: function(){
    return new Promise(function(resolve, reject){
      var path = "profile.db";
      var db = new sqlite3.Database('profile.db');
      var query = "";
      query += 'CREATE TABLE IF NOT EXISTS profile (';
      query += 'username VARCHAR(255),';
      query += 'email VARCHAR(255),';
      query += 'password VARCHAR(255),';
      query += 'salt VARCHAR(255)';
      query += ')';
      return db.run(query, function(err){
        if(err){
          reject(err);
        }
        resolve();
      });
    });
  },

  uninstall: function(){
    return new Promise(function(resolve, reject){
        db.run("DROP TABLE IF EXISTS profile", function(err, row){
            if(err){
                reject(err);
            }
            resolve(row);
        });
        
    });
  },

  getProfileByUsername: function (username){
        return new Promise(function(resolve, reject){
            db.get("SELECT * FROM profile WHERE username = ?", username, function(err, row){
                if(err){
                    reject(err);
                }
                resolve(row);
            });
            
        });
    }
};