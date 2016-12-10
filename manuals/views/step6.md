[{]: <region> (header)
# Step 6: Creating a complex game screen with multiple layers
[}]: #
[{]: <region> (body)
![snake-demo-game-small](https://cloud.githubusercontent.com/assets/7648874/21074124/8b7cd724-bed7-11e6-9f91-2a211630ac78.gif)

In this step we will be using the `Snake` class we've just created in the previous step to form the actual game screen - called the `Play` screen. The play screen is a complex screen made out multiple layers as following:

- **`Ready` layer** - Displays a message at the beginning of each match.
- **`Snake` layer** - Displays the the competitors' snakes.
- **`Score` layer** - Displays the score board.
- **`Win` layer** - Displays the winner at the end of each match.

As we go further with this step, we will give a deeper explanation about each layer and how they interact with each other; As for let's start with the `Play` screen's basis. Regardless of what the `Play` screen should contain at the final result, we want to have the ability to abort the match whenever we press the `Escape` key, therefore, the initial implementation should look like this:

[{]: <helper> (diff_step 6.1)
#### Step 6.1: Create 'Play' screen

##### Added resources/scripts/game/screens/play/index.js
```diff
@@ -0,0 +1,14 @@
+┊  ┊ 1┊Game.Screens.Play = class Play extends Engine.Screen {
+┊  ┊ 2┊  get events() {
+┊  ┊ 3┊    return {
+┊  ┊ 4┊      "keydown": "onKeyDown"
+┊  ┊ 5┊    }
+┊  ┊ 6┊  }
+┊  ┊ 7┊
+┊  ┊ 8┊  onKeyDown() {
+┊  ┊ 9┊    // Once escape is pressed, return to main menu screen
+┊  ┊10┊    if (this.keyStates.get(27)) {
+┊  ┊11┊      this.game.changeScreen(Game.Screens.Menu);
+┊  ┊12┊    }
+┊  ┊13┊  }
+┊  ┊14┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -23,6 +23,7 @@
 ┊23┊23┊    <script type="text/javascript" src="/scripts/engine/assets_loader.js"></script>
 ┊24┊24┊    <script type="text/javascript" src="/scripts/engine/game.js"></script>
 ┊25┊25┊    <script type="text/javascript" src="/scripts/game/entities/snake.js"></script>
+┊  ┊26┊    <script type="text/javascript" src="/scripts/game/screens/play/index.js"></script>
 ┊26┊27┊    <script type="text/javascript" src="/scripts/game/screens/menu/index.js"></script>
 ┊27┊28┊    <script type="text/javascript" src="/scripts/game/screens/splash/index.js"></script>
 ┊28┊29┊    <script type="text/javascript" src="/scripts/main.js"></script>
```
[}]: #

Now that we have the `Play` screen, we need to hook it to the `Menu` screen, so whenever we press a key, we will be proceeded to it:

[{]: <helper> (diff_step 6.2)
#### Step 6.2: Hook 'Play' screen to 'menu' screen

##### Changed resources/scripts/game/screens/menu/index.js
```diff
@@ -1,4 +1,10 @@
 ┊ 1┊ 1┊Game.Screens.Menu = class Menu extends Engine.Screen {
+┊  ┊ 2┊  get events() {
+┊  ┊ 3┊    return {
+┊  ┊ 4┊      "keydown": "onKeyDown"
+┊  ┊ 5┊    }
+┊  ┊ 6┊  }
+┊  ┊ 7┊
 ┊ 2┊ 8┊  initialize() {
 ┊ 3┊ 9┊    // Initialize snake logo sprite
 ┊ 4┊10┊    this.logoSprite = new Engine.Sprite(this.assets.logoTexture);
```
```diff
@@ -40,10 +46,18 @@
 ┊40┊46┊  }
 ┊41┊47┊
 ┊42┊48┊  update(span) {
-┊43┊  ┊    this.instructionsAnim.update(span);
+┊  ┊49┊    // On key press, proceed to play screen
+┊  ┊50┊    if (this.keyPressed) {
+┊  ┊51┊      this.game.changeScreen(Game.Screens.Play);
+┊  ┊52┊    }
+┊  ┊53┊    // Else, just update animation
+┊  ┊54┊    else {
+┊  ┊55┊      this.instructionsAnim.update(span);
+┊  ┊56┊    }
 ┊44┊57┊  }
 ┊45┊58┊
-┊46┊  ┊  update(span) {
-┊47┊  ┊    this.instructionsAnim.update(span);
+┊  ┊59┊  // Register key press
+┊  ┊60┊  onKeyDown(e) {
+┊  ┊61┊    this.keyPressed = true;
 ┊48┊62┊  }
 ┊49┊63┊};🚫↵
```
[}]: #

By now there shouldn't be anything special. Once you're at the main menu, just press a key as instructed, and you shall see a black screen, which is actually the `Play` screen we've just created; And once you'll press the `Escape` key, you should be receded to the main menu.

The next stage would be displaying a `Ready` message on the screen, and whenever a key is pressed, the message should fade away using a key-frame animation, and the match should start in the background:

[{]: <helper> (diff_step 6.3)
#### Step 6.3: Create 'Ready' layer

##### Added resources/scripts/game/screens/play/ready.js
```diff
@@ -0,0 +1,59 @@
+┊  ┊ 1┊Game.Screens.Play.Ready = class Ready extends Engine.Layer {
+┊  ┊ 2┊  get events() {
+┊  ┊ 3┊    return {
+┊  ┊ 4┊      "keydown": "onKeyDown"
+┊  ┊ 5┊    };
+┊  ┊ 6┊  }
+┊  ┊ 7┊
+┊  ┊ 8┊  constructor(screen, snakes) {
+┊  ┊ 9┊    super(screen);
+┊  ┊10┊
+┊  ┊11┊    this.snakes = snakes;
+┊  ┊12┊
+┊  ┊13┊    // Create "ready" sprite and set its properties
+┊  ┊14┊    let readyTexture = this.assets.minecraftiaFont.createTexture("Ready");
+┊  ┊15┊    let readySprite = new Engine.Sprite(readyTexture);
+┊  ┊16┊    readySprite.align = "center";
+┊  ┊17┊    readySprite.setPercentage("width", this.width, 15, "height");
+┊  ┊18┊
+┊  ┊19┊    // Create fade out animation for "ready" sprite
+┊  ┊20┊    this.readyAnim = new Engine.Animations.Keyframe(readySprite, [
+┊  ┊21┊      {
+┊  ┊22┊        x: this.width / 2,
+┊  ┊23┊        y: this.height / 2,
+┊  ┊24┊        opacity: 1,
+┊  ┊25┊        frame: 0
+┊  ┊26┊      },
+┊  ┊27┊      {
+┊  ┊28┊        y: this.height / 3,
+┊  ┊29┊        opacity: 0,
+┊  ┊30┊        frame: 700
+┊  ┊31┊      }
+┊  ┊32┊    ]);
+┊  ┊33┊  }
+┊  ┊34┊
+┊  ┊35┊  draw(context) {
+┊  ┊36┊    this.readyAnim.draw(context);
+┊  ┊37┊  }
+┊  ┊38┊
+┊  ┊39┊  update(span) {
+┊  ┊40┊    if (!this.ready) return;
+┊  ┊41┊
+┊  ┊42┊    if (this.readyAnim.playing) {
+┊  ┊43┊      this.readyAnim.update(span);
+┊  ┊44┊    }
+┊  ┊45┊    // Once animation is finished, dispose layer
+┊  ┊46┊    else {
+┊  ┊47┊      this.screen.removeLayer(this);
+┊  ┊48┊    }
+┊  ┊49┊  }
+┊  ┊50┊
+┊  ┊51┊  onKeyDown() {
+┊  ┊52┊    // One time event
+┊  ┊53┊    this.disposeEventListeners()
+┊  ┊54┊
+┊  ┊55┊    // This will start playing the animation
+┊  ┊56┊    this.ready = true;
+┊  ┊57┊    this.readyAnim.play();
+┊  ┊58┊  }
+┊  ┊59┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -24,6 +24,7 @@
 ┊24┊24┊    <script type="text/javascript" src="/scripts/engine/game.js"></script>
 ┊25┊25┊    <script type="text/javascript" src="/scripts/game/entities/snake.js"></script>
 ┊26┊26┊    <script type="text/javascript" src="/scripts/game/screens/play/index.js"></script>
+┊  ┊27┊    <script type="text/javascript" src="/scripts/game/screens/play/ready.js"></script>
 ┊27┊28┊    <script type="text/javascript" src="/scripts/game/screens/menu/index.js"></script>
 ┊28┊29┊    <script type="text/javascript" src="/scripts/game/screens/splash/index.js"></script>
 ┊29┊30┊    <script type="text/javascript" src="/scripts/main.js"></script>
```
[}]: #

In order to hook the `Ready` layer to the `Play` screen, we will just push a new instance of it to the layers stack, using the screen's `appendLayer` method. Note that the order of the layer is super critic! Since if we push a new layer it means it will be drawn on top of any previous layer. To "shift" a layer to the layers stack, we can simply use the `prependLayer` method instead. Without further due, this is how our hook should look like:

[{]: <helper> (diff_step 6.4)
#### Step 6.4: Hook 'Ready' layer to 'Play' screen

##### Changed resources/scripts/game/screens/play/index.js
```diff
@@ -5,6 +5,11 @@
 ┊ 5┊ 5┊    }
 ┊ 6┊ 6┊  }
 ┊ 7┊ 7┊
+┊  ┊ 8┊  // The ready screen will be the initial screen
+┊  ┊ 9┊  initialize(game, snakes) {
+┊  ┊10┊    this.appendLayer(Game.Screens.Play.Ready, snakes);
+┊  ┊11┊  }
+┊  ┊12┊
 ┊ 8┊13┊  onKeyDown() {
 ┊ 9┊14┊    // Once escape is pressed, return to main menu screen
 ┊10┊15┊    if (this.keyStates.get(27)) {
```
[}]: #

Now if you'll launch the game and start a new match, you should see a white `Ready` message in the middle of the screen. Up next, would be the `Snake` layer, which will simply initialize 2 new `Snake` instances, and take care of drawing and updating them:

[{]: <helper> (diff_step 6.5)
#### Step 6.5: Create 'snake' layer

##### Added resources/scripts/game/screens/play/snake.js
```diff
@@ -0,0 +1,79 @@
+┊  ┊ 1┊Game.Screens.Play.Snake = class Snake extends Engine.Layer {
+┊  ┊ 2┊  constructor(screen, snakes = []) {
+┊  ┊ 3┊    super(screen);
+┊  ┊ 4┊
+┊  ┊ 5┊    // Red snake
+┊  ┊ 6┊    this.snakes = [
+┊  ┊ 7┊      new Game.Entities.Snake(
+┊  ┊ 8┊        this.width / 4,
+┊  ┊ 9┊        this.height / 4,
+┊  ┊10┊        50,
+┊  ┊11┊        Math.PI / 4,
+┊  ┊12┊        100,
+┊  ┊13┊        "FireBrick",
+┊  ┊14┊        this.keyStates,
+┊  ┊15┊        {
+┊  ┊16┊          // Use score from previous matches
+┊  ┊17┊          score: snakes[0] && snakes[0].score,
+┊  ┊18┊          keys: {
+┊  ┊19┊            left: 37, // Left key
+┊  ┊20┊            right: 39 // RIght key
+┊  ┊21┊        }
+┊  ┊22┊      }),
+┊  ┊23┊
+┊  ┊24┊      // Blue snake
+┊  ┊25┊      new Game.Entities.Snake(
+┊  ┊26┊        (this.width / 4) * 3,
+┊  ┊27┊        (this.height / 4) * 3,
+┊  ┊28┊        50,
+┊  ┊29┊        (-Math.PI / 4) * 3,
+┊  ┊30┊        100,
+┊  ┊31┊        "DodgerBlue",
+┊  ┊32┊        this.keyStates,
+┊  ┊33┊        {
+┊  ┊34┊          score: snakes[1] && snakes[1].score,
+┊  ┊35┊          keys: {
+┊  ┊36┊            left: 65, // 'a' key
+┊  ┊37┊            right: 68 // 'b' key
+┊  ┊38┊        }
+┊  ┊39┊      })
+┊  ┊40┊    ];
+┊  ┊41┊  }
+┊  ┊42┊
+┊  ┊43┊  draw(context) {
+┊  ┊44┊    // Draw each snake in the snakes array
+┊  ┊45┊    this.snakes.forEach(snake => snake.draw(context));
+┊  ┊46┊  }
+┊  ┊47┊
+┊  ┊48┊  update(span) {
+┊  ┊49┊    if (!this.snakes.length) return;
+┊  ┊50┊
+┊  ┊51┊    // Storing original snakes array for future use, since it might get changed
+┊  ┊52┊    let snakes = this.snakes.slice();
+┊  ┊53┊
+┊  ┊54┊    snakes.forEach((snake, index) => {
+┊  ┊55┊      snake.update(span, this.width, this.height);
+┊  ┊56┊      // Disqualify if intersected with self
+┊  ┊57┊      if (snake.getSelfIntersection()) return this.snakes.splice(index, 1);
+┊  ┊58┊
+┊  ┊59┊      snakes.forEach((opponent) => {
+┊  ┊60┊        // Don't scan for intersection with self, obviously this will always be true
+┊  ┊61┊        if (opponent === snake) return;
+┊  ┊62┊        // Disqualify if intersected with opponent
+┊  ┊63┊        if (snake.getSnakeIntersection(opponent)) return this.snakes.splice(index, 1);
+┊  ┊64┊      });
+┊  ┊65┊    });
+┊  ┊66┊
+┊  ┊67┊    // There can be only one winner, or a tie (very rare, most likely not to happen)
+┊  ┊68┊    // If the match is already finished, skip the next steps since they are not relevant
+┊  ┊69┊    if (this.snakes.length > 1 || this.matchFinished) return;
+┊  ┊70┊
+┊  ┊71┊    // The winner is the "last snake standing"
+┊  ┊72┊    let winner = this.snakes[0];
+┊  ┊73┊    // If this is not a tie, which is a very rare case, increase the winner's score
+┊  ┊74┊    if (winner) winner.score++;
+┊  ┊75┊
+┊  ┊76┊    // Indicates whether we should update the score counter or not
+┊  ┊77┊    this.matchFinished = true;
+┊  ┊78┊  }
+┊  ┊79┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -24,6 +24,7 @@
 ┊24┊24┊    <script type="text/javascript" src="/scripts/engine/game.js"></script>
 ┊25┊25┊    <script type="text/javascript" src="/scripts/game/entities/snake.js"></script>
 ┊26┊26┊    <script type="text/javascript" src="/scripts/game/screens/play/index.js"></script>
+┊  ┊27┊    <script type="text/javascript" src="/scripts/game/screens/play/snake.js"></script>
 ┊27┊28┊    <script type="text/javascript" src="/scripts/game/screens/play/ready.js"></script>
 ┊28┊29┊    <script type="text/javascript" src="/scripts/game/screens/menu/index.js"></script>
 ┊29┊30┊    <script type="text/javascript" src="/scripts/game/screens/splash/index.js"></script>
```
[}]: #

Once pressing a key in the `Ready` layer, not only we want to display an animation, but we also want the match to start in the background, thus, we gonna push a new instance of the `Snake` layer we've just created like so:

[{]: <helper> (diff_step 6.6)
#### Step 6.6: Hook 'snake' layer to 'ready' layer

##### Changed resources/scripts/game/screens/play/ready.js
```diff
@@ -55,5 +55,8 @@
 ┊55┊55┊    // This will start playing the animation
 ┊56┊56┊    this.ready = true;
 ┊57┊57┊    this.readyAnim.play();
+┊  ┊58┊
+┊  ┊59┊    // Start the game in the background
+┊  ┊60┊    this.screen.prependLayer(Game.Screens.Play.Snake, this.snakes);
 ┊58┊61┊  }
 ┊59┊62┊};🚫↵
```
[}]: #

Note that the layer is pushed when the animation starts and not once finished; This would give a nice smooth feeling to our game-flow. If you'll test out the game, you would discover that the match is actually playable! The first snake (Red) snake should be controlled by the arrow keys, and the second snake (Blue) should be controlled by the letter keys `a`, `s`, `d` and `w`. So far, the snakes function great, but you can probably tell that whenever a match is finished, it feels a bit dull. There's no indication of winning, and there's no score board to present the score of each competitor, which brings us to the next stage - Implementing the `Score` layer.

The `Score` layer is a simple layer which takes the 2 snakes as a parameter and displays their scores at the top of the screen:

[{]: <helper> (diff_step 6.7)
#### Step 6.7: Create 'Score' layer

##### Added resources/scripts/game/screens/play/score.js
```diff
@@ -0,0 +1,66 @@
+┊  ┊ 1┊Game.Screens.Play.Score = class Score extends Engine.Layer {
+┊  ┊ 2┊  constructor(screen, snakes) {
+┊  ┊ 3┊    super(screen);
+┊  ┊ 4┊
+┊  ┊ 5┊    this.snakes = snakes;
+┊  ┊ 6┊    this.scoreSprites = [];
+┊  ┊ 7┊    this.scores = [];
+┊  ┊ 8┊
+┊  ┊ 9┊    // It's important to match indexes to each snake since the number of snakes
+┊  ┊10┊    // can be reduced along the way as we play
+┊  ┊11┊    snakes.forEach((snake, index) => {
+┊  ┊12┊      snake.index = index;
+┊  ┊13┊    });
+┊  ┊14┊  }
+┊  ┊15┊
+┊  ┊16┊  draw(context) {
+┊  ┊17┊    this.scoreSprites.forEach((scoreSprite) => {
+┊  ┊18┊      scoreSprite.draw(context);
+┊  ┊19┊    });
+┊  ┊20┊  }
+┊  ┊21┊
+┊  ┊22┊  update(span) {
+┊  ┊23┊    this.snakes.forEach(snake => {
+┊  ┊24┊      let index = snake.index;
+┊  ┊25┊      if (this.scores[index] == snake.score) return;
+┊  ┊26┊
+┊  ┊27┊      // The sprite might be changed along the way so it's important to recreate it
+┊  ┊28┊      // over and over again. If no change was made the cache will be used by the engine
+┊  ┊29┊      this.scoreSprites[index] = this.createScoreSprite(snake);
+┊  ┊30┊      this.scores[index] = snake.score;
+┊  ┊31┊    });
+┊  ┊32┊  }
+┊  ┊33┊
+┊  ┊34┊  createScoreSprite(snake) {
+┊  ┊35┊    let minecraftiaFont = this.assets.minecraftiaFont;
+┊  ┊36┊    minecraftiaFont.save();
+┊  ┊37┊    minecraftiaFont.color = snake.color;
+┊  ┊38┊
+┊  ┊39┊    // Create a score sprite for the snake
+┊  ┊40┊    let scoreTexture = minecraftiaFont.createTexture(`${snake.score}`, {
+┊  ┊41┊      noOffsets: true,
+┊  ┊42┊      noSpaces: true
+┊  ┊43┊    });
+┊  ┊44┊
+┊  ┊45┊    let scoreSprite = new Engine.Sprite(scoreTexture);
+┊  ┊46┊
+┊  ┊47┊    // Size of score board is dynamic to screen size
+┊  ┊48┊    scoreSprite.setPercentage("width", this.width, 4, "height");
+┊  ┊49┊
+┊  ┊50┊    // Set alignment modes.
+┊  ┊51┊    // Once we add more snakes we should add more cases here
+┊  ┊52┊    switch (snake.index) {
+┊  ┊53┊      case 0:
+┊  ┊54┊        scoreSprite.align = "top-left";
+┊  ┊55┊        break;
+┊  ┊56┊      case 1:
+┊  ┊57┊        scoreSprite.align = "top-right";
+┊  ┊58┊        scoreSprite.x = this.width;
+┊  ┊59┊        break;
+┊  ┊60┊    }
+┊  ┊61┊
+┊  ┊62┊    // Restore the font to its original color
+┊  ┊63┊    minecraftiaFont.restore();
+┊  ┊64┊    return scoreSprite;
+┊  ┊65┊  }
+┊  ┊66┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -24,6 +24,7 @@
 ┊24┊24┊    <script type="text/javascript" src="/scripts/engine/game.js"></script>
 ┊25┊25┊    <script type="text/javascript" src="/scripts/game/entities/snake.js"></script>
 ┊26┊26┊    <script type="text/javascript" src="/scripts/game/screens/play/index.js"></script>
+┊  ┊27┊    <script type="text/javascript" src="/scripts/game/screens/play/score.js"></script>
 ┊27┊28┊    <script type="text/javascript" src="/scripts/game/screens/play/snake.js"></script>
 ┊28┊29┊    <script type="text/javascript" src="/scripts/game/screens/play/ready.js"></script>
 ┊29┊30┊    <script type="text/javascript" src="/scripts/game/screens/menu/index.js"></script>
```
[}]: #

> Note that the current score board is suitable for two players, but can easily be modified to support as much players as you want if done correctly.

The `Score` board should be appended to the layers stack as soon as the `Snake` layers is initialized, so it would be available to us once the match is started:

[{]: <helper> (diff_step 6.8)
#### Step 6.8: Hook 'Score' layer to 'Snake' layer

##### Changed resources/scripts/game/screens/play/snake.js
```diff
@@ -38,6 +38,9 @@
 ┊38┊38┊        }
 ┊39┊39┊      })
 ┊40┊40┊    ];
+┊  ┊41┊
+┊  ┊42┊    // Show score board for newly created snakes
+┊  ┊43┊    screen.appendLayer(Game.Screens.Play.Score, this.snakes);
 ┊41┊44┊  }
 ┊42┊45┊
 ┊43┊46┊  draw(context) {
```
[}]: #

Now we're one layer further from completing the `Play` screen, the only thing missing is the `Win` layer, which should present the winner once the match is finished:

[{]: <helper> (diff_step 6.9)
#### Step 6.9: Create 'Win' layer

##### Added resources/scripts/game/screens/play/win.js
```diff
@@ -0,0 +1,43 @@
+┊  ┊ 1┊Game.Screens.Play.Win = class Win extends Engine.Layer {
+┊  ┊ 2┊  constructor(screen, snakes, winner) {
+┊  ┊ 3┊    super(screen);
+┊  ┊ 4┊
+┊  ┊ 5┊    this.snakes = snakes;
+┊  ┊ 6┊    this.winner = winner;
+┊  ┊ 7┊    // ttl stands for "time to live", which means, this layer is going to be
+┊  ┊ 8┊    // disposed after 3 seconds
+┊  ┊ 9┊    this.ttl = 3000;
+┊  ┊10┊
+┊  ┊11┊    // If there is a winner
+┊  ┊12┊    if (this.winner) {
+┊  ┊13┊      // Message could be something like "RED SNAKE WINS"
+┊  ┊14┊      var text = `${this.winner.color.toUpperCase()} SNAKE WINS`;
+┊  ┊15┊      var percent = 40;
+┊  ┊16┊    }
+┊  ┊17┊    // If there is a tie
+┊  ┊18┊    else {
+┊  ┊19┊      var text = 'TIE';
+┊  ┊20┊      var percent = 15;
+┊  ┊21┊    }
+┊  ┊22┊
+┊  ┊23┊    // Create winner sprite and set its properties
+┊  ┊24┊    let winnerTexture = this.assets.minecraftiaFont.createTexture(text);
+┊  ┊25┊    this.winnerSprite = new Engine.Sprite(winnerTexture);
+┊  ┊26┊    this.winnerSprite.align = "center";
+┊  ┊27┊    this.winnerSprite.setPercentage("width", this.width, percent, "height");
+┊  ┊28┊    this.winnerSprite.x = this.width / 2;
+┊  ┊29┊    this.winnerSprite.y = this.height / 2;
+┊  ┊30┊  }
+┊  ┊31┊
+┊  ┊32┊  draw(context) {
+┊  ┊33┊    this.winnerSprite.draw(context);
+┊  ┊34┊  }
+┊  ┊35┊
+┊  ┊36┊  update(span) {
+┊  ┊37┊    // If limit not yet reached, abort
+┊  ┊38┊    if (this.age < this.ttl) return;
+┊  ┊39┊
+┊  ┊40┊    // Show "ready" message all over again, only this time use the updated score board
+┊  ┊41┊    this.screen.game.changeScreen(Game.Screens.Play, this.snakes);
+┊  ┊42┊  }
+┊  ┊43┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -24,6 +24,7 @@
 ┊24┊24┊    <script type="text/javascript" src="/scripts/engine/game.js"></script>
 ┊25┊25┊    <script type="text/javascript" src="/scripts/game/entities/snake.js"></script>
 ┊26┊26┊    <script type="text/javascript" src="/scripts/game/screens/play/index.js"></script>
+┊  ┊27┊    <script type="text/javascript" src="/scripts/game/screens/play/win.js"></script>
 ┊27┊28┊    <script type="text/javascript" src="/scripts/game/screens/play/score.js"></script>
 ┊28┊29┊    <script type="text/javascript" src="/scripts/game/screens/play/snake.js"></script>
 ┊29┊30┊    <script type="text/javascript" src="/scripts/game/screens/play/ready.js"></script>
```
[}]: #

Note how we use the `changeScreen` method once the `Win` layer has reached its age limit (Time to live, aka `ttl`); This would clear the layers stack and restart the `Play` screen, so we can start a new match all-over, only this time we will pass the `Snake` instances to reserve the original scores. The `Win` layer should be presented whenever a collision has been detected between the snakes:

[{]: <helper> (diff_step 6.10)
#### Step 6.10: Hook 'Win' layer to 'Snake' layer

##### Changed resources/scripts/game/screens/play/snake.js
```diff
@@ -76,7 +76,13 @@
 ┊76┊76┊    // If this is not a tie, which is a very rare case, increase the winner's score
 ┊77┊77┊    if (winner) winner.score++;
 ┊78┊78┊
-┊79┊  ┊    // Indicates whether we should update the score counter or not
+┊  ┊79┊    // Show a message saying the result (e.g., "red snake wins")
+┊  ┊80┊    this.screen.appendLayer(Game.Screens.Play.Win, snakes, winner);
+┊  ┊81┊
+┊  ┊82┊    // Indicates whether we should update the score counter or not.
+┊  ┊83┊    // In addition, will prevent from the 'winner' message from appearing multiple times,
+┊  ┊84┊    // otherwise memory is gonna be wasted despite the fact that we're not going to see
+┊  ┊85┊    // any visual difference
 ┊80┊86┊    this.matchFinished = true;
 ┊81┊87┊  }
 ┊82┊88┊};🚫↵
```
[}]: #

That's it folks, the `Play` screen is finished, and you can play as much matches as you'd feel like.

Although the game is finished, it can still be optimized using `C++`. To discover more on hooking efficiency and how we can hook `C++` to the browser, see the next step.
[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step5.md) | [Next Step >](step7.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #