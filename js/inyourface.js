(function() {

var inYourFace = function(data, width, height) {
  var cellWidth = width / Math.sqrt(data.length);
  var cellHeight = height / Math.sqrt(data.length);

  var svg = d3.select("body").
    append("svg").
    attr("width", width).
    attr("height", height).
    append("g");

  svg.selectAll("rect").
    data(data).
    enter().append("rect").
    attr('width', cellWidth).
    attr('height', cellHeight).
    attr('x', function(d, i) { return d.x * cellWidth; }).
    attr('y', function(d, i) { return d.y * cellHeight; }).
    attr('fill', function(d) { return 'rgb(' + d.r + ',' +  d.g + ',' + d.b + ')'; });
};

window.inYourFace = inYourFace;

})();
