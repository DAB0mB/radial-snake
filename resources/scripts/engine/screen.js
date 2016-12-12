Engine.Screen = class Screen {
  // The dimensions of the screen are correlated to dimensions of the canvas
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

  constructor(game) {
    this.age = 0;
    this.creation = new Date().getTime();
    this.game = game;
    this.canvas = game.canvas;
    this.keyStates = game.keyStates;
    this.assets = _.clone(game.assets);
    this.layers = [];
  }

  // A custom initialization function should be implemented by child-class
  initialize() {
    return this;
  }

  // Updates each layer
  update(span) {
    this.layers.forEach(layer => {
      layer.age += span;
      layer.update(span);
    });
  }

  // Draws each layer
  draw(context) {
    this.layers.forEach(layer => {
      layer.draw(context);
    });
  }

  // Push a new layer to the top of the layers stack
  appendLayer(Layer, ...layerArgs) {
    let layer = new Layer(this, ...layerArgs);
    this.layers.push(layer);
    layer.initEventListeners();
  }

  // Push a new layer to the bottom of the layers stack
  prependLayer(Layer, ...layerArgs) {
    let layer = new Layer(this, ...layerArgs);
    this.layers.unshift(layer);
    layer.initEventListeners();
  }

  // Removes the given layer from the layers stack
  removeLayer(layer) {
    this.layers = _.without(this.layers, layer);
    layer.disposeEventListeners();
  }

  initEventListeners() {
    _.each(this.events, (listener, event) => {
      this.game.addEventListener(event, this[listener], this);
    });

    this.layers.forEach(layer => {
      layer.initEventListeners();
    });
  }

  disposeEventListeners() {
    _.each(this.events, (listener, event) => {
      this.game.removeEventListener(event, this[listener], this);
    });

    this.layers.forEach(layer => {
      layer.disposeEventListeners();
    });
  }
};