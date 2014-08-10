(function() {

var currentShape;
var canvas = document.getElementById('facejam');
var colorbarCan = document.getElementById('colorbar');
var colorbarCtx = colorbarCan.getContext('2d');
var facejam = canvas.getContext('2d');

var colorbar = function(data, freqData, height) {
  var width = function(i) {
    if(!freqData || !i) {
      return 255;
    }
    if(data.length > freqData.length) {
      i = Math.round( i / (data.length / freqData.length) );
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

  rect: function(x, y, cw, ch, width, height) {
    facejam.rect(x * width, y * height, cw, ch);
  },

  circle: function(x, y, cw, ch, width, height) {
    facejam.arc(
      x * width + width / 2, 
      y * height + height / 2,
      Math.max(cw, ch) / 2,
      0,
      Math.PI*2,true
    );
  },

  triangle: function(x, y, cw, ch, width, height) {
    facejam.moveTo(x * width, y * height);
    facejam.lineTo(x * width + cw, y * height);
    facejam.lineTo(x * width + cw, y * height + ch);
    facejam.lineTo(x * width, y * height);
  },

  parallelogram: function(x, y, cw, ch, width, height) {
    facejam.moveTo(x * width + cw / 2, y * height);
    facejam.lineTo(x * width + cw, y * height);
    facejam.lineTo(x * width + cw / 2, y * height + ch);
    facejam.lineTo(x * width, y * height + ch);
    facejam.lineTo(x * width + cw / 2, y * height);
  },
  
  pentagon: function(x, y, cw, ch, width, height) {
    x = x * width;
    y = y * height;
    var delta = Math.tan(30 * Math.PI / 180) / 2;

    facejam.moveTo(x + cw / 2, y);
    facejam.lineTo(x + cw, y + ch * delta);
    facejam.lineTo(x + cw - cw * delta, y + ch);
    facejam.lineTo(x + cw * delta, y + ch);
    facejam.lineTo(x, y + ch * delta);
    facejam.lineTo(x + cw / 2, y);
  }

};

var shapeKeys = Object.keys(shapes);

var inYourFace = function(data, freqData, width, height, shape, distort, stroke, fill) {
  var cw = width / Math.sqrt(data.length);
  var ch = height / Math.sqrt(data.length);

  var scale = function(i) {
    if(!freqData) {
      return 1; 
    }
    if (data.length > freqData.length) {
      i = Math.round(i / (data.length / freqData.length));
    }
    if(freqData[i] === undefined) {
      return 0.5;
    }
    return distort*freqData[i] / 255;
  };

  canvas.width = width;
  canvas.height = height;

  data.forEach(function(d, i) {
    var render = shapes[shape];
    if(shape === 'random') {
      render = shapes[shapeKeys[Math.round(Math.random() * (shapeKeys.length - 1))]];
    }
    facejam.fillStyle = d.rgb;
    facejam.strokeStyle = fill ? 'black' : d.rgb;
    facejam.lineWidth = 1;
    facejam.beginPath();
    var x = scale(i);
    render(d.x, d.y, x*cw, x*ch, cw, ch);
    (fill && facejam.fill());
    (stroke && facejam.stroke());
    facejam.closePath();
  });
};

window.inYourFace = inYourFace;

})();
