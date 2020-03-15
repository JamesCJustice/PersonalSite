const modules = [
  '../profile',
  '../strategy/map',
  '../strategy/force',
  '../strategy/faction'
];

async function run(){
  console.log("Install started");
  for(let i in modules){
    let mod = require(modules[i]);
    try{
      await mod.install();
    } catch(e){
      console.log(e);
    }

  }
  console.log("Install complete");
}

run();