const fs = require('fs');


function getMapData(){
  let rawData = fs.readFileSync('./data/world.json');
  let mapData = JSON.parse(rawData);
  return mapData;
}

function getMapCell(x, y){
  let mapData = getMapData();
  let foundMapCell = {
    name: "No data",
    x: x,
    y: y,
    cities: []
  };
  for(let i = 0; i < mapData.cells.length; i++){
    let cell = mapData.cells[i];
    if(cell.x == x && cell.y == y){
      foundMapCell = cell;
    }
  }

  return foundMapCell;
}

module.exports = {
  getMapData: getMapData,
  getMapCell: getMapCell
};