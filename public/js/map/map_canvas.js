/*#-------------------------------------------------------------------------------#
  
  MapCanvas
*/
class MapCanvas{
  constructor(mouseData) {
    this.x = 0;
    this.y = 0;
    this.width = 800;
    this.height = 800;
    this.data = false;
    this.ui = {
      bg: "#e0e0eb", // Background
      bt: "#979ea6", // Button
      cl: "#36414d", // Draw Color
    };
    this.elements = [];
    this.md = mouseData;
    this.canvasName = "map_canvas";
    this.debug = false;
    this.selectedCity = -1;
    this.selectedForce = -1;
  }

  updateMap(){
    this.handleInput();
    if(this.data != -1 && this.x == this.data.x && this.y == this.data.y){
      return this.renderMapData(this.data); // No call needed
    }
    $.ajax({
        type: 'GET',
        url: "/map/regions/" + this.x + "/" + this.y + "/",
        contentType: "application/json; charset=utf-8",
        success: this.renderMapData.bind(this),
        error: function(error){
            console.log(error);
        }
    });
  }

  handleInput(){
    this.md.updateMouseData();
    if(this.md.clicked){
      for(let i in this.elements){
        let element = this.elements[i];
        let clicked = this.rectContains(this.md, element);
        if(clicked){
          element.click();
        }
      }
    }
    this.elements = [];
  }

  rectContains(point, rect){
    return point.x >= rect.xMin
      && point.y >= rect.yMin
      && point.x <= rect.xMax
      && point.y <= rect.yMax;
  }

  renderMapData(mapData){
    this.data = mapData;
    this.clear();
    this.renderNavbar();
    this.renderInfoPanel();
    this.renderCities();
    this.renderForces();
    this.renderDebug();
    window.requestAnimationFrame(this.updateMap.bind(this));
  }

  clear(){
    let ctx = this.getContext();
    ctx.clearRect(0, 0, this.width, this.height);
  }

  renderNavbar(){
    let obj = this;
    let ctx = this.getContext();
    ctx.fillStyle = mc.ui.bg;
    ctx.fillRect(700, 0, 100, 600);

    let size = 30;
    let xOff = 705;
    let yOff = 0;

    let movementMap = this.movementMap();


    for(let i = 0; i < 9; i++){
      let row = Math.floor(i/3);
      let col = i%3;
      let x = xOff + size * col;
      let y = yOff + size * row;
      let txtOff = size/2;
      let dirText = movementMap[i].name;

      ctx.fillStyle = this.ui.bt;
      ctx.fillRect(x, y, size, size);
      ctx.strokeStyle = this.ui.cl;
      ctx.strokeRect(x, y, size, size);
      ctx.fillStyle = this.ui.cl;
      ctx.font = "12px Times New Roman";
      ctx.fillText(dirText, x+(txtOff/2), y+txtOff);
      let element = {
        xMin: x,
        yMin: y,
        xMax: x+size,
        yMax: y+size
      };
      element.click = function(){
        obj.moveInDirection(i);
      }
      this.elements.push(element);
    }
    ctx.font = "12px Times New Roman";
    ctx.fillStyle = "black";
    ctx.fillText("Region: " + this.data.name, xOff, yOff + 3.5 * size);
    ctx.fillText(`Coords[${this.data.x},${this.data.y}]`, xOff, yOff + 4 * size);

  }

  movementMap(){
    return {
      0: {
        name: "NW",
        x: 1,
        y: 1,
      },
      1: {
        name: "N",
        x: 0,
        y: 1,
      },
      2: {
        name: "NE",
        x: -1,
        y: 1,
      },
      3: {
        name: "W",
        x: -1,
        y: 0,
      },
      4: {
        name: "",
        x: 0,
        y: 0,
      },
      5: {
        name: "E",
        x: 1,
        y: 0,
      },
      6: {
        name: "SW",
        x: -1,
        y: -1,
      },
      7: {
        name: "S",
        x: 0,
        y: -1,
      },
      8: {
        name: "SE",
        x: 1,
        y: -1,
      },
    };
  }

  moveInDirection(dirIndex){
    if(dirIndex == 4){
      return;
    }
    let movementMap = this.movementMap();
    let dir = movementMap[dirIndex];
    this.x = this.x + dir.x;
    this.y = this.y + dir.y;
  }

