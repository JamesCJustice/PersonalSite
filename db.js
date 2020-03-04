// Helper methods for database
const sqlite3 = require('sqlite3').verbose();

class DatabaseHelper{
  constructor(databaseFile){
    this.db = new sqlite3.Database(databaseFile);
  }

  run(sql){
    let obj = this;
    return new Promise(function(resolve, reject){
        obj.db.get(sql, function(err, row){
            if(err){
                reject(err);
            }
            resolve(row);
        });
    });
  }

  selectRow(sql){
    let obj = this;
    return new Promise(function(resolve, reject){
        obj.db.get("SELECT " + sql, function(err, row){
            if(err){
                reject(err);
            }
            resolve(row);
        });
    });
  }

  select(sql){
    let obj = this;
    return new Promise(function(resolve, reject){
        obj.db.all("SELECT " + sql, function(err, rows){
            if(err){
                reject(err);
            }
            resolve(rows);
        });
    });
  }

  insert(sql, row){
    let obj = this;
    return new Promise(function(resolve, reject){
      obj.db.run("INSERT " + sql, row, function(err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }  

  insertOrReplace(sql, row){
    let obj = this;
    return new Promise(function(resolve, reject){
      obj.db.run("INSERT OR REPLACE " + sql, row, function(err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  delete(sql, args){
    let obj = this;
    return new Promise(function(resolve, reject){
      obj.db.run("DELETE " + sql, args, function(err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  update(sql, row){
    let obj = this;
    return new Promise(function(resolve, reject){
      obj.db.run("UPDATE " + sql, row, function(err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}



module.exports = {
  Db: DatabaseHelper
}