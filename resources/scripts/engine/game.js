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
    this.screen = new Engine.Screen(this);
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
    this.drawScreen(this.context);
  }

  drawScreen(context) {
    // If screen's assets are not yet loaded, don't draw it
    if (this.screen.loading) return;
    if (this.screen.draw) this.screen.draw(context);
  }

  update() {
    // Calculate the time elapsed
    let lastUpdate = this.lastUpdate;
    let currUpdate = this.lastUpdate = new Date().getTime();
    let span = currUpdate - lastUpdate;
    this.updateScreen(span / this.speed);
  }

  updateScreen(span) {
    this.screen.age += span;
    // If screen's assets are not yet loaded, don't update it
    if (this.screen.loading) return;
    if (this.screen.update) this.screen.update(span);
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

  changeScreen(Screen, ...screenArgs) {
    // If there is a screen defined, dispose it first
    if (this.screen) {
      this.unloadScreen();
      this.screen.disposeEventListeners();
    }

    this.screen = new Screen(this, ...screenArgs);

    // Load screen assets
    this.loadScreen(() => {
      // Once assets are loaded, initialize event listeners
      this.screen.initEventListeners();
      // The "initialize" method is exactly the same as the constructor, only it runs
      // once assets are available and event listeners are registered
      this.screen.initialize(this, ...screenArgs);
    });
  }

  // Loads screen assets and invokes callback once loading is finished
  loadScreen(callback = _.noop) {
    if (!this.screen.load) return callback();

    this.screen.loading = true;
    // The number of assets to load
    let loadsize = 0;
    let onload;

    // This object can load assets
    let assetsLoader = new Engine.AssetsLoader(() => {
      loadsize++;
      return () => onload();
    });

    // The "load" method returns the assets loaded by the screen
    let screenAssets = this.screen.load(assetsLoader);

    // We use the "after" method because we want the following callback to be invoked
    // only once all assets are loaded
    onload = _.after(loadsize, () => {
      delete this.screen.loading;
      callback();
    });

    // The returned assets will be available on screen's assets object
    _.extend(this.screen.assets, screenAssets);
  }

  // Disposes screen assets
  unloadScreen() {
    if (!this.screen.unload) return;
    let assetsNames = this.screen.unload();
    _.omit(this.assets, assetsNames);
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
