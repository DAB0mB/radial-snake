Game.Screens.Play.Score = class Score extends Engine.Layer {
  constructor(screen, snakes) {
    super(screen);

    this.snakes = snakes;
    this.scoreSprites = [];
    this.scores = [];

    // It's important to match indexes to each snake since the number of snakes
    // can be reduced along the way as we play
    snakes.forEach((snake, index) => {
      snake.index = index;
    });
  }

  draw(context) {
    this.scoreSprites.forEach((scoreSprite) => {
      scoreSprite.draw(context);
    });
  }

  update(span) {
    this.snakes.forEach(snake => {
      let index = snake.index;
      if (this.scores[index] == snake.score) return;

      // The sprite might be changed along the way so it's important to recreate it
      // over and over again. If no change was made the cache will be used by the engine
      this.scoreSprites[index] = this.createScoreSprite(snake);
      this.scores[index] = snake.score;
    });
  }

  createScoreSprite(snake) {
    let minecraftiaFont = this.assets.minecraftiaFont;
    minecraftiaFont.save();
    minecraftiaFont.color = snake.color;

    // Create a score sprite for the snake
    let scoreTexture = minecraftiaFont.createTexture(`${snake.score}`, {
      noOffsets: true,
      noSpaces: true
    });

    let scoreSprite = new Engine.Sprite(scoreTexture);

    // Size of score board is dynamic to screen size
    scoreSprite.setPercentage("width", this.width, 4, "height");

    // Set alignment modes.
    // Once we add more snakes we should add more cases here
    switch (snake.index) {
      case 0:
        scoreSprite.align = "top-left";
        break;
      case 1:
        scoreSprite.align = "top-right";
        scoreSprite.x = this.width;
        break;
    }

    // Restore the font to its original color
    minecraftiaFont.restore();
    return scoreSprite;
  }
};