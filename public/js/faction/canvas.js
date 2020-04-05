/*
  A suite of classes to handle general graphics and input.
*/


/*
  Display rectangular elements gaphically on the canvas. Route inputs to their handlers.
*/
class Canvas{
  constructor(canvasName, width, height){
    let obj = this;
    obj.width = width;
    obj.height = height;
    obj.mouseData;
    obj.canvasName = canvasName;
    obj.selectedElements = [];
    obj.elements = [];
    obj._nextId = 0;
    obj.canvas = document.getElementById(obj.canvasName);
    obj.context = obj.canvas.getContext("2d");
    obj.mouseData = new MouseData(obj.canvas);
    window.requestAnimationFrame(function(){
      obj.update();
    });
    obj.listeners = [];
  }

  addElement(element){
    let obj = this;
    element.id = obj._nextId;
    obj._nextId++;

    obj.elements.push(element);
    return element.id;
  }

  // Subscribe to listen to events
  subscribeListener(listener){
    let obj = this;
    obj.listeners.push(listener);
  }

  removeElement(id){
    let obj = this;
    let index = -1;
    for(let i in obj.elements){
      let element = obj.elements[i];
      if(element.id == id){
        index = i;
      }
    }
    if(index != -1){
      return obj.elements.splice(index, 1);
    }
  }

  handleInput(){
    let obj = this;
    let md = obj.mouseData;
    md.updateMouseData();
    let behaviorNeeded = md.clicked || md.dragged || md.released || md.rClicked;
    if(!behaviorNeeded){
      return;
    }
    obj.elements.forEach(function(element){
      if(md.clicked && element.rect.contains(md.x, md.y)){
        element.handleClick(md);
      }
      if(md.dragged){
        element.handleDrag(md);
      }
      if(md.released){
        element.handleRelease(md);
      }
      if(md.rClicked && element.rect.contains(md.x, md.y)){
        element.handleRightClick(md);
      }
    });
    obj.listeners.forEach(function(listener){
      if(md.clicked && typeof listener.handleClick !== 'undefined'){
        listener.handleClick(md);
      }
      if(md.dragged && typeof listener.handleDrag !== 'undefined'){
        listener.handleDrag(md);
      }
      if(md.released && typeof listener.handleRelease !== 'undefined'){
        listener.handleRelease(md);
      }
      if(md.rClicked && typeof listener.handleRightClick !== 'undefined'){
        listener.handleRightClick(md);
      }
    });
  }

  update(){
    let obj = this;
    obj.handleInput();
    obj.context.clearRect(0, 0, obj.width, obj.height);
    obj.elements.forEach(function(element){
      element.draw(obj.context);
    });

    window.requestAnimationFrame(obj.update.bind(obj));
  }
}

/*
  A rectangular graphical element drawn on the canvas.
  Base class to be extended by others.
*/
class Element{
  constructor(settings){
    let obj = this;
    obj.rect = settings.rect;
  }

  draw(ctx){
    let obj = this;
    ctx.fillStyle = "black";
    let rect = obj.rect;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  handleClick(mouseData){}

  handleDrag(mouseData){}

  handleRelease(mouseData){}

  handleRightClick(mouseData){}
}

/*
  Rectangle. X and Y are the top left corner.
*/
class Rect{
  constructor(x, y, width, height){
    let obj = this;
    obj.x = x;
    obj.y = y;
    obj.width = width;
    obj.height = height;
  }

  contains(x, y){
    let obj = this;
    let xBounds = x >= obj.x && x <= obj.x + obj.width;
    let yBounds = y >= obj.y && y <= obj.y + obj.height;
    return xBounds && yBounds; 
  }

  getCenter(){
    let obj = this;
    return {
      x: obj.x + (obj.width/2),
      y: obj.y + (obj.height/2)
    };
  }

  moveCentered(x, y){
    let obj = this;
    obj.x = x - obj.width/2;
    obj.y = y - obj.height/2;
  }
}

/*
  Grab and represent mouse input relative to a canvas.
*/
class MouseData{
  constructor(canvas){
    let obj = this;
    obj.down = 0;
    obj.y = 0;
    obj.x = 0;
    obj.downPrev = 0;
    obj.downFrames = 0;
    obj.downX = 0;
    obj.downY = 0;
    obj.clicked = false;
    obj.dragged = false;
    obj.rClicked = false;
    obj.rDownPrev = 0;
    obj.rDown = 0;
    obj.canvas = canvas;
    obj.dragTolerance = 1;

    document.body.onmousedown = obj.onMouseDown.bind(obj);
    document.body.onmouseup = obj.onMouseUp.bind(obj);
    window.addEventListener('mousemove', function (evt){ obj.onUpdateMousePosition(evt); }, false);
  }

  onMouseDown(event){
    let obj = this;
    if(event.which === 1){
      obj.down += 1;
    }
    else if(event.which === 3){
      obj.rDown += 1;
    }
  }

  onMouseUp(event){
    let obj = this;
    
    if(event.which === 1){
      obj.down -= 1;  
    }
    else if(event.which === 3){
      obj.rDown -= 1;
    }
  }

  onUpdateMousePosition(evt){
    let obj = this;
    if(typeof obj.canvas === 'undefined'){
      console.log("No canvas set");
      return;
    }
    let rect = obj.canvas.getBoundingClientRect();
    obj.x = (evt.clientX - rect.left) / (rect.right - rect.left) * obj.canvas.width;
    obj.y = (evt.clientY - rect.top) / (rect.bottom - rect.top) * obj.canvas.height;
    obj._updateDrag();
  }

