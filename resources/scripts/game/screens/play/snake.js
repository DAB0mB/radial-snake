Game.Screens.Play.Snake = class Snake extends Engine.Layer {
  constructor(screen, snakes = []) {
    super(screen);

    // Red snake
    this.snakes = [
      new Game.Entities.Snake(
        this.width / 4,
        this.height / 4,
        50,
        Math.PI / 4,
        100,
        "FireBrick",
        this.keyStates,
        {
          // Use score from previous matches
          score: snakes[0] && snakes[0].score,
          keys: {
            left: 37, // Left key
            right: 39 // RIght key
        }
      }),

      // Blue snake
      new Game.Entities.Snake(
        (this.width / 4) * 3,
        (this.height / 4) * 3,
        50,
        (-Math.PI / 4) * 3,
        100,
        "DodgerBlue",
        this.keyStates,
        {
          score: snakes[1] && snakes[1].score,
          keys: {
            left: 65, // 'a' key
            right: 68 // 'b' key
        }
      })
    ];

    // Show score board for newly created snakes
    screen.appendLayer(Game.Screens.Play.Score, this.snakes);
  }

  draw(context) {
    // Draw each snake in the snakes array
    this.snakes.forEach(snake => snake.draw(context));
  }

  update(span) {
    if (!this.snakes.length) return;

    // Storing original snakes array for future use, since it might get changed
    let snakes = this.snakes.slice();

    snakes.forEach((snake, index) => {
      snake.update(span, this.width, this.height);
      // Disqualify if intersected with self
      if (snake.getSelfIntersection()) return this.snakes.splice(index, 1);

      snakes.forEach((opponent) => {
        // Don't scan for intersection with self, obviously this will always be true
        if (opponent === snake) return;
        // Disqualify if intersected with opponent
        if (snake.getSnakeIntersection(opponent)) return this.snakes.splice(index, 1);
      });
    });

    // There can be only one winner, or a tie (very rare, most likely not to happen)
    // If the match is already finished, skip the next steps since they are not relevant
    if (this.snakes.length > 1 || this.matchFinished) return;

    // The winner is the "last snake standing"
    let winner = this.snakes[0];
    // If this is not a tie, which is a very rare case, increase the winner's score
    if (winner) winner.score++;

    // Indicates whether we should update the score counter or not
    this.matchFinished = true;
  }
};