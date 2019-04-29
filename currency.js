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

function createCurrency(currency, amount, to){
  return handleTransaction({
      from: 0,
      to: to,
      quantity: amount,
      currency: currency
  });
}

function destroyCurrency(currency, amount, from){
  return handleTransaction({
      from: from,
      to: 0,
      quantity: amount,
      currency: currency
  });
}

function transferCurrency(currency, amount, to, from){
  return handleTransaction({
    from: from,
    to: to,
    quantity: amount,
    currency: currency
  });
}

function handleTransaction(trans){
  return new Promise(function(resolve, reject){
    let result = validateTransaction(trans);
    if (!result.success) {
      return reject(new Error("Could not complete transaction: " + result.errors));
    }
    if (trans.from != 0) {
      return incrementBalance(trans.from, trans.currency, -trans.amount);
    }
    resolve();
  })
  .then(function(){
    if (trans.to != 0) {
      return incrementBalance(trans.to, trans.curency, trans.amount);
    }
    return;
  })
  .then(function(){
    return logTransaction(trans);
  });
}

function logTransaction(trans){
  return new Promise(function(resolve, reject){
    let query = 'INSERT into currency_transactions ';
    query += '(from_profile, to_profile, amount, currency)';
    query += ' values(?,?,?,?)';
    db.run(query, trans.from, trans.to, trans.quantity, trans.currency);
    resolve();
  });
}

// Use negative to subtract
function incrementBalance(profile_id, currency, amount){
  return balanceExists(profile_id, currency)
  .then(function(result){
    let query = '';
    if(result == true){
      query = 'UPDATE currency_balance'; 
      query += ' SET balance = balance + ? ';
      query += ' WHERE profile_id = ?';
      query += ' AND currency = ?';
      return db.run(query, amount, profile_id, currency);
    }
    else{
      query = 'INSERT INTO currency_balance(profile_id, currency, balance) ';
      query += 'VALUES(?,?,?)';
      return db.run(query, profile_id, currency, balance);
    }
  })
  .catch(function(err){
    console.log('err ' + err);
  });
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

function balanceExists(profile_id, currency){
  return new Promise(function(resolve, reject){
    db.get("SELECT * FROM currency_balance WHERE profile_id = ? AND currency = ?", profile_id, currency, function(err, row){
      if(err){
          reject(err);
      }
      if(row){
        resolve(true);
      }
      else{
        resolve(false);  
      }
    });
  });
}

function getBalance(profile_id, currency){
    return new Promise(function(resolve, reject){
        db.get("SELECT * FROM currency_balance WHERE profile_id = ? AND currency = ?", profile_id, currency, function(err, row){
            if(err){
                reject(err);
            }
            if(row){
              resolve(row['balance']);
            }
            else{
              resolve(0);  
            }
            
        });
    });
}

module.exports = {
    install: install,
    uninstall: uninstall,
    createCurrency: createCurrency,
    destroyCurrency: destroyCurrency,
    transferCurrency: transferCurrency,
    getBalance: getBalance
};