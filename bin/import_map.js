const fs = require('fs'),
  Map = require('../strategy/map');

let rawData = fs.readFileSync('data/map.js');
let map = JSON.parse(rawData);

map.regions.reduce( async (previousPromise, region) => {
    await previousPromise;
    region.id = -1;
    console.log("Importing region " + JSON.stringify(region));
    return Map.createOrUpdateRegion(region);
}, Promise.resolve());

map.cities.reduce( async (previousPromise, city) => {
    await previousPromise;
    city.id = -1;
    console.log("Importing city " + JSON.stringify(city));
    return Map.createOrUpdateCity(city);
}, Promise.resolve());
