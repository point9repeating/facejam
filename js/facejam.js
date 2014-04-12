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
  var video = document.getElementsByTagName('video')[0];
  var audio = document.getElementsByTagName('audio')[0];
  var shapeSelect = document.querySelectorAll('select[name="shape"]')[0];
  var cellOutput = document.querySelectorAll('output[name="cellsoutput"]')[0];
  var cellInput = document.querySelectorAll('input[name="cells"]')[0];
  var minDecibelInput = document.getElementById('min-decibels');
  var colorSorts = document.getElementsByName('colorsort');
  var reverseSort = document.getElementById('reverse-sort');
  var camButton = document.querySelectorAll('button[name="usecam"]')[0];
  var micButton = document.querySelectorAll('button[name="usemic"]')[0];
  var pixelPerf = document.getElementById('pixelmath-perf');
  var renderPerf = document.getElementById('render-perf');
  var fps = document.getElementById('fps');
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var img = new Image();
  var width, height, aspectRatio;
  var facePoints = {};
  var audioPlaying = false;
  //for audio element (droppin' trax)
  //var source = audioContext.createMediaElementSource(audio);
  //source.connect(analyser);
  //analyser.connect(audioContext.destination);
  analyser.maxDecibels = -5;
  analyser.minDecibels = -70;
  analyser.smoothingTimeConstant = 0;

  var getShape = function() {
    return shapeSelect.options[shapeSelect.selectedIndex].value;
  };

  var getSortBy = function() {
    var sortBy;
    for(var i=0,len=colorSorts.length; i < len; i++) {
      if(colorSorts[i].checked) {
        sortBy = colorSorts[i].value;
        break;
      }
    }
    return sortBy;
  };

  minDecibelInput.addEventListener('change', function(event) {
    analyser.minDecibels = 0 - this.value;
  });

  camButton.addEventListener('click', function(event) {
    event.preventDefault();
    facePoints = {};
    cam();
  });

  micButton.addEventListener('click', function(event) {
    event.preventDefault();
    navigator.getUserMedia({ video: false, audio: true }, function(stream) {
      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      audioPlaying = true;
    }, function(err) {
      console.log('error with stream!', err);
    });
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
    }
    pixelPerf.innerHTML = (new Date).getTime() - t;
    t = (new Date).getTime();
    var data = facePoints[cellCount];
    var freqData, freqByteData;

    if(audioPlaying) {
      analyser.fftSize = Math.max(32, Math.min(2 * data.length, 2048));
      //freqData = new Float32Array(analyser.frequencyBinCount);
      freqByteData = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(freqByteData);
      //analyser.getFloatFrequencyData(freqData);
    }
    
    t = (new Date).getTime();
    colorbar(data, freqByteData, window.innerHeight);
    inYourFace(data, freqByteData, window.innerHeight*aspectRatio, window.innerHeight, getShape());
    renderPerf.innerHTML = (new Date).getTime() - t;
  };

  shapeSelect.onchange = function() {
    if(video.paused || video.ended) {
      requestAnimationFrame(redraw);
    }
  };
  cellInput.onchange = function() {
    if(video.paused || video.ended) {
      requestAnimationFrame(redraw);
    }
  };

  img.onload = function() {
    facePoints = {};
    aspectRatio = img.width / img.height;
    var cellCount = parseInt(cellInput.value);
    width = canvas.width = canvas.height * aspectRatio;
    height = canvas.height;
    ctx.drawImage(img, 0, 0, width, height);
    redraw();
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
    
    var sortBy = getSortBy();
    var sort = reverseSort.checked ? 
      function(a, b) {
        return a.hsl[sortBy] < b.hsl[sortBy] ? -1 : 1;
      } : function(a, b) {
        return a.hsl[sortBy] < b.hsl[sortBy] ? 1 : -1;
      };

    return points.sort(sort);
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

  audio.addEventListener("ended", function() {
    audioPlaying = false;
  });

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
      aspectRatio = video.videoWidth / video.videoHeight;
      canvas.width = width = video.videoWidth / 4;
      canvas.height = height = video.videoHeight / 4;
      //mirror the video
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    });

    video.addEventListener('play', function() {
      var animate = function() {
        if (video.paused || video.ended) return;
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(video, 0, 0, width, height);
        facePoints = {};
        redraw();
        fps.innerHTML = Math.round(1000 / ((new Date).getTime() - lastFrameTime));
        lastFrameTime = (new Date).getTime();
        requestAnimationFrame(animate);
      }
      var lastFrameTime = (new Date).getTime();
      requestAnimationFrame(animate);

      document.addEventListener("keydown", function(event) {
        if(event.keyCode === 32) {
          event.preventDefault();
          video.pause();
          audio.pause();
          audioPlaying = false;
          camStream.stop();
        }
      });
      
    }, false);
  };

})();
