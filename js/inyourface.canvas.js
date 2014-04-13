(function() {

var currentShape;
var canvas = document.getElementById('facejam');
var colorbarCan = document.getElementById('colorbar');
var colorbarCtx = colorbarCan.getContext('2d');
var facejam = canvas.getContext('2d');

var colorbar = function(data, freqData, height) {
  //var svg = d3.select('svg.colors');
  var width = 255;

  var width = function(i) {
    if(!freqData || !i) {
      return 255;
    }
    if(data.length > freqData.length) {
      i = Math.round( i / 4 );
    }

    return freqData[i];
  };

  colorbarCan.width = width();
  colorbarCan.height = height;
  
  var h  = height / data.length
  data.forEach(function(d, i) {
    colorbarCtx.fillStyle = d.rgb;
    colorbarCtx.fillRect(0, i * h, width(i), h);
  });
};

window.colorbar = colorbar;

var shapes = {
  rect: function(color, x, y, cw, ch, width, height) {
    facejam.fillStyle = color;
    facejam.fillRect(x * width, y * height, cw, ch);
  },
  circle: function(color, x, y, cw, ch, width, height) {
    facejam.fillStyle = color;
    facejam.beginPath();
    facejam.arc(
      x * width + width / 2, 
      y * height + height / 2,
      Math.max(cw, ch) / 2,
      0,
      Math.PI*2,true
    );
    facejam.fill();
    facejam.closePath();
  },
  ellipse: function(color, x, y, width, height) {

  }
};

var inYourFace = function(data, freqData, width, height, shape) {
  var cellWidth = width / Math.sqrt(data.length);
  var cellHeight = height / Math.sqrt(data.length);
  var cw = width / Math.sqrt(data.length);
  var ch = height / Math.sqrt(data.length);

  var cellWidth = function(i) {
    if(!freqData) {
      return cw; 
    }
    if (data.length > freqData.length) {
      i = Math.round(i / 4);
    }
    if(!freqData[i]) {
      return cw / 2;
    }

    return 2*freqData[i] * cw / 255 + cw / 2;// + 0.1 *cw;
    return 2 * freqData[i] * cw / 255 + 0.1 *cw;
  };
  var cellHeight = function(i) {
    if(!freqData) {
      return ch; 
    }
    if (data.length > freqData.length) {
      i = Math.round(i / 4);
    }
    if(!freqData[i]) {
      return cw / 2;
    }
    return 2*freqData[i] * ch / 255 + cw / 2;// + 0.1*ch;
    return 2* freqData[i] * ch / 255 + 0.1*ch;
  };

  canvas.width = width;
  canvas.height = height;

  data.forEach(function(d, i) {
    shapes[shape](d.rgb, d.x, d.y, cellWidth(i), cellHeight(i), cw, ch);
  });
};

window.inYourFace = inYourFace;

})();