  updateMouseData(){
    let obj = this;
    obj.clicked = obj.down && !obj.downPrev;
    obj.released = !obj.down && obj.downPrev;
    if(obj.clicked){
      obj.downX = obj.x;
      obj.downY = obj.y;
    }
    obj.downPrev = obj.down;
    obj._updateDrag();

    obj.rClicked = obj.rDown && !obj.rDownPrev;
    obj.rDownPrev = obj.rDown;
  }

  _updateDrag(){
    let obj = this;
    if(obj.down == 0 || obj.dragged){
      return;
    }
    let deltaX =  Math.abs(obj.x - obj.downX);
    let deltaY = Math.abs(obj.y - obj.downY);
    let xDragged = deltaX >= obj.dragTolerance;
    let yDragged = deltaY >= obj.dragTolerance;
    obj.dragged = xDragged || yDragged;
  }
}

/*
  Apparently if you don't include subclasses in the super class's file, 
  the constructor is invalid. ¯\_(ツ)_/¯
*/
class DraggableElement extends Element{
  constructor(){
    super({
      rect: new Rect(0, 0, 100, 100),
    });
    this.clickStart = {};
  }

  handleClick(mouseData){
    console.log("Click");
    this.clickStart = { x: mouseData.x, y: mouseData.y };
  }

  handleDrag(mouseData){
    let obj = this;
    let rect = obj.rect;
    console.log("drag");
    if(obj.clickStart){
      rect.moveCentered(mouseData.x, mouseData.y);
    }
  }

  handleRelease(mouseData){
    console.log("release");
    let obj = this;
    obj.clickStart = false;
  }
}

class CityElement extends Element{
  constructor(cityData, strategyMap){
    super({
      rect: new Rect(0, 0, 100, 100)
    });
    let coords = strategyMap.convertCoords(cityData.x, cityData.y);
    let obj = this;
    obj.rect.moveCentered(coords.x, coords.y);
    obj.cityData = cityData;
    obj.strategyMap = strategyMap;
    obj.type = 'city';
    obj.selected = false;
  }

  draw(ctx){
    let obj = this;
    ctx.fillStyle = obj.selected ? "blue" : "black";
    let rect = obj.rect;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  handleClick(mouseData){
    let obj = this;
    obj.selected = !obj.selected;
    if(obj.selected){
      obj.strategyMap.selectElement(obj);
    }
    else{
      obj.strategyMap.deselectElement(obj);
    }
  }
}

class ForceElement extends Element{
  constructor(ForceData, strategyMap){
    super({
      rect: new Rect(forceData.x, forceData.y, 100, 100)
    });
    let obj = this;
    obj.cityData = cityData;
    obj.strategyMap = strategyMap;
    obj.rotation = 45;
    obj.type = 'force';
    obj.selected = false;
  }

  draw(ctx){
    let obj = this;
    ctx.rotate(obj.rotation * Math.PI / 180);
    ctx.fillStyle = obj.selected ? "blue" : "black";
    let rect = obj.rect;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  handleClick(mouseData){
    let obj = this;
    obj.selected = !obj.selected;
    if(obj.selected){
      obj.strategyMap.selectElement(obj);
    }
    else{
      obj.strategyMap.deselectElement(obj);
    }
  }

  handleDrag(mouseData){
    
  }

  handleRelease(mouseData){

  }
}

class NavButton extends Element{
  constructor(x, y, direction, strategyMap){
    super({
      rect: new Rect(x, y, 50, 50)
    });
    let obj = this;
    obj.direction = direction;
    obj.strategyMap = strategyMap;
    obj.type = 'navButton';
  }

  draw(ctx){
    let obj = this;
    let rect = obj.rect;
    let dirMap = {
      "NorthWest": "NW",
      "North": "N",
      "NorthEast": "NE",
      "West": "W",
      "": "",
      "East": "E",
      "SouthWest": "SW",
      "South": "S",
      "SouthEast": "SE"
    };

    ctx.fillStyle = "grey";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.fillStyle = "black";
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    let center = obj.rect.getCenter();
    ctx.fillText(dirMap[obj.direction], center.x, center.y);
  }

  handleClick(mouseData){
    let obj = this;
    let dirMap = {
      "NorthWest": {x: -1, y: 1},
      "North": {x: 0, y: 1},
      "NorthEast": {x: 1, y: 1},
      "West": {x: -1, y: 0},
      "": {x: 0, y: 0},
      "East": {x: 1, y: 0},
      "SouthWest": {x: -1, y: -1},
      "South": {x: 0, y: -1},
      "SouthEast": {x: 1, y: -1}
    };
    let dir = dirMap[obj.direction];
    obj.strategyMap.moveMap(dir.x, dir.y);
  }
}

class RegionLabel extends Element{
  constructor(x, y, region, strategyMap){
    super({
      rect: new Rect(x, y, 150, 50)
    });
    let obj = this;
    obj.region = region;
    obj.strategyMap = strategyMap;
    obj.type = 'regionLabel';
  }

  draw(ctx){
    let obj = this;
    ctx.rotate(obj.rotation * Math.PI / 180);
    let rect = obj.rect;

    ctx.fillStyle = "grey";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    let center = rect.getCenter();
    center.x -= rect.width/4; // Allow more space.
    
    ctx.fillStyle = "black";
    let regionString = `${obj.region.name} [${obj.region.x},${obj.region.y}]`;
    ctx.fillText(regionString, center.x, center.y);
  }
}
