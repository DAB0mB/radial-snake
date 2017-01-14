Game.Screens.Play = class Play extends Engine.Screen {
  get events() {
    return {
      "keydown": "onKeyDown"
    }
  }

  onKeyDown() {
    // Once escape is pressed, return to main menu screen
    if (this.keyStates.get(27)) {
      this.game.changeScreen(Game.Screens.Menu);
    }
  }
};