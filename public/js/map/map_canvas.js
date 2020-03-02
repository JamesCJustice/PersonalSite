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
      bg: "#51647a", // Background
      bt: "#979ea6", // Button
      cl: "#36414d", // Draw Color
    };
    this.elements = [];
    this.md = mouseData;
    this.canvasName = "map_canvas";
    this.debug = true;
  }

  updateMap(){
    this.handleInput();
    if(this.data != -1 && this.x == this.data.x && this.y == this.data.y){
      return this.renderMapData(this.data); // No call needed
    }
    $.ajax({
        type: 'GET',
        url: "/map/cells/" + this.x + "/" + this.y + "/",
        contentType: "application/json; charset=utf-8",
        success: this.renderMapData.bind(this),
        error: function(error){
            console.log(error);
        }
    });
  }

  handleInput(){
    this.md.updateMouseData();
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
    let ctx = this.getContext();
    ctx.fillStyle = mc.ui_bg;
    ctx.fillRect(500, 0, 300, 500);

    let size = 30;
    let xOff = 600;
    let yOff = 0;

    let dirs = ["NW", "N", "NE", "W", "", "E", "SW", "S", "SE"];


    for(let i = 0; i < 9; i++){
      let row = Math.floor(i/3);
      let col = i%3;
      let x = xOff + size * col;
      let y = yOff + size * row;
      let txtOff = size/2;

      ctx.fillStyle = this.ui.bt;
      ctx.fillRect(x, y, size, size);
      ctx.strokeStyle = this.ui.cl;
      ctx.strokeRect(x, y, size, size);
      ctx.fillStyle = this.ui.cl;
      ctx.font = "12px Times New Roman";
      ctx.fillText(dirs[i], x+(txtOff/2), y+txtOff);
    }
  }

  renderInfoPanel(){
      let ctx = mc.getContext();
      let data;
      ctx.fillStyle = "blue";
      if(typeof data === 'undefined'){
        return;
      }
      let panelWidth = 500;
      ctx.fillRect(0, 500,  this.width, this.height - panelWidth);
  }

  renderCities = function(){
    for(let i in this.data.cities){
      let city = this.data.cities[i];
      this.drawIcon(city.x, city.y, city.name);
    }
  }

  renderForces(){
      for(let i in this.data.forces){
        let force = this.data.forces[i];
        this.drawIcon(force.x, force.y, force.name);
      }
  }

  renderDebug(){
    if(!this.debug){
      return;
    }
    this.drawIcon(100, 10, `Mouse[${Math.floor(this.md.x)},${Math.floor(this.md.y)}]`);
    if(this.md.down){
      this.drawRect(this.md.downX, this.md.downY, this.md.x, this.md.y);
    }
    if(this.md.clicked){
      
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

  drawIcon(x, y, label, color = "black", size = 10){
    let scale = 5;
    x *= scale;
    y *= scale;

    let xOffset = 0;
    x += xOffset;

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