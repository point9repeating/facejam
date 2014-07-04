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
  var distortionInput = document.getElementById('distortion');
  var colorSorts = document.getElementsByName('colorsort');
  var reverseSort = document.getElementById('reverse-sort');
  var stroke = document.getElementById('stroke');
  var fill = document.getElementById('fill');
  var camButton = document.querySelectorAll('button[name="usecam"]')[0];
  var micButton = document.querySelectorAll('button[name="usemic"]')[0];
  var pixelPerf = document.getElementById('pixelmath-perf');
  var renderPerf = document.getElementById('render-perf');
  var fps = document.getElementById('fps');
  var sortPerf = document.getElementById('sort-perf');
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
  analyser.smoothingTimeConstant = 0.3;

  var fibonacci = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

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
    inYourFace(data, freqByteData, window.innerHeight*aspectRatio, window.innerHeight, getShape(), distortionInput.value, stroke.checked, fill.checked);
    renderPerf.innerHTML = (new Date).getTime() - t;
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

  var round = function(x) {
    return ~~(x + 0.5);
  };

  var getFacePoints = function(N) {
    N = Math.pow(2, N);

    var canWidth = canvas.width;
    var patchWidth = canvas.width / N;
    var patchHeight = canvas.height / N;
    var points = [];
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for(var y=0; y < N; y++) {
      var y1 = round( y * patchHeight );
      var y2 = round( ( y + 1 ) * patchHeight );
      var h = y2 - y1;
      for(var x=0; x < N; x++) {
        var x1 = round( x * patchWidth );
        var x2 = round( ( x + 1 ) * patchWidth );
        var count = 0;
        var rgb = [0, 0, 0];

        for(var j=y1; j < y2; j++) {
          for(var k=x1; k < x2; k++) {
            count++;
            var index = (j * canWidth + k) * 4
            rgb[0] += imageData.data[index];
            rgb[1] += imageData.data[index + 1];
            rgb[2] += imageData.data[index + 2];
          }
        }

        //negative
        //rgb[0] = (255 - ~~(rgb[0] / count));
        //rgb[1] = (255 - ~~(rgb[1] / count));
        //rgb[2] = (255 - ~~(rgb[2] / count));

        rgb[0] = ~~(rgb[0] / count);
        rgb[1] = ~~(rgb[1] / count);
        rgb[2] = ~~(rgb[2] / count);

        rgb = 'rgb(' + rgb.join(',') + ')';
        var hsl = d3.hsl(rgb);

        points.push({
          x: x,
          y: y,
          rgb: rgb,
          hsl: hsl
        });
      }
    }
    
    var sortBy = getSortBy();

    var sort = reverseSort.checked ? 
      function(a, b) {
        return a.hsl < b.hsl ? -1 : 1;
      } : function(a, b) {
        return a.hsl < b.hsl ? 1 : -1;
      };

    var map = points.map(function(p, i) {
      return {
        hsl: p.hsl[sortBy],
        i: i
      };
    });

    var t = (new Date).getTime();

    map.sort(sort);

    var sorted = map.map(function(x) {
      return points[x.i];
    });

    sortPerf.innerHTML = (new Date).getTime() - t;

    return sorted;
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
