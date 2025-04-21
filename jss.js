var canvas;
var stage;
var container;
var captureContainers;
var captureIndex;
var imageContainer;

function init() {
  // create a new stage and point it at our canvas:
  canvas = document.getElementById("testCanvas");
  stage = new createjs.Stage(canvas);
  
  // Set initial canvas dimensions
  resizeCanvas();
  
  // Add window resize listener
  window.addEventListener('resize', resizeCanvas);

  container = new createjs.Container();
  stage.addChild(container);

  captureContainers = [];
  captureIndex = 0;

  // create a large number of slightly complex vector shapes, and give them random positions and velocities:
  for (var i = 0; i < 100; i++) {
    var heart = new createjs.Shape();
    heart.graphics.beginFill(createjs.Graphics.getHSL(Math.random() * 30 - 45, 100, 50 + Math.random() * 30));
    heart.graphics.moveTo(0, -12).curveTo(1, -20, 8, -20).curveTo(16, -20, 16, -10).curveTo(16, 0, 0, 12);
    heart.graphics.curveTo(-16, 0, -16, -10).curveTo(-16, -20, -8, -20).curveTo(-1, -20, 0, -12);
    heart.y = -100;

    container.addChild(heart);
  }

  var w = canvas.width;
  var h = canvas.height;
  
  // Create image that will appear below text
  imageContainer = new createjs.Container();
  var image = new Image();
  image.src = "image.png";
  image.onload = function() {
    var bitmap = new createjs.Bitmap(image);
    // Make image bigger by increasing scale
    bitmap.scaleX = bitmap.scaleY = 0.3; // Changed from 0.15 to 0.3
    bitmap.regX = image.width / 2;
    bitmap.regY = image.height / 2;
    bitmap.x = w / 2;
    bitmap.y = h / 2 + 150; // Position even lower (was 100, now 150)
    bitmap.alpha = 0; // Start transparent
    
    imageContainer.addChild(bitmap);
    stage.addChild(imageContainer);
    
    // Add text on top of everything and move it higher
    // var text = new createjs.Text("the longer I'm with you\nthe more I love you", "bold 24px Arial", "#312");
    // text.textAlign = "center";
    // text.x = w / 2;
    // text.y = h / 2 - 100; // Move text even higher (was -50, now -100)
    // stage.addChild(text);
    
    // Fade in the image
    createjs.Tween.get(bitmap)
      .wait(3000) // Wait 3 seconds before starting
      .to({alpha: 1}, 2000); // Fade in over 2 seconds
  };

  for (i = 0; i < 100; i++) {
    var captureContainer = new createjs.Container();
    captureContainer.cache(0, 0, w, h);
    captureContainers.push(captureContainer);
  }

  // start the tick and point it at the window so we can do some work before updating the stage:
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.on("tick", tick);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  if (stage) {
    // Update text position if stage exists
    if (stage.children.length > 1) {
      // Find the text object
      for (var i = 0; i < stage.children.length; i++) {
        var child = stage.getChildAt(i);
        if (child instanceof createjs.Text) {
          child.x = canvas.width / 2;
          child.y = canvas.height / 2 - 100; // Move text higher on resize too (was -50)
        }
        // Update image position if it exists
        else if (child === imageContainer && imageContainer.children.length > 0) {
          var bitmap = imageContainer.getChildAt(0);
          bitmap.x = canvas.width / 2;
          bitmap.y = canvas.height / 2 + 150; // Position lower on resize too (was +100)
        }
      }
    }
    
    // Update cache containers if they exist
    if (captureContainers) {
      for (var i = 0; i < captureContainers.length; i++) {
        captureContainers[i].cache(0, 0, canvas.width, canvas.height);
      }
    }
    
    stage.update();
  }
}

function tick(event) {
  var w = canvas.width;
  var h = canvas.height;
  var l = container.numChildren;

  captureIndex = (captureIndex + 1) % captureContainers.length;
  stage.removeChildAt(0);
  var captureContainer = captureContainers[captureIndex];
  stage.addChildAt(captureContainer, 0);
  captureContainer.addChild(container);

  // iterate through all the children and move them according to their velocity:
  for (var i = 0; i < l; i++) {
    var heart = container.getChildAt(i);
    if (heart.y < -50) {
      heart._x = Math.random() * w;
      heart.y = h * (1 + Math.random()) + 50;
      heart.perX = (1 + Math.random() * 2) * h;
      heart.offX = Math.random() * h;
      heart.ampX = heart.perX * 0.1 * (0.15 + Math.random());
      heart.velY = -Math.random() * 2 - 1;
      heart.scale = Math.random() * 2 + 1;
      heart._rotation = Math.random() * 40 - 20;
      heart.alpha = Math.random() * 0.75 + 0.05;
      heart.compositeOperation = Math.random() < 0.33 ? "lighter" : "source-over";
    }
    var int = (heart.offX + heart.y) / heart.perX * Math.PI * 2;
    heart.y += heart.velY * heart.scaleX / 2;
    heart.x = heart._x + Math.cos(int) * heart.ampX;
    heart.rotation = heart._rotation + Math.sin(int) * 30;
  }

  captureContainer.updateCache("source-over");

  // draw the updates to stage:
  stage.update(event);
}

init();