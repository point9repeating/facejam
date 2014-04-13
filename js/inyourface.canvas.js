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
  rect: function(color, x, y, cw, ch, width, height) {
    facejam.fillStyle = color;
    facejam.fillRect(x * width, y * height, cw, ch);
    facejam.strokeRect(x * width, y* height, cw, ch);
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
    facejam.stroke();
    facejam.closePath();
  },
  triangle: function(color, x, y, cw, ch, width, height) {
    facejam.fillStyle = color;
    facejam.beginPath();
    facejam.moveTo(x * width, y * height);
    facejam.lineTo(x * width + cw, y * height);
    facejam.lineTo(x * width + cw, y * height + ch);
    facejam.lineTo(x * width, y * height);
    facejam.fill();
    facejam.stroke();
    facejam.closePath();
  },
  parallelogram: function(color, x, y, cw, ch, width, height) {
    facejam.fillStyle = color;
    facejam.beginPath();
    facejam.moveTo(x * width + cw / 2, y * height);
    facejam.lineTo(x * width + cw, y * height);
    facejam.lineTo(x * width + cw / 2, y * height + ch);
    facejam.lineTo(x * width, y * height + ch);
    facejam.lineTo(x * width + cw / 2, y * height);
    facejam.fill();
    facejam.stroke();
    facejam.closePath();
  }
};

var inYourFace = function(data, freqData, width, height, shape, distort) {
  var cellWidth = width / Math.sqrt(data.length);
  var cellHeight = height / Math.sqrt(data.length);
  var cw = width / Math.sqrt(data.length);
  var ch = height / Math.sqrt(data.length);

  var cellWidth = function(i) {
    if(!freqData) {
      return cw; 
    }
    if (data.length > freqData.length) {
      i = Math.round(i / (data.length / freqData.length));
    }
    if(freqData[i] === undefined) {
      return cw / 2;
    }

    return distort*freqData[i] * cw / 255;
  };
  var cellHeight = function(i) {
    if(!freqData) {
      return ch; 
    }
    if (data.length > freqData.length) {
      i = Math.round(i / (data.length / freqData.length));
    }
    if(freqData[i] === undefined) {
      return cw / 2;
    }
    return distort*freqData[i] * ch / 255;
  };

  canvas.width = width;
  canvas.height = height;

  data.forEach(function(d, i) {
    shapes[shape](d.rgb, d.x, d.y, cellWidth(i), cellHeight(i), cw, ch);
  });
};

window.inYourFace = inYourFace;

})();
