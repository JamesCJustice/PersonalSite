const sqlite3 = require('sqlite3').verbose(),
  db = new sqlite3.Database('profile.db'),
  randomstring = require("randomstring"),
  crypto = require('crypto');

module.exports = {
  install: function(){
    return new Promise(function(resolve, reject){
      let query = "";
      query += 'CREATE TABLE IF NOT EXISTS profile (';
      query += 'id INTEGER PRIMARY KEY AUTOINCREMENT,';
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
    })
    .then(function(){
      let query = "";
      query += 'CREATE TABLE IF NOT EXISTS profile_extra (';
      query += 'profile_id INTEGER NOT NULL,';
      query += 'name VARCHAR(255) NOT NULL,';
      query += 'value TEXT,';
      query += 'PRIMARY KEY(profile_id, name)'
      query += ');';
      return db.run(query); 
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
        
    })
    .then(function(){
      return new Promise(function(resolve, reject){
        db.run("DROP TABLE IF EXISTS profile_extra", function(err, row){
            if(err){
                reject(err);
            }
            resolve(row);
        });
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
  },

  getProfileById: function (id){
      return new Promise(function(resolve, reject){
          db.get("SELECT * FROM profile WHERE id = ?", id, function(err, row){
              if(err){
                  reject(err);
              }
              resolve(row);
          });
      });
  },

  getProfileExtra: function(id){
    return new Promise(function(resolve, reject){
        db.all("SELECT name, value FROM profile_extra WHERE profile_id = ?", id, function(err, rows){
            if(err){
                reject(err);
            }
            resolve(rows);
        });
    })
    .then(function(rows){
      let extra = {"id": id};
      rows.forEach((row) => {
        extra[row.name] = row.value;
      });

      return extra;
    });
  },

  createProfile: function(profile){
    return new Promise(function(resolve, reject){
      const hash = crypto.createHash('sha256');
      profile.salt = randomstring.generate(8);

      hash.update(profile.password + profile.salt);
      profile.hashedPassword = hash.digest('base64');
      
      db.get("SELECT username FROM profile WHERE username = ?", profile.username, function(err, row){
          if(row){
              reject('Duplicate user');
          }
          resolve();
      });
    })
    .then(function(){
      var stmt = db.prepare("INSERT INTO profile(username, email, password, salt) VALUES (?, ?, ?, ?)");
      stmt.run(profile.username, profile.email, profile.hashedPassword, profile.salt, function(err){
          if(err){
            console.log(err); 
            throw new Error(err); 
          }
      });
      return stmt.finalize();
    });;
  },

  updateProfileExtra: function(id, extra){
    let rows = Object.keys(extra).map((key) => [id, key, extra[key]]);
    let sql = 'INSERT INTO profile_extra(profile_id, name, value) VALUES (?,?,?);';
    console.log(sql);
    console.log(JSON.stringify(rows));
    return new Promise(function(resolve, reject){
      rows.forEach(function(row){
        db.run(sql, row[0], row[1], row[2], function(err) {
          if (err) {
            reject(err);
          }
          resolve();
        });  
      });
    });
  },
  

};