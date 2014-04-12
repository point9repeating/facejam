(function() {

var currentShape;

var colorbar = function(data, freqData, height) {
  var svg = d3.select('svg.colors');
  var width = 255;

  var width = function(i) {
    if(!freqData || !i) {
      return 255;
    }
    return freqData[i];
  };

  if(svg.empty()) {
    svg = d3.select('body').
      append('svg').
      attr('class', 'colors');
  }

  svg.attr('width', width).
    attr('height', height);

  var h  = height / data.length

  var colors = svg.selectAll('rect').
    data(data);

  colors.enter().
    append('rect');

  colors.
    attr('width', function(d, i) { return width(i); }).
    attr('height', h).
    attr('x', 0).
    attr('y', function(d, i) { return i * h; }).
    attr('fill', function(d) { return d.rgb; });

  colors.exit().remove();

};

window.colorbar = colorbar;

var inYourFace = function(data, freqData, width, height, shape) {
  var cellWidth = width / Math.sqrt(data.length);
  var cellHeight = height / Math.sqrt(data.length);
  var svg;
  var cw = width / Math.sqrt(data.length);
  var ch = height / Math.sqrt(data.length);

  var cellWidth = function(i) {
    if(!freqData) {
      return cw; 
    }
    return 2*freqData[i] * cw / 255 + cw / 2;// + 0.1 *cw;
    return 2 * freqData[i] * cw / 255 + 0.1 *cw;
  };
  var cellHeight = function(i) {
    if(!freqData) {
      return ch; 
    }
    return 2*freqData[i] * ch / 255 + cw / 2;// + 0.1*ch;
    return 2* freqData[i] * ch / 255 + 0.1*ch;
  };

  if(shape !== currentShape) {
    d3.select("body").select("svg.face").remove();
  
    svg = d3.select("body").
      append("svg").
      attr('class', 'face').
      attr("width", width).
      attr("height", height).
      append("g");
  } else {

    svg = d3.select("svg.face").
      attr('width', width).
      attr('height', height).
      select('g');
  }
  
  currentShape = shape;
  
  var shapes = svg.selectAll(shape).
    data(data);

  shapes.
    enter().append(shape);

  shapes.
    attr('width', function(d, i) { return cellWidth(i); }).
    attr('height', function(d, i) { return cellHeight(i); }).
    attr('x', function(d, i) { return d.x * cw; }).
    attr('y', function(d, i) { return d.y * ch; }).
    attr('r', function(d, i) { return Math.max(cellWidth(i), cellHeight(i)) / 2; }).
    attr('cx', function(d, i) { return d.x * cw + cw / 2; }).
    attr('cy', function(d, i) { return d.y * ch + ch / 2; }).
    attr('fill', function(d) { return d.rgb; });

  if(shape === 'ellipse') {
    shapes.
      attr('rx', function(d, i) { return cellWidth(i) / 2; }).
      attr('ry', function(d, i) { return cellHeight(i) / 2; });
  }
  
  shapes.exit().remove();

};

window.inYourFace = inYourFace;

})();
