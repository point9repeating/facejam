(function() {
  var shapeSelect = document.querySelectorAll('select[name="shape"]')[0];
  var cellInput = document.querySelectorAll('input[name="cells"]')[0];
  var canvas = document.getElementsByTagName("canvas")[0];
  var ctx = canvas.getContext('2d');
  var img = new Image();

  img.onload = function() {
    var N = parseInt(cellInput.value);
    var shape = shapeSelect.options[shapeSelect.selectedIndex].value;
    var aspectRatio = img.width / img.height;
    var width = canvas.width = canvas.height * aspectRatio;
    var height = canvas.height;
    var patchWidth = width / N;
    var patchHeight = height / N;
    var facePoints = [];

    ctx.drawImage(img, 0, 0, width, height);

    for(var x=0; x < N; x++) {
      for(var y=0; y < N; y++) {
	var patch = ctx.getImageData(
	  x * patchWidth,
	  y * patchHeight,
	  patchWidth,
	  patchHeight
	  )
	var count = 0;
	var length = patch.data.length;
	var rgb = {
	  r: 0,
	  g: 0,
	  b: 0
	};

	var i = -4;
	while ( (i+=4) < length) {
	  count++;
	  rgb.r += patch.data[i];
	  rgb.g += patch.data[i+1];
	  rgb.b += patch.data[i+2];
	}

	rgb.r = ~~(rgb.r / count);
	rgb.g = ~~(rgb.g / count);
	rgb.b = ~~(rgb.b / count);
	rgb.x = x;
	rgb.y = y;

	facePoints.push(rgb);
      }
    }

    inYourFace(facePoints, width, height, shape);
    canvas.style.display = 'none';
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

})();
