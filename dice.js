// Rolls dice, applies bonuses and special stuff.
class Roller{
  constructor(verbose = false){
    this.verbose = verbose;
  }

  rollFromString(rollString){
    let obj = this;
    let opts = this.parseOpts(rollString);
    if(obj.verbose){
      console.log("Roll opts " + JSON.stringify(opts));
    }
    
    return obj.rollFromOpts(opts);
  }

  rollFromOpts(opts){
    let obj = this;
    let result = {
      dice: [],
      modifier: opts.modifier,
      total: opts.modifier
    };
    opts.dice.forEach(function(die){
      let roll = obj.rollDie(die);
      result.dice.push(die);
      result.total += roll.total;
    });

    if(obj.verbose){
      console.log("Roll result " + JSON.stringify(result));
    }
    return result;
  }

  rollDie(die){
    die.total = die.mod || 0;
    die.rolls = [];
    for(let i = 0; i < die.quantity; i++){
      let roll = Math.floor(Math.random() * Math.floor(die.size)) + 1;
      die.total += roll;
      die.rolls.push(roll);
    }
    return die;
  }

  parseOpts(rollString){
    let dice = this.parseDice(rollString);
    let modifier = this.parseModifier(rollString);
    return {
      dice: dice,
      modifier: modifier
    };
  }

  parseDice(rollString){
    let obj = this;
    let regex = /\d+d\d+/g;
    if(!rollString.match(regex)){
      return [];
    }
    let diceStrings = rollString.match(regex);
    let dice = [];

    diceStrings.forEach(function(dieString){
      dice.push(obj.parseDie(dieString));
    });
    return dice;
  }

  parseDie(dieString){
    let quantityRegex = /\d+d/;
    let sizeRegex = /d\d+/; 
    if(!dieString.match(quantityRegex) || !dieString.match(sizeRegex)){
      throw Error("Invalid die string " + dieString);
    }
    let quantity = dieString.match(quantityRegex)[0].replace('d','');
    quantity = parseInt(quantity);
    let size = dieString.match(sizeRegex)[0].replace('d','');
    size = parseInt(size);
    return {
      quantity: quantity,
      size: size
    };
  }

  parseModifier(rollString){
    let regex = /[^d]( )?\d+$/;
    if(!rollString.match(regex)){
      return 0;
    }
    let mod = rollString.match(regex)[0];
    mod = mod.replace(' ', '');
    mod = parseInt(mod);
    return mod;
  }
}

function roll(rollString){
  let roller = new Roller({});
  return roller.rollFromString(rollString);
}

module.exports = {
  Roller = Roller,
  roll = roll
}