/*#-------------------------------------------------------------------------------#
  
  Main
*/

var md, mc;


$(document).ready(function(){
  md = new MouseData();
  mc = new MapCanvas(md);
  md.setCanvas(mc.getCanvas());

  // Mouse events
  document.body.onmousedown = md.onMouseDown.bind(md);
  document.body.onmouseup = md.onMouseUp.bind(md);
  window.addEventListener('mousemove', function (evt){ md.onUpdateMousePosition(evt); }, false);
  window.requestAnimationFrame(function(){
    mc.updateMap();
  });
});