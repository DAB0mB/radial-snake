Engine.Restorable = class Restorable {
  // Acts the same as canvas's save() and restore() API.
  // 'restorable' props are defined in the constructor
  constructor(...restorableProps) {
    this._restorableProps = restorableProps;
    this._restorableStates = [];
  }

  // Save current state in the stack
  save() {
    this._restorableStates.push(this._restorableProps.reduce((state, prop) => {
      state[prop] = this[prop];
      return state;
    }, {}));
  }

  // Pop most recent state and apply it
  restore() {
    _.extend(this, this._restorableStates.pop());
  }
};