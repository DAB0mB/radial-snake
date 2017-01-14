Game.Screens.Menu = class Menu extends Engine.Screen {
  get events() {
    return {
      "keydown": "onKeyDown"
    }
  }

  initialize() {
    // Initialize snake logo sprite
    this.logoSprite = new Engine.Sprite(this.assets.logoTexture);
    this.logoSprite.setPercentage("width", this.width, 30, "height");

    // Initialize instructions sprite
    let instructionsTexture = this.assets.minecraftiaFont.createTexture("Press a key to start");
    let instructionsSprite = new Engine.Sprite(instructionsTexture);
    instructionsSprite.align = "center";
    instructionsSprite.setPercentage("width", this.width, 35, "height");
    instructionsSprite.x = this.width / 2;
    instructionsSprite.y = this.height / 2;

    // Create flickering animation for instructions sprite
    this.instructionsAnim = new Engine.Animations.Keyframe(instructionsSprite, [
      {
        opacity: 1,
        frame: 0
      },
      {
        opacity: 0,
        frame: 2000
      }
    ]);

    // Play it repeatedly, back and forth
    this.instructionsAnim.repetitionMode = "full";
    this.instructionsAnim.play();
  }

  unload() {
    // Dispose the following assets to prevent memory leaks
    return "logoTexture";
  }

  draw(context) {
    this.logoSprite.draw(context);
    this.instructionsAnim.draw(context);
  }

  update(span) {
    // On key press, proceed to play screen
    if (this.keyPressed) {
      this.game.changeScreen(Game.Screens.Play);
    }
    // Else, just update animation
    else {
      this.instructionsAnim.update(span);
    }
  }

  // Register key press
  onKeyDown(e) {
    this.keyPressed = true;
  }
};