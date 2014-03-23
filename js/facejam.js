(function() {
  //var imageDrop = document.getElementById("image-drop");

  var canvas = document.getElementsByTagName("canvas")[0];
  var ctx = canvas.getContext('2d');
  var img = new Image();

  var N = 50;

  img.onload = function() {
    var aspectRatio = img.width / img.height;
    var width = canvas.width = canvas.height * aspectRatio;
    var height = canvas.height;
    //ctx.drawImage(img, 0, 0, img.width / 2, img.height/2);
    ctx.drawImage(img, 0, 0, width, height);
    console.log(img.width, img.height);
    //var imageData = ctx.getImageData(0, 0, img.width, img.height / 2);
    //var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    //var yPoints = canvas.height / N;
    //var xPoints = yPoints;

    var patchWidth = width / N;
    var patchHeight = height / N;

    console.log('width', width, 'height', height);
    console.log('patch width', patchWidth, 'patch height', patchHeight);

    var facePoints = [];

    //console.log("image data length", imageData.data.length);

    for(var x=0; x < N; x++) {
      for(var y=0; y < N; y++) {
	var patch = ctx.getImageData(
	  x * patchWidth,
	  y * patchHeight,
	  patchWidth,
	  patchHeight
	  )

	var length = patch.data.length;
	var i = -4;
	var rgb = {
	  r: 0,
	  g: 0,
	  b: 0
	};
	
	var count = 0;
	
	while ( (i+=4) < length) {
	  count++;
	  rgb.r += patch.data[i];
	  rgb.g += patch.data[i+1];
	  rgb.b += patch.data[i+2];
	}

	//console.log('count', count);
	
	rgb.r = ~~(rgb.r / count);
	rgb.g = ~~(rgb.g / count);
	rgb.b = ~~(rgb.b / count);
	rgb.x = x;
	rgb.y = y;

	facePoints.push(rgb);

      }
    }

    console.log('loop done');
    console.log(facePoints);
    inYourFace(facePoints, width, height);

  };

  canvas.ondragover = function () { this.className = 'hover'; return false; };
  canvas.ondragend = function () { this.className = ''; return false; };
  canvas.ondrop = function (e) {
    //this.className = '';
    e.preventDefault();

    var file = e.dataTransfer.files[0],
    reader = new FileReader();
    reader.onload = function (event) {
      console.log(event.target);
      img.src = event.target.result;
      //canvas.style.background = 'url(' + event.target.result + ') no-repeat center';
    };
    console.log(file);
    reader.readAsDataURL(file);

    return false;
  };

})();
