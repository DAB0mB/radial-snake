Game.Screens.Play.Ready = class Ready extends Engine.Layer {
  get events() {
    return {
      "keydown": "onKeyDown"
    };
  }

  constructor(screen, snakes) {
    super(screen);

    this.snakes = snakes;

    // Create "ready" sprite and set its properties
    let readyTexture = this.assets.minecraftiaFont.createTexture("Ready");
    let readySprite = new Engine.Sprite(readyTexture);
    readySprite.align = "center";
    readySprite.setPercentage("width", this.width, 15, "height");

    // Create fade out animation for "ready" sprite
    this.readyAnim = new Engine.Animations.Keyframe(readySprite, [
      {
        x: this.width / 2,
        y: this.height / 2,
        opacity: 1,
        frame: 0
      },
      {
        y: this.height / 3,
        opacity: 0,
        frame: 700
      }
    ]);
  }

  draw(context) {
    this.readyAnim.draw(context);
  }

  update(span) {
    if (!this.ready) return;

    if (this.readyAnim.playing) {
      this.readyAnim.update(span);
    }
    // Once animation is finished, dispose layer
    else {
      this.screen.removeLayer(this);
    }
  }

  onKeyDown() {
    // One time event
    this.disposeEventListeners()

    // This will start playing the animation
    this.ready = true;
    this.readyAnim.play();
  }
};