/*#-------------------------------------------------------------------------------#
  
  MouseData
*/
class MouseData{
  constructor(){
    this.down = 0;
    this.y = 0;
    this.x = 0;
    this.downPrev = 0;
    this.downFrames = 0;
    this.downX = 0;
    this.downY = 0;
    this.clicked = false;
  }

  setCanvas(canvas){
    this.canvas = canvas;
  }

  onMouseDown(){
    this.down += 1;
  }

  onMouseUp(){
    this.down -= 1;
  }

  onUpdateMousePosition(evt){
    if(typeof this.canvas === 'undefined'){
      console.log("No canvas set");
      return;
    }
    let rect = this.canvas.getBoundingClientRect();
    this.x = (evt.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width;
    this.y = (evt.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height;
  }

  updateMouseData(){
  this.clicked = this.down && !this.downPrev;
  this.released = !this.down && this.downPrev;
  if(this.clicked){
    this.downX = this.x;
    this.downY = this.y;
  }
  this.downPrev = this.down;
}

}