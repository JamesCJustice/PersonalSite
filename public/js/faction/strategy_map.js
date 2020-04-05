class StrategyMap {
  constructor(canvas){
    let obj = this;
    obj.canvas = canvas;
    obj.canvas.subscribeListener(obj);
    obj.coords = { x: 0, y: 0 };
    obj.requestData(obj.coords.x, obj.coords.y);
    obj.regions = {};
    obj.selected = [];
    obj.cityElements = [];
    obj.forceElements = [];
    obj.uiElements = [];
    obj.panelWidth = 150;
    obj.renderUi();
  }

  handleClick(mouseData){
    //console.log("onClick");
  }

  handleDrag(mouseData){
    //console.log("onDrag");
  }

  handleRelease(mouseData){
    //console.log("onRelease");
  }

  handleRightClick(mouseData){
    //console.log("onRightClick");
  }

  changeRegion(x, y){
    let obj = this;
    obj.coords.x = x;
    obj.coords.y = y;
    if(typeof obj.regions[`[${x},${y}]`] !== 'undefined'){
      obj.renderData();
    }
    else{
      obj.requestData(x, y);
    }
  }

  requestData(x, y){
    $.ajax({
        type: 'GET',
        url: "/map/regions/" + x + "/" + y + "/",
        contentType: "application/json; charset=utf-8",
        success: this.receiveData.bind(this),
        error: function(error){
            console.log(error);
        }
    });
  }

  receiveData(data){
    let obj = this;
    console.log("Received " + JSON.stringify(data));
    if(typeof data.id === 'undefined'){
      return;
    }

    obj.regions[`[${data.x},${data.y}]`] = data;
    if(obj.coords.x == data.x && obj.coords.y == data.y){
      obj.renderData();
    }
  }

  renderData(){
    let obj = this;
    obj.clearCities();
    obj.clearForces();
    let data = obj.regions[`[${obj.coords.x},${obj.coords.y}]`];
    
    data.cities.forEach(function(city){
      let cityElement = new CityElement(city, obj);
      let canvasId = obj.canvas.addElement(cityElement);
      cityElement.cityData.canvasId = canvasId;
      obj.cityElements.push(cityElement);
    });

    if(typeof data.forces !== 'undefined'){
      data.forces.forEach(function(force){
        let forceElement = new ForceElement(force, obj);
        let canvasId = obj.canvas.addElement(forceElement);
        forceElement.forceData.canvasId = canvasId;
        obj.forceElements.push(forceElement);
      });
    }

    obj.updateUi();
  }

  updateUi(){
    let obj = this;
    obj.uiElements.forEach(function(element){
      if(element.type === 'regionLabel'){
        element.region = obj.getRegion();
        console.log("Changed to " + element.region.name);
      }
    });
  }

  renderUi(){
    let obj = this;
    obj.renderNavPanel();
  }

  renderNavPanel(){
    let obj = this;
    let canvas = obj.canvas;

    // Nav panel
    let xDirMap = {
      0: 'West',
      1: '',
      2: 'East'
    };
    let yDirMap = {
      0: 'North',
      1: '',
      2: 'South'
    };
    let Size = obj.panelWidth / 3;
    let xOffset = obj.canvas.width - 3 * Size;
    for(let i = 0; i < 3; i++){
      for(let j = 0; j < 3; j++){
        let dir = `${yDirMap[i]}${xDirMap[j]}`;
        let x = xOffset + (Size * j);
        let y = (Size * i);
        let button = new NavButton(x, y, dir, obj);
        button.canvasId = canvas.addElement(button);
        obj.uiElements.push(button);
      }
    }
    let x = xOffset;
    let y = Size * 3;
    let region = obj.getRegion() || { name: "No Data" }; 
    let regionLabel = new RegionLabel(x, y, region, obj);
    canvas.addElement(regionLabel);
    obj.uiElements.push(regionLabel);
  }

  moveMap(x, y){
    let obj = this;
    let coords = obj.coords;
    let newX = coords.x + x;
    let newY = coords.y + y;
    if(newX != coords.x || newY != coords.y){
      obj.changeRegion(newX, newY);
    }
  }

  // Move from 100x100 to the dimensions of this canvas.
  convertCoords(x, y){
    let obj = this;
    let scale = obj.canvas.width - obj.panelWidth;
    let increment = scale/100;
    console.log(`width ${obj.canvas.width}, panelwidth ${obj.panelWidth} Scale ${scale} increment ${increment}`);
    return {
      x: x * increment,
      y: y * increment
    };
  }

  clearCities(){
    let obj = this;
    obj.cityElements.forEach(function(cityElement){
      obj.canvas.removeElement(cityElement.cityData.canvasId);
    });
    obj.cityElements = [];
  }

  clearForces(){
    let obj = this;
    obj.forceElements.forEach(function(forceElement){
      obj.canvas.removeElement(forceElement.canvasId);
    });
    obj.forceElements = [];
  }

  selectElement(element){
    let obj = this;
    obj.selected.push(element);
  }

  deselectElement(element){
    let obj = this;
    let index = -1;
    for(let i in obj.selected){
      let selected = obj.selected;
      if(selected.type == element.type && selected.canvasId == element.canvasId){
        index = i;
      }
    }
    if(index != -1){
      return obj.selected.splice(index, 1);
    }
  }

  getRegion(){
    let obj = this;
    let regionString = `[${obj.coords.x},${obj.coords.y}]`;
    return obj.regions[regionString];
  }
}

