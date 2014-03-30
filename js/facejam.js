(function() {
  navigator.getUserMedia = (
    navigator.getUserMedia || 
      navigator.webkitGetUserMedia || 
      navigator.mozGetUserMedia || 
      navigator.msGetUserMedia);

  window.AudioContext = (
    window.AudioContext ||
      window.webkitAudioContext
  );

  var audioContext = new AudioContext();
  var analyser = audioContext.createAnalyser();

  window.analyser = analyser;

  var video = document.getElementsByTagName('video')[0];
  var audio = document.getElementsByTagName('audio')[0];
  var shapeSelect = document.querySelectorAll('select[name="shape"]')[0];
  var cellOutput = document.querySelectorAll('output[name="cellsoutput"]')[0];
  var cellInput = document.querySelectorAll('input[name="cells"]')[0];
  var camButton = document.querySelectorAll('button[name="usecam"]')[0];
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var img = new Image();
  var width, height, aspectRatio;
  var facePoints = {};
  var audioPlaying = false;
  var source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioContext.destination);

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
    var t = (new Date).getTime();
    if(!facePoints[cellCount]) {
      facePoints[cellCount] = getFacePoints(cellCount);
      //console.log("getfacepoints", (new Date).getTime() - t);
    }
    t = (new Date).getTime();
    var data = facePoints[cellCount];
    var freqData;

    if(audioPlaying) {
      analyser.fftSize = Math.min(2 * data.length, 2048);
      var freqData = new Float32Array(analyser.frequencyBinCount);
      var freqData = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(freqData);
    }
    colorbar(data, freqData, window.innerHeight);
    inYourFace(data, freqData, window.innerHeight*aspectRatio, window.innerHeight, getShape());
  };

  shapeSelect.onchange = redraw;
  cellInput.onchange = redraw;

  img.onload = function() {
    facePoints = {};
    aspectRatio = img.width / img.height;
    var cellCount = parseInt(cellInput.value);
    width = canvas.width = canvas.height * aspectRatio;
    height = canvas.height;
    //width = canvas.width = cellCount;
    //height = canvas.height = cellCount;
    ctx.drawImage(img, 0, 0, width, height);
    redraw();
    canvas.style.display = 'none';
  };

  var getFacePoints = function(N) {
    N = Math.pow(2, N);
    
    var patchWidth = canvas.width / N;
    var patchHeight = canvas.height / N;
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

        rgb = 'rgb(' + rgb.join(',') + ')';

        points.push({
          x: x,
          y: y,
          rgb: rgb,
          hsl: d3.hsl(rgb)
        });
      }
    }

    points.sort(function(a, b) {
      return a.hsl.l < b.hsl.l ? 1 : -1;
      //return a.hsl.l > b.hsl.l ? 1 : -1;
      //return a.hsl.h > b.hsl.h ? 1 : -1;
    });

    return points;
  };

  var body = document.getElementsByTagName("body")[0];

  body.ondragover = function () { return false; };
  body.ondragend = function () { return false; };
  body.ondrop = function (e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0],
    reader = new FileReader();
    reader.onload = function (event) {
      //img.src = event.target.result;
      audio.src = event.target.result;
      audio.play();
      audioPlaying = true;
    };
    reader.readAsDataURL(file);
    return false;
  };

  var cam = function() {
    var camStream = null;
    
    navigator.getUserMedia({ video: true, audio: false }, function(stream) {
      var url = window.URL || window.webkitURL;
      video.src = url ? url.createObjectURL(stream) : stream;
      //video.muted = true;
      video.play();
      //audio.play();

      camStream = stream;
    }, function(err) {
      console.log('error with stream!', err);
    });

    video.addEventListener('canplay', function(event) {
      aspectRatio = video.videoWidth / video.videoHeight;
      canvas.width = width = video.videoWidth / 4;
      canvas.height = height = video.videoHeight / 4;
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

      document.addEventListener("keydown", function(event) {
        if(event.keyCode === 32) {
          event.preventDefault();
          video.pause();
          audio.pause();
          camStream.stop();
        }
      });
      
    }, false);
  };

})();
