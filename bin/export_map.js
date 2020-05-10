const fs = require('fs'),
  Map = require('../strategy/map');

let map = {};

Map.getCities()
  .then(function(cities){
    map.cities = cities;
    return Map.getRegions();
  })
  .then(function(regions){
    map.regions = regions;
    let data = JSON.stringify(map);
    fs.writeFileSync('data/map.js', data);
  });