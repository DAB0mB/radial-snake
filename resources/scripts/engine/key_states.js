Engine.KeyStates = class KeyStates {
  constructor() {
    // We will have 255 states, each one represents an ascii code matching its index
    this.states = new Array(255);
  }

  get(k) {
    return this.states[k];
  }

  // This should be called once we press a key
  add(k) {
    this.states[k] = true;
  }

  // This should be called once we release a key
  remove(k) {
    this.states[k] = false;
  }
};