  renderInfoPanel(){
      let ctx = this.getContext(); 
      let panelHeight = 300;
      if(this.selectedCity == -1 && this.selectedForce == -1){
        ctx.fillStyle = "black";
        ctx.fillRect(0, 600,  this.width, panelHeight);
        return;
      }
      if(this.selectedCity != -1){
        ctx.fillStyle = this.ui.bg;
        ctx.fillRect(0, 600,  this.width, panelHeight);

        let city = this.selectedCity;
        let text = this.getCityText(city);
        this.drawMultilineText(text, 0, 600, "black", "14px Times New Roman");
        return;
      }
      if(this.selectedForce != -1){
        ctx.fillStyle = this.ui.bg;
        ctx.fillRect(0, 600,  this.width, panelHeight);

        let force = this.selectedForce;
        let text = this.getForceText(force);
        this.drawMultilineText(text, 0, 600, "black", "14px Times New Roman");
      }

  }

  getCityText(city){
    let fields = ["name", "description", "population", "faction"];
    let text = this.getObjectFieldsText(city, fields);

    for(let i in city.forces){
      let force = city.forces[i];
      text += `${force.name}[${force.personnel.length}]\n`;
    }

    return text;
  }

  getForceText(force){
    let fields = ["name"];
    let text = this.getObjectFieldsText(force, fields);
    for(let i in force.personnel){
      let person = force.personnel[i];
      text += `${person.archetype}[${person.extra}]\n`;
    }
    return text;
  }

  getObjectFieldsText(obj, fields){
    let text = "";
    for(let i in fields){
      let field = fields[i];
      if(typeof obj[field] !== 'undefined'){
        text += `${field}: ${obj[field]}\n`;
      }
    }
    return text;
  }

  drawMultilineText(text, x, y, color = "black", font = "12px Times New Roman"){
    let ctx = this.getContext();
    ctx.fillStyle = color;
    ctx.font = font;
    let lines = text.split('\n');
    let lineSpacing = Number.parseInt(font.match(/^[0-9]{1,2}/g), 10);
    for(let i in lines){
      let line = lines[i];
      let lineY = ((i) * lineSpacing) + y + lineSpacing;
      ctx.fillText(line, x, lineY);
    }

  }

  renderCities = function(){
    let obj = this;
    for(let i in this.data.cities){
      let city = this.data.cities[i];
      this.drawIcon(city.x, city.y, city.name);
      let coords = this.mapCoordsToCanvasCoords(city.x, city.y);
      let element = {
        xMin: coords.x,
        yMin: coords.y,
        xMax: coords.x + 10,
        yMax: coords.y + 10
      };

      element.click = function(){
        obj.selectCity(i);
      }
      this.elements.push(element);
    }
  }

  selectCity(cityIndex){
    let city = this.data.cities[cityIndex];
    this.selectedCity = city;
    this.selectedForce = -1;
  }

  renderForces(){
      let obj = this;
      for(let i in this.data.forces){
        let force = this.data.forces[i];
        this.drawIcon(force.x, force.y, force.name, "red");
        let coords = this.mapCoordsToCanvasCoords(force.x, force.y);
        let element = {
          xMin: coords.x,
          yMin: coords.y,
          xMax: coords.x + 10,
          yMax: coords.y + 10
        };

        element.click = function(){
          obj.selectForce(i);
        }
        this.elements.push(element);
      }
  }

  selectForce(forceIndex){
    let force = this.data.forces[forceIndex];
    this.selectedCity = -1;
    this.selectedForce = force;
  }

  renderDebug(){
    if(!this.debug){
      return;
    }
    this.drawIcon(100, 10, `Mouse[${Math.floor(this.md.x)},${Math.floor(this.md.y)}]`);
    if(this.md.down){
      this.drawRect(this.md.downX, this.md.downY, this.md.x, this.md.y);
    }
  }

  drawRect(minX, minY, maxX, maxY, color = "black", filled = false){
    let ctx = this.getContext();
    let width = maxX - minX;
    let height = maxY - minY;
    if(filled){
      ctx.fillStyle = color;
      ctx.fillRect(minX, minY, width, height);
    }
    else{
      ctx.strokeStyle = color;
      ctx.strokeRect(minX, minY, width, height);
    }
  }

  mapCoordsToCanvasCoords(x, y){
    let scale = 6;
    let offset = 0;
    let ret = {
      x: x * scale + offset,
      y: 600 - (y * scale)
    };
    return ret;
  }

  drawIcon(x, y, label, color = "black", size = 10){
    let coords = this.mapCoordsToCanvasCoords(x, y);
    x = coords.x;
    y = coords.y;

    let centerMod = size/2;
    x -= centerMod;
    y -= centerMod;

    let ctx = this.getContext();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    ctx.font = "12px Times New Roman"
    ctx.fillText(label, x, y);
  }

  getCanvas(){
    return document.getElementById(this.canvasName);
  }

  getContext(){
    let map = this.getCanvas();
    return map.getContext("2d");
  }

}