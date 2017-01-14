Game.Screens.Play.Win = class Win extends Engine.Layer {
  constructor(screen, snakes, winner) {
    super(screen);

    this.snakes = snakes;
    this.winner = winner;
    // ttl stands for "time to live", which means, this layer is going to be
    // disposed after 3 seconds
    this.ttl = 3000;

    // If there is a winner
    if (this.winner) {
      // Message could be something like "RED SNAKE WINS"
      var text = `${this.winner.color.toUpperCase()} SNAKE WINS`;
      var percent = 40;
    }
    // If there is a tie
    else {
      var text = 'TIE';
      var percent = 15;
    }

    // Create winner sprite and set its properties
    let winnerTexture = this.assets.minecraftiaFont.createTexture(text);
    this.winnerSprite = new Engine.Sprite(winnerTexture);
    this.winnerSprite.align = "center";
    this.winnerSprite.setPercentage("width", this.width, percent, "height");
    this.winnerSprite.x = this.width / 2;
    this.winnerSprite.y = this.height / 2;
  }

  draw(context) {
    this.winnerSprite.draw(context);
  }

  update(span) {
    // If limit not yet reached, abort
    if (this.age < this.ttl) return;

    // Show "ready" message all over again, only this time use the updated score board
    this.screen.game.changeScreen(Game.Screens.Play, this.snakes);
  }
};