Game.Screens.Play = class Play extends Engine.Screen {
  get events() {
    return {
      "keydown": "onKeyDown"
    }
  }

  // The ready screen will be the initial screen
  initialize(game, snakes) {
    this.appendLayer(Game.Screens.Play.Ready, snakes);
  }

  onKeyDown() {
    // Once escape is pressed, return to main menu screen
    if (this.keyStates.get(27)) {
      this.game.changeScreen(Game.Screens.Menu);
    }
  }
};