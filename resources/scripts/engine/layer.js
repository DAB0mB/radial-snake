Engine.Layer = class Layer {
  // The dimensions of the layer are correlated to dimensions of the canvas
  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  // A hash of "eventName" : "handlerName" which should be overrided by user
  get events() {
    return {};
  }

  constructor(screen) {
    this.age = 0;
    this.creation = new Date().getTime();
    this.screen = screen;
    this.game = screen.game;
    this.assets = screen.assets;
    this.keyStates = screen.keyStates;
    this.canvas = screen.game.canvas;
  }

  update(span) {
  }

  draw(context) {
  }

  initEventListeners() {
    _.each(this.events, (listener, event) => {
      this.game.addEventListener(event, this[listener], this);
    });
  }

  disposeEventListeners() {
    _.each(this.events, (listener, event) => {
      this.game.removeEventListener(event, this[listener]);
    });
  }
};