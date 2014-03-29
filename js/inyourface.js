(function() {

var currentShape;

var inYourFace = function(data, width, height, shape) {
  var cellWidth = width / Math.sqrt(data.length);
  var cellHeight = height / Math.sqrt(data.length);
  var svg;

  if(shape !== currentShape) {
    d3.select("body").select("svg").remove();
  
    svg = d3.select("body").
      append("svg").
      attr("width", width).
      attr("height", height).
      append("g");
  } else {
    svg = d3.select("svg > g");
    //console.log("same shape!", currentShape);
  }
  
  currentShape = shape;
  
  var shapes = svg.selectAll(shape).
    data(data);

  shapes.
    enter().append(shape);

  shapes.
    attr('width', cellWidth).
    attr('height', cellHeight).
    attr('x', function(d, i) { return d.x * cellWidth; }).
    attr('y', function(d, i) { return d.y * cellHeight; }).
    attr('r', Math.max(cellWidth, cellHeight) / 2).
    attr('cx', function(d, i) { return d.x * cellWidth + cellWidth / 2; }).
    attr('cy', function(d, i) { return d.y * cellHeight + cellHeight / 2; }).
    attr('fill', function(d) { return 'rgb(' + d.rgb.join(',') + ')'; });

  if(shape === 'ellipse') {
    shapes.
      attr('rx', cellWidth / 2).
      attr('ry', cellHeight / 2);
  }
  
  shapes.exit().remove();

};

window.inYourFace = inYourFace;

})();
