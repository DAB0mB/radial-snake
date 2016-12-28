Game.Screens.Splash = class Splash extends Engine.Screen {
  initialize() {
    // Create splash sprite and set its properties
    this.splashSprite = new Engine.Sprite(this.assets.splashTexture);
    this.splashSprite.align = "center";
    this.splashSprite.x = this.width / 2;
  }

  load(assetsLoader) {
    // These are local assets which will be disposed along with the screen
    return {
      splashTexture: assetsLoader.texture("/textures/splash")
    };
  }

  draw(context) {
    this.splashSprite.draw(context);
  }
};