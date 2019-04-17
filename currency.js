const sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('profile.db');
function install(){
    return new Promise(function(resolve, reject){
    let query = "";
    query += 'CREATE TABLE IF NOT EXISTS currency_balance (';
    query += 'id INTEGER PRIMARY KEY AUTOINCREMENT,';
    query += 'profile_id INTEGER,';
    query += 'currency VARCHAR(255),';
    query += 'balance INTEGER';
    query += ')';
    return db.run(query, function(err){
      if(err){
        reject(err);
      }
      resolve();
    })
  })
  .then(function(){
    let query = "";
    query += 'CREATE TABLE IF NOT EXISTS currency_transactions (';
    query += 'id INTEGER PRIMARY KEY AUTOINCREMENT,';
    query += 'to_profile INTEGER,';
    query += 'from_profile INTEGER,';
    query += 'amount INTEGER,';
    query += 'currency VARCHAR(255),';
    query += "imestamp DATE DEFAULT (datetime('now','localtime'))";
    query += ')';
    return db.run(query);
  });  
}

function uninstall(){
  return new Promise(function(resolve, reject){
      db.run("DROP TABLE IF EXISTS currency_balance", function(err, row){
          if(err){
              reject(err);
          }
          resolve(row);
      });
      
  })
  .then(function(){
    return new Promise(function(resolve, reject){
      db.run("DROP TABLE IF EXISTS currency_transaction", function(err, row){
          if(err){
              reject(err);
          }
          resolve(row);
      });
    });
  });
}

function createCurrency(amount, to){
    return handleTransaction({
        from: 0,
        to: to,
        amount: amount
    });
}

function destroyCurrency(amount, from){
    return handleTransaction({
        from: from,
        to: to,
        amount: amount
    });
}

function transferCurrency(amount, to, from){
    return 1;
}

function handleTransaction(transaction){
    let result = validateTransaction(trans);
    if (!result.success) {
        throw new Error("Could not complete transaction: " + result.errors);
    }
}

function validateTransaction(trans){
    let errors = [];

    ['from', 'to', 'currency', 'quantity'].forEach(function(key){
        if (!(key in trans)) {
            errors.push("Missing " + key);
        }
    });

    if(trans.from == 0 && trans.to == 0){
        errors.push('Either to or from need to be a real profile');
    }

    if(trans.quantity == 0){
        errors.push('Transaction amount must be nonzero');
    }

    if(errors.length == 0 && trans.from != 0 && getBalance(trans.from, trans.currency) < trans.amount){
        errors.push('From cannot afford transaction');
    }

    return {
        success: errors.length == 0,
        errors: errors
    };
}

function getBalance(profile_id, currency){
    return new Promise(function(resolve, reject){
        resolve(0);
    });
}

module.exports = {
    install: install,
    uninstall: uninstall
};