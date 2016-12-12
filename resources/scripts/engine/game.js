Engine.Game = class Game {
  // The frequency of which each frame will be drawn in milliseconds
  get fps() {
    return 1000 / 60;
  }

  // Game's run speed.
  // A lower value will make it run slower and a higher value will make it run faster
  get speed() {
    return 1;
  }

  constructor(canvas) {
    this.canvas = canvas;
    this.lastUpdate = this.creation = new Date().getTime();

    // Canvas dimensions must be set programmatically, otherwise you might encounter some
    // unexpected behaviors
    canvas.width = 1280;
    canvas.height = 720;
    // Canvas will be focused once game page is loaded so all events will automatically
    // be captured by it
    canvas.focus();

    // We want to focus on the canvas once we press on it
    canvas.addEventListener("mousedown", canvas.focus.bind(canvas), false);
    // Key flags will be registered by the "KeyStates" instance
    canvas.addEventListener("keydown", onKeyDown.bind(this), false);
    canvas.addEventListener("keyup", onKeyUp.bind(this), false);

    this.assets = {};
    this.events = new Map();
    this.keyStates = new Engine.KeyStates();
    this.context = canvas.getContext("2d");
    this.bufferedCanvas = document.createElement("canvas");
    this.bufferedContext = this.bufferedCanvas.getContext("2d");
    this.bufferedCanvas.width = canvas.width;
    this.bufferedCanvas.height = canvas.height;
  }

  draw() {
    // Draw a black screen by default
    this.context.restore();
    this.context.fillStyle = "black";
    this.context.save();
    this.context.beginPath();
    this.context.rect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fill();
  }

  update() {
    // Calculate the time elapsed
    let lastUpdate = this.lastUpdate;
    let currUpdate = this.lastUpdate = new Date().getTime();
    let span = currUpdate - lastUpdate;
    this.updateScreen(span / this.speed);
  }

  // The main loop of the game
  loop() {
    // If paused, don't run loop. The canvas will remain as is
    if (!this.playing) return;

    setTimeout(() => {
      this.draw();
      this.update();
      this.loop();
    }, this.fps);
  }

  play() {
    this.playing = true;
    this.loop();
  }

  pause() {
    this.playing = false;
  }

  // Defines global assets
  extendAssets(assets) {
    _.extend(this.assets, assets);
  }

  // Disposes global assets
  clearAssets() {
    this.assets = {};
  }

  // Adds event listener for game canvas
  addEventListener(type, listener, target) {
    let boundListener = listener.bind(target);
    this.events.set(listener, boundListener);
    this.canvas.addEventListener(type, boundListener, false);
  }

  // Removes event listener from game canvas
  removeEventListener(type, listener) {
    let boundListener = this.events.get(listener);
    this.events.delete(listener);
    this.canvas.removeEventListener(type, boundListener, false);
  }
};

function onKeyDown(e) {
  // Once we're focused on the canvas, we want nothing else to happen
  // besides events the game is listening to. For example, when we press
  // the arrow keys, this will prevent the screen from scrolling
  e.preventDefault();
  // Register key press
  this.keyStates.add(e.keyCode);
}

function onKeyUp(e) {
  e.preventDefault();
  // Register key release
  this.keyStates.remove(e.keyCode);
}
