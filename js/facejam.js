(function() {
  navigator.getUserMedia = (
    navigator.getUserMedia || 
      navigator.webkitGetUserMedia || 
      navigator.mozGetUserMedia || 
      navigator.msGetUserMedia);

  var video = document.getElementsByTagName('video')[0];
  var shapeSelect = document.querySelectorAll('select[name="shape"]')[0];
  var cellInput = document.querySelectorAll('input[name="cells"]')[0];
  var camButton = document.querySelectorAll('button[name="usecam"]')[0];
  var canvas = document.getElementsByTagName("canvas")[0];
  var ctx = canvas.getContext('2d');
  var img = new Image();
  var width, height, aspectRatio;
  var facePoints = {};

  var getShape = function() {
    return shapeSelect.options[shapeSelect.selectedIndex].value;
  };

  camButton.addEventListener('click', function(event) {
    event.preventDefault();
    facePoints = {};
    cam();
  });

  var redraw = function(event) {
    if(!width || !height) {
      return;
    }
    var shape = getShape();
    var cellCount = parseInt(cellInput.value);
    if(!facePoints[cellCount]) {
      facePoints[cellCount] = getFacePoints(cellCount);
    }
    inYourFace(facePoints[cellCount], width, height, getShape());
  };

  shapeSelect.onchange = redraw;
  cellInput.onchange = redraw;

  img.onload = function() {
    facePoints = {};
    aspectRatio = img.width / img.height;
    width = canvas.width = canvas.height * aspectRatio;
    height = canvas.height;
    ctx.drawImage(img, 0, 0, width, height);
    redraw();
    canvas.style.display = 'none';
  };

  var getFacePoints = function(N) {
    var patchWidth = width / N;
    var patchHeight = height / N;
    var points = [];

    for(var x=0; x < N; x++) {
      for(var y=0; y < N; y++) {
        var patch = ctx.getImageData(
          x * patchWidth,
          y * patchHeight,
          patchWidth,
          patchHeight
        );
        var count = 0;
        var length = patch.data.length;
        var rgb = [0, 0, 0];
        var i = -4;

        while ( (i+=4) < length) {
          count++;
          rgb[0] += patch.data[i];
          rgb[1] += patch.data[i+1];
          rgb[2] += patch.data[i+2];
        }

        rgb[0] = ~~(rgb[0] / count);
        rgb[1] = ~~(rgb[1] / count);
        rgb[2] = ~~(rgb[2] / count);

        points.push({
          x: x,
          y: y,
          rgb: rgb
        });
      }
    }
    return points;
  };

  canvas.ondragover = function () { this.className = 'hover'; return false; };
  canvas.ondragend = function () { this.className = ''; return false; };
  canvas.ondrop = function (e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0],
    reader = new FileReader();
    reader.onload = function (event) {
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    return false;
  };

  var cam = function() {
    var camStream = null;
    
    navigator.getUserMedia({ video: true, audio: false }, function(stream) {
      var url = window.URL || window.webkitURL;
      video.src = url ? url.createObjectURL(stream) : stream;
      video.play();
      camStream = stream;
    }, function(err) {
      console.log('error with stream!', err);
    });

    video.addEventListener('canplay', function(event) {
      height = canvas.height;
      aspectRatio = video.videoWidth / video.videoHeight;
      width = canvas.width = canvas.height * aspectRatio;
    });

    video.addEventListener('play', function() {
      var animate = function() {
        if (video.paused || video.ended) return;
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(video, 0, 0, width, height);
        canvas.style.display = 'none';
        facePoints = {};
        redraw();
        requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
        
      setTimeout(function() {
        video.pause();
        camStream.stop();
        facePoints = {};
        redraw();
        canvas.style.display = 'none';
      }, 10000);
      
    }, false);
  };

})();
