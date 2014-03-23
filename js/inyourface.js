(function() {

var inYourFace = function(data, width, height, shape) {
  var cellWidth = width / Math.sqrt(data.length);
  var cellHeight = height / Math.sqrt(data.length);

  var svg = d3.select("body").
    append("svg").
    attr("width", width).
    attr("height", height).
    append("g");

  svg.selectAll(shape).
    data(data).
    enter().append(shape).
    attr('width', cellWidth).
    attr('height', cellHeight).
    attr('x', function(d, i) { return d.x * cellWidth; }).
    attr('y', function(d, i) { return d.y * cellHeight; }).
    attr('r', Math.max(cellWidth, cellHeight) / 2).
    attr('cx', function(d, i) { return d.x * cellWidth + cellWidth / 2; }).
    attr('cy', function(d, i) { return d.y * cellHeight + cellHeight / 2; }).
    attr('fill', function(d) { return 'rgb(' + d.r + ',' +  d.g + ',' + d.b + ')'; });
};

window.inYourFace = inYourFace;

})();
