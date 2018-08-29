[{]: <region> (header)
# Step 2: Creating a game engine basis
[}]: #
[{]: <region> (body)
Like any other JavaScript-based application, we should have an entry view written in HTML. However, in our application, the only visible element is going to be an [HTMLCanvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API). The canvas is exactly what it sounds like - a blank white surface which we can draw things on top of it. As we go further with this tutorial, we will learn more about the canvas and dive into its API and how to use it. Now that you got the general idea, let's create the HTML file:

[{]: <helper> (diff_step 2.1)
#### Step 2.1: Create basic game view

##### Added views/game.html
```diff
@@ -0,0 +1,10 @@
+┊  ┊ 1┊<!DOCTYPE html>
+┊  ┊ 2┊<html>
+┊  ┊ 3┊  <head>
+┊  ┊ 4┊    <title>radial snake</title>
+┊  ┊ 5┊  </head>
+┊  ┊ 6┊
+┊  ┊ 7┊  <body>
+┊  ┊ 8┊    <canvas id="gameCanvas" tabindex="0"></canvas>
+┊  ┊ 9┊  </body>
+┊  ┊10┊</html>🚫↵
```
[}]: #

In the previous step we've already set the route for this file, so if you'd like to run the game, simply start the server by typing `npm run serve`, and navigate to the address presented on the screen (Should be `localhost:8000` by default).

> From now on I'm going to assume the server is running in the background, so I won't repeat the instruction above

Just to make sure that the canvas is visible and not blended into the background, we will draw a black border around using a simple style-sheet:

[{]: <helper> (diff_step 2.2)
#### Step 2.2: Create basic game stylesheet

##### Added resources/styles/game.css
```diff
@@ -0,0 +1,6 @@
+┊ ┊1┊#gameCanvas {
+┊ ┊2┊  display: block;
+┊ ┊3┊  margin: auto;
+┊ ┊4┊  border-style: solid;
+┊ ┊5┊  border-width: 1px;
+┊ ┊6┊}🚫↵
```

##### Changed views/game.html
```diff
@@ -2,6 +2,9 @@
 ┊ 2┊ 2┊<html>
 ┊ 3┊ 3┊  <head>
 ┊ 4┊ 4┊    <title>radial snake</title>
+┊  ┊ 5┊
+┊  ┊ 6┊    <!-- Styles -->
+┊  ┊ 7┊    <link rel="stylesheet" type="text/css" href="/styles/game.css">
 ┊ 5┊ 8┊  </head>
 ┊ 6┊ 9┊
 ┊ 7┊10┊  <body>
```
[}]: #

> Note that every asset we create should be declared in the HTML file in order for it to take effect

To build this project we're also gonna use two very famous utility libraries called [JQuery](http://jquery.com/) and [Underscore](http://underscorejs.org/) which will make our lives a bit easier. Third-party libraries should be located in a directory called `libs`, according to the routes-map we created in the previous step. To set these libraries up, type the following commands in series:

    resources$ mkdir libs
    resources$ cd libs
    resources/libs$ wget raw.githubusercontent.com/dab0mb/radial-snake/master/resources/libs/underscore.js
    resources/libs$ wget raw.githubusercontent.com/dab0mb/radial-snake/master/resources/libs/jquery-2.1.1.js

And load them in the game's HTML file's header:

[{]: <helper> (diff_step 2.3 views/game.html)
#### Step 2.3: Add jquery and underscore libs

##### Changed views/game.html
```diff
@@ -3,6 +3,10 @@
 ┊ 3┊ 3┊  <head>
 ┊ 4┊ 4┊    <title>radial snake</title>
 ┊ 5┊ 5┊
+┊  ┊ 6┊    <!-- Libs -->
+┊  ┊ 7┊    <script type="text/javascript" src="/libs/jquery-2.1.1.js"></script>
+┊  ┊ 8┊    <script type="text/javascript" src="/libs/underscore.js"></script>
+┊  ┊ 9┊
 ┊ 6┊10┊    <!-- Styles -->
 ┊ 7┊11┊    <link rel="stylesheet" type="text/css" href="/styles/game.css">
 ┊ 8┊12┊  </head>
```
[}]: #

Now, we're finally going to build the game engine. At first, it's gonna be very basic simple, but further in this tutorial we're going to extend it and add some pretty neat features. When creating an application, of any kind, you don't want to garbage the global scope, so it can stay clean without any conflicts. Therefore, we're going to create an initial namespace for our game engine called `Engine`, which is going to contain all our game engine's classes and entities:

[{]: <helper> (diff_step 2.4)
#### Step 2.4: Add engine namespace

##### Added resources/scripts/namespaces.js
```diff
@@ -0,0 +1 @@
+┊ ┊1┊Engine = {};🚫↵
```

##### Changed views/game.html
```diff
@@ -7,6 +7,9 @@
 ┊ 7┊ 7┊    <script type="text/javascript" src="/libs/jquery-2.1.1.js"></script>
 ┊ 8┊ 8┊    <script type="text/javascript" src="/libs/underscore.js"></script>
 ┊ 9┊ 9┊
+┊  ┊10┊    <!-- Scripts -->
+┊  ┊11┊    <script type="text/javascript" src="/scripts/namespaces.js"></script>
+┊  ┊12┊
 ┊10┊13┊    <!-- Styles -->
 ┊11┊14┊    <link rel="stylesheet" type="text/css" href="/styles/game.css">
 ┊12┊15┊  </head>
```
[}]: #

The first thing we're going to define in the namespace we've just created would be the game loop. The game loop is the central code of your game, split into different parts. Generally, these are: update and draw.

The main purpose of the update phase is to prepare all objects to be drawn, so this is where all the geometry code, coordinate updates, score changes, animation refreshments and other similar operations belong. This is also where the input will be captured and processed.

When everything is properly updated and ready, we enter the draw phase where all this information is put on the screen. This function should contain all the code to manage and draw the levels, shapes, score board and so on.

![game-loop](https://cloud.githubusercontent.com/assets/7648874/21332964/4b80ef4e-c633-11e6-946a-0c5870d2f9c9.png)

> You can find plenty of details and information about what "game loop" means simply by typing in on Google.

A game loop can wear many forms, but the concept is gonna be the same, plus-minus. This is how our game loop is going to loop like:

[{]: <helper> (diff_step 2.5)
#### Step 2.5: Create a game basis

##### Added resources/scripts/engine/game.js
```diff
@@ -0,0 +1,99 @@
+┊  ┊ 1┊Engine.Game = class Game {
+┊  ┊ 2┊  // The frequency of which each frame will be drawn in milliseconds
+┊  ┊ 3┊  get fps() {
+┊  ┊ 4┊    return 1000 / 60;
+┊  ┊ 5┊  }
+┊  ┊ 6┊
+┊  ┊ 7┊  // Game's run speed.
+┊  ┊ 8┊  // A lower value will make it run slower and a higher value will make it run faster
+┊  ┊ 9┊  get speed() {
+┊  ┊10┊    return 1;
+┊  ┊11┊  }
+┊  ┊12┊
+┊  ┊13┊  constructor(canvas) {
+┊  ┊14┊    this.canvas = canvas;
+┊  ┊15┊    this.lastUpdate = this.creation = new Date().getTime();
+┊  ┊16┊
+┊  ┊17┊    // Canvas dimensions must be set programmatically otherwise you might encounter some
+┊  ┊18┊    // unexpected behaviors
+┊  ┊19┊    canvas.width = 1280;
+┊  ┊20┊    canvas.height = 720;
+┊  ┊21┊    // Canvas will be focused once game page is loaded so all events will automatically
+┊  ┊22┊    // be captured by it
+┊  ┊23┊    canvas.focus();
+┊  ┊24┊
+┊  ┊25┊    // We want to focus on the canvas once we press on it
+┊  ┊26┊    canvas.addEventListener("mousedown", canvas.focus.bind(canvas), false);
+┊  ┊27┊
+┊  ┊28┊    this.assets = {};
+┊  ┊29┊    this.events = new Map();
+┊  ┊30┊    this.context = canvas.getContext("2d");
+┊  ┊31┊    this.bufferedCanvas = document.createElement("canvas");
+┊  ┊32┊    this.bufferedContext = this.bufferedCanvas.getContext("2d");
+┊  ┊33┊    this.bufferedCanvas.width = canvas.width;
+┊  ┊34┊    this.bufferedCanvas.height = canvas.height;
+┊  ┊35┊  }
+┊  ┊36┊
+┊  ┊37┊  draw() {
+┊  ┊38┊    // Draw a black screen by default
+┊  ┊39┊    this.context.restore();
+┊  ┊40┊    this.context.fillStyle = "black";
+┊  ┊41┊    this.context.save();
+┊  ┊42┊    this.context.beginPath();
+┊  ┊43┊    this.context.rect(0, 0, this.canvas.width, this.canvas.height);
+┊  ┊44┊    this.context.fill();
+┊  ┊45┊  }
+┊  ┊46┊
+┊  ┊47┊  update() {
+┊  ┊48┊    // Calculate the time elapsed
+┊  ┊49┊    let lastUpdate = this.lastUpdate;
+┊  ┊50┊    let currUpdate = this.lastUpdate = new Date().getTime();
+┊  ┊51┊    let span = currUpdate - lastUpdate;
+┊  ┊52┊    this.updateScreen(span / this.speed);
+┊  ┊53┊  }
+┊  ┊54┊
+┊  ┊55┊  // The main loop of the game
+┊  ┊56┊  loop() {
+┊  ┊57┊    // If paused, don't run loop. The canvas will remain as is
+┊  ┊58┊    if (!this.playing) return;
+┊  ┊59┊
+┊  ┊60┊    setTimeout(() => {
+┊  ┊61┊      this.draw();
+┊  ┊62┊      this.update();
+┊  ┊63┊      this.loop();
+┊  ┊64┊    }, this.fps);
+┊  ┊65┊  }
+┊  ┊66┊
+┊  ┊67┊  play() {
+┊  ┊68┊    this.playing = true;
+┊  ┊69┊    this.loop();
+┊  ┊70┊  }
+┊  ┊71┊
+┊  ┊72┊  pause() {
+┊  ┊73┊    this.playing = false;
+┊  ┊74┊  }
+┊  ┊75┊
+┊  ┊76┊  // Defines global assets
+┊  ┊77┊  extendAssets(assets) {
+┊  ┊78┊    _.extend(this.assets, assets);
+┊  ┊79┊  }
+┊  ┊80┊
+┊  ┊81┊  // Disposes global assets
+┊  ┊82┊  clearAssets() {
+┊  ┊83┊    this.assets = {};
+┊  ┊84┊  }
+┊  ┊85┊
+┊  ┊86┊  // Adds event listener for game canvas
+┊  ┊87┊  addEventListener(type, listener, target) {
+┊  ┊88┊    let boundListener = listener.bind(target);
+┊  ┊89┊    this.events.set(listener, boundListener);
+┊  ┊90┊    this.canvas.addEventListener(type, boundListener, false);
+┊  ┊91┊  }
+┊  ┊92┊
+┊  ┊93┊  // Removes event listener from game canvas
+┊  ┊94┊  removeEventListener(type, listener) {
+┊  ┊95┊    let boundListener = this.events.get(listener);
+┊  ┊96┊    this.events.delete(listener);
+┊  ┊97┊    this.canvas.removeEventListener(type, boundListener, false);
+┊  ┊98┊  }
+┊  ┊99┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -9,6 +9,7 @@
 ┊ 9┊ 9┊
 ┊10┊10┊    <!-- Scripts -->
 ┊11┊11┊    <script type="text/javascript" src="/scripts/namespaces.js"></script>
+┊  ┊12┊    <script type="text/javascript" src="/scripts/engine/game.js"></script>
 ┊12┊13┊
 ┊13┊14┊    <!-- Styles -->
 ┊14┊15┊    <link rel="stylesheet" type="text/css" href="/styles/game.css">
```
[}]: #

The only thing it's doing right now is drawing a black background, but we're soon going to learn how to take advantage of this game-loop to draw stuff of our own. I'd like to point out that there is no need to implement a [double-buffer](https://en.wikipedia.org/wiki/Multiple_buffering) (A method similar to React's [virtual DOM](https://www.npmjs.com/package/react-dom)) when it comes to `HTMLCanvas` elements, since `HTML5` already does that for us. To start running the game, we first need to wait for the DOM content to initialize, and once it's ready we gonna create a new game instance and call the `play` method:

[{]: <helper> (diff_step 2.6)
#### Step 2.6: Create game entry point

##### Added resources/scripts/main.js
```diff
@@ -0,0 +1,4 @@
+┊ ┊1┊document.addEventListener("DOMContentLoaded", function(event) {
+┊ ┊2┊  let game = new Engine.Game(document.getElementById("gameCanvas"), false);
+┊ ┊3┊  game.play();
+┊ ┊4┊});🚫↵
```

##### Changed views/game.html
```diff
@@ -10,6 +10,7 @@
 ┊10┊10┊    <!-- Scripts -->
 ┊11┊11┊    <script type="text/javascript" src="/scripts/namespaces.js"></script>
 ┊12┊12┊    <script type="text/javascript" src="/scripts/engine/game.js"></script>
+┊  ┊13┊    <script type="text/javascript" src="/scripts/main.js"></script>
 ┊13┊14┊
 ┊14┊15┊    <!-- Styles -->
 ┊15┊16┊    <link rel="stylesheet" type="text/css" href="/styles/game.css">
```
[}]: #

This will take control over the canvas and will draw a new picture every 17ms, which is 60fps (Frames per second). As for now you're only going to see a black canvas, but I promise the final result is not going to disappoint you.

The next thing we're gonna do would be adding a 'key state' manager, which will store a flag for each key pressed on the keyboard. Once we press the key, the flag's value would be `true`, and once we release it, its value would turn into `false`. This way we have an easy way to track all the key presses without registering a specific event listener for each key press we wanna track:

[{]: <helper> (diff_step 2.7)
#### Step 2.7: Add key states manager

##### Added resources/scripts/engine/key_states.js
```diff
@@ -0,0 +1,20 @@
+┊  ┊ 1┊Engine.KeyStates = class KeyStates {
+┊  ┊ 2┊  constructor() {
+┊  ┊ 3┊    // We will have 255 states, each one represents an ascii code matching its index
+┊  ┊ 4┊    this.states = new Array(255);
+┊  ┊ 5┊  }
+┊  ┊ 6┊
+┊  ┊ 7┊  get(k) {
+┊  ┊ 8┊    return this.states[k];
+┊  ┊ 9┊  }
+┊  ┊10┊
+┊  ┊11┊  // This should be called once we press a key
+┊  ┊12┊  add(k) {
+┊  ┊13┊    this.states[k] = true;
+┊  ┊14┊  }
+┊  ┊15┊
+┊  ┊16┊  // This should be called once we release a key
+┊  ┊17┊  remove(k) {
+┊  ┊18┊    this.states[k] = false;
+┊  ┊19┊  }
+┊  ┊20┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -9,6 +9,7 @@
 ┊ 9┊ 9┊
 ┊10┊10┊    <!-- Scripts -->
 ┊11┊11┊    <script type="text/javascript" src="/scripts/namespaces.js"></script>
+┊  ┊12┊    <script type="text/javascript" src="/scripts/engine/key_states.js"></script>
 ┊12┊13┊    <script type="text/javascript" src="/scripts/engine/game.js"></script>
 ┊13┊14┊    <script type="text/javascript" src="/scripts/main.js"></script>
```
[}]: #

Now that we have the key state manager, we will initialize a new instance as part of our game's essentials, and we will create a global event listener for key presses; Each time a key is pressed, the key state manager will update itself:

[{]: <helper> (diff_step 2.8)
#### Step 2.8: Register key presses

##### Changed resources/scripts/engine/game.js
```diff
@@ -14,7 +14,7 @@
 ┊14┊14┊    this.canvas = canvas;
 ┊15┊15┊    this.lastUpdate = this.creation = new Date().getTime();
 ┊16┊16┊
-┊17┊  ┊    // Canvas dimensions must be set programmatically otherwise you might encounter some
+┊  ┊17┊    // Canvas dimensions must be set programmatically, otherwise you might encounter some
 ┊18┊18┊    // unexpected behaviors
 ┊19┊19┊    canvas.width = 1280;
 ┊20┊20┊    canvas.height = 720;
```
```diff
@@ -24,9 +24,13 @@
 ┊24┊24┊
 ┊25┊25┊    // We want to focus on the canvas once we press on it
 ┊26┊26┊    canvas.addEventListener("mousedown", canvas.focus.bind(canvas), false);
+┊  ┊27┊    // Key flags will be registered by the "KeyStates" instance
+┊  ┊28┊    canvas.addEventListener("keydown", onKeyDown.bind(this), false);
+┊  ┊29┊    canvas.addEventListener("keyup", onKeyUp.bind(this), false);
 ┊27┊30┊
 ┊28┊31┊    this.assets = {};
 ┊29┊32┊    this.events = new Map();
+┊  ┊33┊    this.keyStates = new Engine.KeyStates();
 ┊30┊34┊    this.context = canvas.getContext("2d");
 ┊31┊35┊    this.bufferedCanvas = document.createElement("canvas");
 ┊32┊36┊    this.bufferedContext = this.bufferedCanvas.getContext("2d");
```
```diff
@@ -96,4 +100,19 @@
 ┊ 96┊100┊    this.events.delete(listener);
 ┊ 97┊101┊    this.canvas.removeEventListener(type, boundListener, false);
 ┊ 98┊102┊  }
-┊ 99┊   ┊};🚫↵
+┊   ┊103┊};
+┊   ┊104┊
+┊   ┊105┊function onKeyDown(e) {
+┊   ┊106┊  // Once we're focused on the canvas, we want nothing else to happen
+┊   ┊107┊  // besides events the game is listening to. For example, when we press
+┊   ┊108┊  // the arrow keys, this will prevent the screen from scrolling
+┊   ┊109┊  e.preventDefault();
+┊   ┊110┊  // Register key press
+┊   ┊111┊  this.keyStates.add(e.keyCode);
+┊   ┊112┊}
+┊   ┊113┊
+┊   ┊114┊function onKeyUp(e) {
+┊   ┊115┊  e.preventDefault();
+┊   ┊116┊  // Register key release
+┊   ┊117┊  this.keyStates.remove(e.keyCode);
+┊   ┊118┊}
```
[}]: #

A 2D game's view might get complex as we go through with its development and add more logic and entities into it. Having only one `draw` method and only one `update` method is not enough, and if you think of it, it might easily get buffed up into ridiculous dimensions, which is not the way to go. I'd like to introduce you into a new methodology which involves `screens` and `layers`:

- **screen** - Will literally be used whenever we want to show a new screen in our game e.g. 'splash' screen and 'main menu' screen. A screen consists of multiple layers, and will be used as their communicator; All the relevant assets and logic will be initialized inside it.
- **layer** - similar to Photoshop's layer system, any time we want to add something to the view we add new layers on top or beneath of each other.

![screen-layer](https://cloud.githubusercontent.com/assets/7648874/21487708/9b366efe-cbb7-11e6-8669-3212e440871a.png)

As I said earlier, the purpose of the screens and the layers is just to split the task of updating and drawing and updating, so we can have logical segments; So the `layer` class should mainly consist of a `draw` and an `update` method:

[{]: <helper> (diff_step 2.9)
#### Step 2.9: Add screen layer

##### Added resources/scripts/engine/layer.js
```diff
@@ -0,0 +1,43 @@
+┊  ┊ 1┊Engine.Layer = class Layer {
+┊  ┊ 2┊  // The dimensions of the layer are correlated to dimensions of the canvas
+┊  ┊ 3┊  get width() {
+┊  ┊ 4┊    return this.canvas.width;
+┊  ┊ 5┊  }
+┊  ┊ 6┊
+┊  ┊ 7┊  get height() {
+┊  ┊ 8┊    return this.canvas.height;
+┊  ┊ 9┊  }
+┊  ┊10┊
+┊  ┊11┊  // A hash of "eventName" : "handlerName" which should be overrided by user
+┊  ┊12┊  get events() {
+┊  ┊13┊    return {};
+┊  ┊14┊  }
+┊  ┊15┊
+┊  ┊16┊  constructor(screen) {
+┊  ┊17┊    this.age = 0;
+┊  ┊18┊    this.creation = new Date().getTime();
+┊  ┊19┊    this.screen = screen;
+┊  ┊20┊    this.game = screen.game;
+┊  ┊21┊    this.assets = screen.assets;
+┊  ┊22┊    this.keyStates = screen.keyStates;
+┊  ┊23┊    this.canvas = screen.game.canvas;
+┊  ┊24┊  }
+┊  ┊25┊
+┊  ┊26┊  update(span) {
+┊  ┊27┊  }
+┊  ┊28┊
+┊  ┊29┊  draw(context) {
+┊  ┊30┊  }
+┊  ┊31┊
+┊  ┊32┊  initEventListeners() {
+┊  ┊33┊    _.each(this.events, (listener, event) => {
+┊  ┊34┊      this.game.addEventListener(event, this[listener], this);
+┊  ┊35┊    });
+┊  ┊36┊  }
+┊  ┊37┊
+┊  ┊38┊  disposeEventListeners() {
+┊  ┊39┊    _.each(this.events, (listener, event) => {
+┊  ┊40┊      this.game.removeEventListener(event, this[listener]);
+┊  ┊41┊    });
+┊  ┊42┊  }
+┊  ┊43┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -10,6 +10,7 @@
 ┊10┊10┊    <!-- Scripts -->
 ┊11┊11┊    <script type="text/javascript" src="/scripts/namespaces.js"></script>
 ┊12┊12┊    <script type="text/javascript" src="/scripts/engine/key_states.js"></script>
+┊  ┊13┊    <script type="text/javascript" src="/scripts/engine/layer.js"></script>
 ┊13┊14┊    <script type="text/javascript" src="/scripts/engine/game.js"></script>
 ┊14┊15┊    <script type="text/javascript" src="/scripts/main.js"></script>
```
[}]: #

Same thing for the screen, it only has a `draw` and `update` methods, only it has a stack of layers, which can either be added or removed:

[{]: <helper> (diff_step 2.10)
#### Step 2.10: Add game screen

##### Added resources/scripts/engine/screen.js
```diff
@@ -0,0 +1,85 @@
+┊  ┊ 1┊Engine.Screen = class Screen {
+┊  ┊ 2┊  // The dimensions of the screen are correlated to dimensions of the canvas
+┊  ┊ 3┊  get width() {
+┊  ┊ 4┊    return this.canvas.width;
+┊  ┊ 5┊  }
+┊  ┊ 6┊
+┊  ┊ 7┊  get height() {
+┊  ┊ 8┊    return this.canvas.height;
+┊  ┊ 9┊  }
+┊  ┊10┊
+┊  ┊11┊  // A hash of "eventName" : "handlerName" which should be overrided by user
+┊  ┊12┊  get events() {
+┊  ┊13┊    return {};
+┊  ┊14┊  }
+┊  ┊15┊
+┊  ┊16┊  constructor(game) {
+┊  ┊17┊    this.age = 0;
+┊  ┊18┊    this.creation = new Date().getTime();
+┊  ┊19┊    this.game = game;
+┊  ┊20┊    this.canvas = game.canvas;
+┊  ┊21┊    this.keyStates = game.keyStates;
+┊  ┊22┊    this.assets = _.clone(game.assets);
+┊  ┊23┊    this.layers = [];
+┊  ┊24┊  }
+┊  ┊25┊
+┊  ┊26┊  // A custom initialization function should be implemented by child-class
+┊  ┊27┊  initialize() {
+┊  ┊28┊    return this;
+┊  ┊29┊  }
+┊  ┊30┊
+┊  ┊31┊  // Updates each layer
+┊  ┊32┊  update(span) {
+┊  ┊33┊    this.layers.forEach(layer => {
+┊  ┊34┊      layer.age += span;
+┊  ┊35┊      layer.update(span);
+┊  ┊36┊    });
+┊  ┊37┊  }
+┊  ┊38┊
+┊  ┊39┊  // Draws each layer
+┊  ┊40┊  draw(context) {
+┊  ┊41┊    this.layers.forEach(layer => {
+┊  ┊42┊      layer.draw(context);
+┊  ┊43┊    });
+┊  ┊44┊  }
+┊  ┊45┊
+┊  ┊46┊  // Push a new layer to the top of the layers stack
+┊  ┊47┊  appendLayer(Layer, ...layerArgs) {
+┊  ┊48┊    let layer = new Layer(this, ...layerArgs);
+┊  ┊49┊    this.layers.push(layer);
+┊  ┊50┊    layer.initEventListeners();
+┊  ┊51┊  }
+┊  ┊52┊
+┊  ┊53┊  // Push a new layer to the bottom of the layers stack
+┊  ┊54┊  prependLayer(Layer, ...layerArgs) {
+┊  ┊55┊    let layer = new Layer(this, ...layerArgs);
+┊  ┊56┊    this.layers.unshift(layer);
+┊  ┊57┊    layer.initEventListeners();
+┊  ┊58┊  }
+┊  ┊59┊
+┊  ┊60┊  // Removes the given layer from the layers stack
+┊  ┊61┊  removeLayer(layer) {
+┊  ┊62┊    this.layers = _.without(this.layers, layer);
+┊  ┊63┊    layer.disposeEventListeners();
+┊  ┊64┊  }
+┊  ┊65┊
+┊  ┊66┊  initEventListeners() {
+┊  ┊67┊    _.each(this.events, (listener, event) => {
+┊  ┊68┊      this.game.addEventListener(event, this[listener], this);
+┊  ┊69┊    });
+┊  ┊70┊
+┊  ┊71┊    this.layers.forEach(layer => {
+┊  ┊72┊      layer.initEventListeners();
+┊  ┊73┊    });
+┊  ┊74┊  }
+┊  ┊75┊
+┊  ┊76┊  disposeEventListeners() {
+┊  ┊77┊    _.each(this.events, (listener, event) => {
+┊  ┊78┊      this.game.removeEventListener(event, this[listener], this);
+┊  ┊79┊    });
+┊  ┊80┊
+┊  ┊81┊    this.layers.forEach(layer => {
+┊  ┊82┊      layer.disposeEventListeners();
+┊  ┊83┊    });
+┊  ┊84┊  }
+┊  ┊85┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -11,6 +11,7 @@
 ┊11┊11┊    <script type="text/javascript" src="/scripts/namespaces.js"></script>
 ┊12┊12┊    <script type="text/javascript" src="/scripts/engine/key_states.js"></script>
 ┊13┊13┊    <script type="text/javascript" src="/scripts/engine/layer.js"></script>
+┊  ┊14┊    <script type="text/javascript" src="/scripts/engine/screen.js"></script>
 ┊14┊15┊    <script type="text/javascript" src="/scripts/engine/game.js"></script>
 ┊15┊16┊    <script type="text/javascript" src="/scripts/main.js"></script>
```
[}]: #

Now that we have the `screen` class available for us, let's apply it to the main game loop:

[{]: <helper> (diff_step 2.11)
#### Step 2.11: Draw and update screen in game loop

##### Changed resources/scripts/engine/game.js
```diff
@@ -30,6 +30,7 @@
 ┊30┊30┊
 ┊31┊31┊    this.assets = {};
 ┊32┊32┊    this.events = new Map();
+┊  ┊33┊    this.screen = new Engine.Screen(this);
 ┊33┊34┊    this.keyStates = new Engine.KeyStates();
 ┊34┊35┊    this.context = canvas.getContext("2d");
 ┊35┊36┊    this.bufferedCanvas = document.createElement("canvas");
```
```diff
@@ -46,6 +47,13 @@
 ┊46┊47┊    this.context.beginPath();
 ┊47┊48┊    this.context.rect(0, 0, this.canvas.width, this.canvas.height);
 ┊48┊49┊    this.context.fill();
+┊  ┊50┊    this.drawScreen(this.context);
+┊  ┊51┊  }
+┊  ┊52┊
+┊  ┊53┊  drawScreen(context) {
+┊  ┊54┊    // If screen's assets are not yet loaded, don't draw it
+┊  ┊55┊    if (this.screen.loading) return;
+┊  ┊56┊    if (this.screen.draw) this.screen.draw(context);
 ┊49┊57┊  }
 ┊50┊58┊
 ┊51┊59┊  update() {
```
```diff
@@ -56,6 +64,13 @@
 ┊56┊64┊    this.updateScreen(span / this.speed);
 ┊57┊65┊  }
 ┊58┊66┊
+┊  ┊67┊  updateScreen(span) {
+┊  ┊68┊    this.screen.age += span;
+┊  ┊69┊    // If screen's assets are not yet loaded, don't update it
+┊  ┊70┊    if (this.screen.loading) return;
+┊  ┊71┊    if (this.screen.update) this.screen.update(span);
+┊  ┊72┊  }
+┊  ┊73┊
 ┊59┊74┊  // The main loop of the game
 ┊60┊75┊  loop() {
 ┊61┊76┊    // If paused, don't run loop. The canvas will remain as is
```
[}]: #

This step looks kind of useless for now, unless we will have the ability to change screens as we please. Any time a screen is changed, it should be loaded with its necessary assets e.g textures, sounds, fonts, etc. The assets loading is an asynchronous operation whose logic might get a bit messy if not managed properly. To make it easier, we're going to define an assets loader, which will help us load assets asynchronously:

[{]: <helper> (diff_step 2.12)
#### Step 2.12: Add assets loader

##### Added resources/scripts/engine/assets_loader.js
```diff
@@ -0,0 +1,13 @@
+┊  ┊ 1┊Engine.AssetsLoader = class AssetsLoader {
+┊  ┊ 2┊  constructor(next) {
+┊  ┊ 3┊    this.next = next;
+┊  ┊ 4┊  }
+┊  ┊ 5┊
+┊  ┊ 6┊  // Load texture
+┊  ┊ 7┊  texture(path) {
+┊  ┊ 8┊    let image = new Image();
+┊  ┊ 9┊    image.onload = this.next();
+┊  ┊10┊    image.src = `${path}.png`;
+┊  ┊11┊    return image;
+┊  ┊12┊  }
+┊  ┊13┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -12,6 +12,7 @@
 ┊12┊12┊    <script type="text/javascript" src="/scripts/engine/key_states.js"></script>
 ┊13┊13┊    <script type="text/javascript" src="/scripts/engine/layer.js"></script>
 ┊14┊14┊    <script type="text/javascript" src="/scripts/engine/screen.js"></script>
+┊  ┊15┊    <script type="text/javascript" src="/scripts/engine/assets_loader.js"></script>
 ┊15┊16┊    <script type="text/javascript" src="/scripts/engine/game.js"></script>
 ┊16┊17┊    <script type="text/javascript" src="/scripts/main.js"></script>
```
[}]: #

> As for now the `assets loader` only has the ability to load textures, but we will extend it as we go further in this tutorial, no need to overdo it.

Now that we have the `assets loader` we can add the ability to change a screen. Whenever we change a screen, the old screen's assets should be unloaded, and the new screen's assets should be loaded using the `assets loader`:

[{]: <helper> (diff_step 2.13)
#### Step 2.13: Add the ability to change and load screen

##### Changed resources/scripts/engine/game.js
```diff
@@ -92,6 +92,61 @@
 ┊ 92┊ 92┊    this.playing = false;
 ┊ 93┊ 93┊  }
 ┊ 94┊ 94┊
+┊   ┊ 95┊  changeScreen(Screen, ...screenArgs) {
+┊   ┊ 96┊    // If there is a screen defined, dispose it first
+┊   ┊ 97┊    if (this.screen) {
+┊   ┊ 98┊      this.unloadScreen();
+┊   ┊ 99┊      this.screen.disposeEventListeners();
+┊   ┊100┊    }
+┊   ┊101┊
+┊   ┊102┊    this.screen = new Screen(this, ...screenArgs);
+┊   ┊103┊
+┊   ┊104┊    // Load screen assets
+┊   ┊105┊    this.loadScreen(() => {
+┊   ┊106┊      // Once assets are loaded, initialize event listeners
+┊   ┊107┊      this.screen.initEventListeners();
+┊   ┊108┊      // The "initialize" method is exactly the same as the constructor, only it runs
+┊   ┊109┊      // once assets are available and event listeners are registered
+┊   ┊110┊      this.screen.initialize(this, ...screenArgs);
+┊   ┊111┊    });
+┊   ┊112┊  }
+┊   ┊113┊
+┊   ┊114┊  // Loads screen assets and invokes callback once loading is finished
+┊   ┊115┊  loadScreen(callback = _.noop) {
+┊   ┊116┊    if (!this.screen.load) return callback();
+┊   ┊117┊
+┊   ┊118┊    this.screen.loading = true;
+┊   ┊119┊    // The number of assets to load
+┊   ┊120┊    let loadsize = 0;
+┊   ┊121┊    let onload;
+┊   ┊122┊
+┊   ┊123┊    // This object can load assets
+┊   ┊124┊    let assetsLoader = new Engine.AssetsLoader(() => {
+┊   ┊125┊      loadsize++;
+┊   ┊126┊      return () => onload();
+┊   ┊127┊    });
+┊   ┊128┊
+┊   ┊129┊    // The "load" method returns the assets loaded by the screen
+┊   ┊130┊    let screenAssets = this.screen.load(assetsLoader);
+┊   ┊131┊
+┊   ┊132┊    // We use the "after" method because we want the following callback to be invoked
+┊   ┊133┊    // only once all assets are loaded
+┊   ┊134┊    onload = _.after(loadsize, () => {
+┊   ┊135┊      delete this.screen.loading;
+┊   ┊136┊      callback();
+┊   ┊137┊    });
+┊   ┊138┊
+┊   ┊139┊    // The returned assets will be available on screen's assets object
+┊   ┊140┊    _.extend(this.screen.assets, screenAssets);
+┊   ┊141┊  }
+┊   ┊142┊
+┊   ┊143┊  // Disposes screen assets
+┊   ┊144┊  unloadScreen() {
+┊   ┊145┊    if (!this.screen.unload) return;
+┊   ┊146┊    let assetsNames = this.screen.unload();
+┊   ┊147┊    _.omit(this.assets, assetsNames);
+┊   ┊148┊  }
+┊   ┊149┊
 ┊ 95┊150┊  // Defines global assets
 ┊ 96┊151┊  extendAssets(assets) {
 ┊ 97┊152┊    _.extend(this.assets, assets);
```
[}]: #

Let's add a test screen just so we can get the hang of it. The test screen will only print a message to the canvas:

[{]: <helper> (diff_step 2.14)
#### Step 2.14: Add test screen

##### Added resources/scripts/test_screen.js
```diff
@@ -0,0 +1,10 @@
+┊  ┊ 1┊class TestScreen extends Engine.Screen {
+┊  ┊ 2┊  draw(context) {
+┊  ┊ 3┊    // A 20px sized "Georgia" font (Available natively)
+┊  ┊ 4┊    context.font = "20px Georgia";
+┊  ┊ 5┊    // The text should be colored white
+┊  ┊ 6┊    context.fillStyle = "white";
+┊  ┊ 7┊    // Draw the following message 50px from the left and 50px from the top
+┊  ┊ 8┊    context.fillText("This is a Test Screen", 50, 50);
+┊  ┊ 9┊  }
+┊  ┊10┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -14,6 +14,7 @@
 ┊14┊14┊    <script type="text/javascript" src="/scripts/engine/screen.js"></script>
 ┊15┊15┊    <script type="text/javascript" src="/scripts/engine/assets_loader.js"></script>
 ┊16┊16┊    <script type="text/javascript" src="/scripts/engine/game.js"></script>
+┊  ┊17┊    <script type="text/javascript" src="/scripts/test_screen.js"></script>
 ┊17┊18┊    <script type="text/javascript" src="/scripts/main.js"></script>
 ┊18┊19┊
 ┊19┊20┊    <!-- Styles -->
```
[}]: #

Now we will use the test screen by changing to it as we create an instance of the game:

[{]: <helper> (diff_step 2.15)
#### Step 2.15: Set test screen as the initial screen

##### Changed resources/scripts/main.js
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊document.addEventListener("DOMContentLoaded", function(event) {
 ┊2┊2┊  let game = new Engine.Game(document.getElementById("gameCanvas"), false);
+┊ ┊3┊  game.changeScreen(TestScreen);
 ┊3┊4┊  game.play();
 ┊4┊5┊});🚫↵
```
[}]: #

Once you will load the application you should see a black canvas with a white text saying:

    This is a test screen

It means our screen system works and you may proceed to the next step, where we're gonna create our first screen :-)
[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step1.md) | [Next Step >](step3.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #