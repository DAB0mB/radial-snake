[{]: <region> (header)
# Step 3: Creating a splash screen using a keyframe animation engine
[}]: #
[{]: <region> (body)
![snake-demo-splash-small](https://cloud.githubusercontent.com/assets/7648874/21074086/a19fa9ce-bed6-11e6-9060-2ce94c215712.gif)

In this step we will be creating the `splash` screen - the initial screen that should be shown once we launch the game. Our splash is consisted of a random logo animation as presented in the `gif` file above. The "splash" effect can be achieved using 2 concepts:

- A sprite class - Which will present the logo texture in different dimensions, angles and rotations.
- A key-frame animation - Which will draw an animation automatically along the time axis using key-frames - each is a sprite representation of the texture in a specific time point.

So first thing first, we will start by implementing the sprite class:

[{]: <helper> (diff_step 3.1)
#### Step 3.1: Create 'Sprite' class

##### Added resources/scripts/engine/sprite.js
```diff
@@ -0,0 +1,58 @@
+┊  ┊ 1┊Engine.Sprite = class Sprite {
+┊  ┊ 2┊  // An easy representation of a sprite on a canvas, with a set of convenient tools
+┊  ┊ 3┊  // for alignment and coloring
+┊  ┊ 4┊  constructor(texture) {
+┊  ┊ 5┊    this.texture = texture;
+┊  ┊ 6┊    this.x = 0;
+┊  ┊ 7┊    this.y = 0;
+┊  ┊ 8┊    this.width = texture.width;
+┊  ┊ 9┊    this.height = texture.height;
+┊  ┊10┊    this.pivot = { x: 0, y: 0 };
+┊  ┊11┊    this.opacity = 1;
+┊  ┊12┊  }
+┊  ┊13┊
+┊  ┊14┊  draw(context, offsetX = 0, offsetY = 0) {
+┊  ┊15┊    context.save();
+┊  ┊16┊    context.globalAlpha = this.opacity;
+┊  ┊17┊
+┊  ┊18┊    // The following switch-case can also be seen as a list of all possible
+┊  ┊19┊    // alignment modes
+┊  ┊20┊    switch (this.align) {
+┊  ┊21┊      case "top-left": case "left-top": this.pivot = { x: 0, y: 0 }; break;
+┊  ┊22┊      case "top-right": case "right-top": this.pivot = { x: this.width, y: 0 }; break;
+┊  ┊23┊      case "bottom-left": case "left-bottom": this.pivot = { x: 0, y: this.height }; break;
+┊  ┊24┊      case "bottom-right": case "right-bottom": this.pivot = { x: this.width, y: this.height }; break;
+┊  ┊25┊      case "middle": case "center": this.pivot = { x: this.width / 2, y: this.height / 2 }; break;
+┊  ┊26┊      case "left": this.pivot = { x: 0, y: this.height / 2 }; break;
+┊  ┊27┊      case "top": this.pivot = { x: this.width / 2, y: 0 }; break;
+┊  ┊28┊      case "right": this.pivot = { x: this.width, y: this.height / 2 }; break;
+┊  ┊29┊      case "bottom": this.pivot = { x: this.width / 2, y: this.height }; break;
+┊  ┊30┊    }
+┊  ┊31┊
+┊  ┊32┊    context.drawImage(
+┊  ┊33┊      this.texture,
+┊  ┊34┊      (this.x - this.pivot.x) + offsetX,
+┊  ┊35┊      (this.y - this.pivot.y) + offsetY,
+┊  ┊36┊      this.width,
+┊  ┊37┊      this.height
+┊  ┊38┊    );
+┊  ┊39┊
+┊  ┊40┊    context.restore();
+┊  ┊41┊  }
+┊  ┊42┊
+┊  ┊43┊  // A sprite property (key) can also be resized based on a given percentage.
+┊  ┊44┊  // The 'relative' argument represents the whole of which the percents are gonna be
+┊  ┊45┊  // calculated from, and the 'adapters' argument is an array of property names which
+┊  ┊46┊  // gonna adapt themselves based on the changes made in the given key.
+┊  ┊47┊  // Usually 'width' goes along with ['height'] adapters, if we
+┊  ┊48┊  // want to keep their original ratio
+┊  ┊49┊  setPercentage(key, relative, percents, ...adapters) {
+┊  ┊50┊    let oldVal = this[key];
+┊  ┊51┊    let newVal = this[key] = (percents * relative) / 100;
+┊  ┊52┊    let ratio = newVal / oldVal;
+┊  ┊53┊
+┊  ┊54┊    adapters.forEach(adapter => {
+┊  ┊55┊      this[adapter] *= ratio;
+┊  ┊56┊    });
+┊  ┊57┊  }
+┊  ┊58┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -9,6 +9,7 @@
 ┊ 9┊ 9┊
 ┊10┊10┊    <!-- Scripts -->
 ┊11┊11┊    <script type="text/javascript" src="/scripts/namespaces.js"></script>
+┊  ┊12┊    <script type="text/javascript" src="/scripts/engine/sprite.js"></script>
 ┊12┊13┊    <script type="text/javascript" src="/scripts/engine/key_states.js"></script>
 ┊13┊14┊    <script type="text/javascript" src="/scripts/engine/layer.js"></script>
 ┊14┊15┊    <script type="text/javascript" src="/scripts/engine/screen.js"></script>
```
[}]: #

And we will download the logo which will be presented in the splash screen using the sprite class:

    resources$ mkdir assets
    resources$ cd assets
    resources/assets$ mkdir textures
    resources/assets$ cd textures
    resources/assets/textures$ wget raw.githubusercontent.com/dab0mb/radial-snake/master/resources/assets/textures/splash.png

> Any logo can that you desired can be used instead! But to ease things up I already provided you with one as a sample

Now we will create the initial splash screen, where we only gonna show a sprite of the logo in the middle of the screen, with no animation applied yet. We will first define a dedicated `Screens` module under the `Game` namespace:

[{]: <helper> (diff_step 3.3)
#### Step 3.3: Create a 'Game' namespace with a 'Screens' module

##### Changed resources/scripts/namespaces.js
```diff
@@ -1 +1,5 @@
+┊ ┊1┊Game = {
+┊ ┊2┊  Screens: {}
+┊ ┊3┊};
+┊ ┊4┊
 ┊1┊5┊Engine = {};🚫↵
```
[}]: #

And we can go ahead and implement the screen itself:

[{]: <helper> (diff_step 3.4)
#### Step 3.4: Create initial splash screen

##### Added resources/scripts/game/screens/splash/index.js
```diff
@@ -0,0 +1,19 @@
+┊  ┊ 1┊Game.Screens.Splash = class Splash extends Engine.Screen {
+┊  ┊ 2┊  initialize() {
+┊  ┊ 3┊    // Create splash sprite and set its properties
+┊  ┊ 4┊    this.splashSprite = new Engine.Sprite(this.assets.splashTexture);
+┊  ┊ 5┊    this.splashSprite.align = "center";
+┊  ┊ 6┊    this.splashSprite.x = this.width / 2;
+┊  ┊ 7┊  }
+┊  ┊ 8┊
+┊  ┊ 9┊  load(assetsLoader) {
+┊  ┊10┊    // These are local assets which will be disposed along with the screen
+┊  ┊11┊    return {
+┊  ┊12┊      splashTexture: assetsLoader.texture("/textures/splash")
+┊  ┊13┊    };
+┊  ┊14┊  }
+┊  ┊15┊
+┊  ┊16┊  draw(context) {
+┊  ┊17┊    this.splashSprite.draw(context);
+┊  ┊18┊  }
+┊  ┊19┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -16,6 +16,7 @@
 ┊16┊16┊    <script type="text/javascript" src="/scripts/engine/assets_loader.js"></script>
 ┊17┊17┊    <script type="text/javascript" src="/scripts/engine/game.js"></script>
 ┊18┊18┊    <script type="text/javascript" src="/scripts/test_screen.js"></script>
+┊  ┊19┊    <script type="text/javascript" src="/scripts/game/screens/splash/index.js"></script>
 ┊19┊20┊    <script type="text/javascript" src="/scripts/main.js"></script>
 ┊20┊21┊
 ┊21┊22┊    <!-- Styles -->
```
[}]: #

Now we can set the splash screen as the initial screen in the entry script file:

[{]: <helper> (diff_step 3.5)
#### Step 3.5: Set splash screen as the initial game screen

##### Changed resources/scripts/main.js
```diff
@@ -1,5 +1,5 @@
 ┊1┊1┊document.addEventListener("DOMContentLoaded", function(event) {
 ┊2┊2┊  let game = new Engine.Game(document.getElementById("gameCanvas"), false);
-┊3┊ ┊  game.changeScreen(TestScreen);
+┊ ┊3┊  game.changeScreen(Game.Screens.Splash);
 ┊4┊4┊  game.play();
 ┊5┊5┊});🚫↵
```
[}]: #

And we will get rid of the unnecessary test screen since we make no use of it any longer:

    $ rm resources/scripts/test_screen.js

We will now proceed into the next stage where we will be implementing the key-frame animation engine as said at the beginning of the step. We first need to define an `Animations` module, since we can have multiple types of animation strategy like [sprite-atlas animation](http://www.joshmorony.com/how-to-create-animations-in-phaser-with-a-texture-atlas/), not necessarily a key-frame animation:

[{]: <helper> (diff_step 3.7)
#### Step 3.7: Add 'Animations' module to 'Engine' namespace

##### Changed resources/scripts/namespaces.js
```diff
@@ -2,4 +2,6 @@
 ┊2┊2┊  Screens: {}
 ┊3┊3┊};
 ┊4┊4┊
-┊5┊ ┊Engine = {};🚫↵
+┊ ┊5┊Engine = {
+┊ ┊6┊  Animations: {}
+┊ ┊7┊};🚫↵
```
[}]: #

Inside the newly created module we will create the key-frame animation engine. The key-frame animation consists of the following methods:

- update - Updates the animation.
- draw - Draws the current animation frame on the provided canvas context.
- play - Enables update operations.
- pause - Disables update operations.

[{]: <helper> (diff_step 3.8)
#### Step 3.8: Create a key-frame animation engine

##### Added resources/scripts/engine/animations/keyframe.js
```diff
@@ -0,0 +1,142 @@
+┊   ┊  1┊Engine.Animations.Keyframe = class Keyframe {
+┊   ┊  2┊  constructor(sprite, keyframes) {
+┊   ┊  3┊    this.sprite = sprite;
+┊   ┊  4┊    // The key-frames array contains objects with the properties of the
+┊   ┊  5┊    // sprite at the current time-point, e.g. width of 100 and height of 200
+┊   ┊  6┊    this.keyframes = keyframes;
+┊   ┊  7┊    this.age = 0;
+┊   ┊  8┊    this.frame = 0;
+┊   ┊  9┊    // This flag determines what's gonna happen to the animation once
+┊   ┊ 10┊    // it's finished playing
+┊   ┊ 11┊    this.repetitionMode = "none";
+┊   ┊ 12┊    this.lastKeyframe = _.last(keyframes);
+┊   ┊ 13┊    this.lastFrame = this.lastKeyframe.frame;
+┊   ┊ 14┊
+┊   ┊ 15┊    // These are the properties which we can animate
+┊   ┊ 16┊    this.animables = [
+┊   ┊ 17┊      "x", "y", "width", "height", "opacity"
+┊   ┊ 18┊    ];
+┊   ┊ 19┊
+┊   ┊ 20┊    // Set a map whose keys represent animatable properties and values represent an array
+┊   ┊ 21┊    // with relevant key-frames to its belonging property
+┊   ┊ 22┊    this.trimmedKeyframes = this.animables.reduce((trimmedKeyframes, key) => {
+┊   ┊ 23┊      trimmedKeyframes[key] = keyframes.filter(keyframe => keyframe[key] != null);
+┊   ┊ 24┊      return trimmedKeyframes;
+┊   ┊ 25┊    }, {});
+┊   ┊ 26┊
+┊   ┊ 27┊    // Set initial properties on sprite based on initial key-frame
+┊   ┊ 28┊    _.each(keyframes[0], (value, key) => {
+┊   ┊ 29┊      if (this.animables.includes(key)) sprite[key] = value;
+┊   ┊ 30┊    });
+┊   ┊ 31┊  }
+┊   ┊ 32┊
+┊   ┊ 33┊  draw(context, offsetX, offsetY) {
+┊   ┊ 34┊    this.sprite.draw(context, offsetX, offsetY);
+┊   ┊ 35┊  }
+┊   ┊ 36┊
+┊   ┊ 37┊  update(span) {
+┊   ┊ 38┊    if (!this.playing) return;
+┊   ┊ 39┊
+┊   ┊ 40┊    this.age += span;
+┊   ┊ 41┊
+┊   ┊ 42┊    switch (this.repetitionMode) {
+┊   ┊ 43┊      // After one cycle animation would stop
+┊   ┊ 44┊      case "none":
+┊   ┊ 45┊        this.frame += span;
+┊   ┊ 46┊
+┊   ┊ 47┊        if (this.frame > this.lastFrame) {
+┊   ┊ 48┊          this.frame = this.lastFrame;
+┊   ┊ 49┊          this.playing = false;
+┊   ┊ 50┊        }
+┊   ┊ 51┊
+┊   ┊ 52┊        break;
+┊   ┊ 53┊
+┊   ┊ 54┊      // Once finished, replay from the beginning
+┊   ┊ 55┊      case "cyclic":
+┊   ┊ 56┊        this.frame = this.age % this.lastFrame;
+┊   ┊ 57┊        break;
+┊   ┊ 58┊
+┊   ┊ 59┊      // Once finished, play backwards, and so on
+┊   ┊ 60┊      case "full":
+┊   ┊ 61┊        this.frame = this.age % this.lastFrame;
+┊   ┊ 62┊        let animationComplete = (this.age / this.lastFrame) % 2 >= 1;
+┊   ┊ 63┊        if (animationComplete) this.frame = this.lastFrame - this.frame;
+┊   ┊ 64┊        break;
+┊   ┊ 65┊    }
+┊   ┊ 66┊
+┊   ┊ 67┊    // Update sprite properties based on given key-frame's easing mode
+┊   ┊ 68┊    this.animables.forEach(key => {
+┊   ┊ 69┊      let motion = this.getKeyframeMotion(key);
+┊   ┊ 70┊
+┊   ┊ 71┊      if (motion)
+┊   ┊ 72┊        this.sprite[key] = this.calculateRelativeValue(motion, key);
+┊   ┊ 73┊    });
+┊   ┊ 74┊  }
+┊   ┊ 75┊
+┊   ┊ 76┊  play() {
+┊   ┊ 77┊    this.playing = true;
+┊   ┊ 78┊  }
+┊   ┊ 79┊
+┊   ┊ 80┊  pause() {
+┊   ┊ 81┊    this.playing = false;
+┊   ┊ 82┊  }
+┊   ┊ 83┊
+┊   ┊ 84┊  // Gets motion for current refresh
+┊   ┊ 85┊  getKeyframeMotion(key) {
+┊   ┊ 86┊    let keyframes = this.trimmedKeyframes[key];
+┊   ┊ 87┊
+┊   ┊ 88┊    // If no key-frames defined, motion is idle
+┊   ┊ 89┊    if (keyframes == null) return;
+┊   ┊ 90┊    // If there is only one key frame, motion is idle
+┊   ┊ 91┊    if (keyframes.length < 2) return;
+┊   ┊ 92┊    // If last frame reached, motion is idle
+┊   ┊ 93┊    if (this.frame > _.last(keyframes).frame) return;
+┊   ┊ 94┊
+┊   ┊ 95┊    let start = this.findStartKeyframe(keyframes);
+┊   ┊ 96┊    let end = this.findEndKeyframe(keyframes);
+┊   ┊ 97┊    let ratio = this.getKeyframesRatio(start, end);
+┊   ┊ 98┊
+┊   ┊ 99┊    return { start, end, ratio };
+┊   ┊100┊  }
+┊   ┊101┊
+┊   ┊102┊  // Gets the movement ratio
+┊   ┊103┊  getKeyframesRatio(start, end) {
+┊   ┊104┊    return (this.frame - start.frame) / (end.frame - start.frame);
+┊   ┊105┊  }
+┊   ┊106┊
+┊   ┊107┊  // Get property end value based on current frame
+┊   ┊108┊  findEndKeyframe(keyframes) {
+┊   ┊109┊    return _.find(keyframes, keyframe =>
+┊   ┊110┊      keyframe.frame >= (this.frame || 1)
+┊   ┊111┊    );
+┊   ┊112┊  }
+┊   ┊113┊
+┊   ┊114┊  // Get property start value based on current frame
+┊   ┊115┊  findStartKeyframe(keyframes) {
+┊   ┊116┊    let resultIndex;
+┊   ┊117┊
+┊   ┊118┊    keyframes.some((keyframe, currIndex) => {
+┊   ┊119┊      if (keyframe.frame >= (this.frame || 1)) {
+┊   ┊120┊        resultIndex = currIndex;
+┊   ┊121┊        return true;
+┊   ┊122┊      }
+┊   ┊123┊    });
+┊   ┊124┊
+┊   ┊125┊    return keyframes[resultIndex - 1];
+┊   ┊126┊  }
+┊   ┊127┊
+┊   ┊128┊  // Get a recalculated property value relative to provided easing mode
+┊   ┊129┊  calculateRelativeValue(motion, key) {
+┊   ┊130┊    let a = motion.start[key];
+┊   ┊131┊    let b = motion.end[key];
+┊   ┊132┊    let r = motion.ratio;
+┊   ┊133┊    let easing = r > 0 ? motion.start.easing : motion.end.easing;
+┊   ┊134┊
+┊   ┊135┊    switch (easing) {
+┊   ┊136┊      case "in": r = Math.sin((r * Math.PI) / 2); break;
+┊   ┊137┊      case "out": r = Math.cos((r * Math.PI) / 2); break;
+┊   ┊138┊    }
+┊   ┊139┊
+┊   ┊140┊    return ((b - a) * r) + a;
+┊   ┊141┊  }
+┊   ┊142┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -10,6 +10,7 @@
 ┊10┊10┊    <!-- Scripts -->
 ┊11┊11┊    <script type="text/javascript" src="/scripts/namespaces.js"></script>
 ┊12┊12┊    <script type="text/javascript" src="/scripts/engine/sprite.js"></script>
+┊  ┊13┊    <script type="text/javascript" src="/scripts/engine/animations/keyframe.js"></script>
 ┊13┊14┊    <script type="text/javascript" src="/scripts/engine/key_states.js"></script>
 ┊14┊15┊    <script type="text/javascript" src="/scripts/engine/layer.js"></script>
 ┊15┊16┊    <script type="text/javascript" src="/scripts/engine/screen.js"></script>
```
[}]: #

When initializing a new instance of the key-frame animation, we should invoke it with the desired sprite, and an array of key-frames. What exactly does a single key-frame represents? The properties of the sprite at that specific time point. In addition, a key-frame can be set with an [easing mode](https://css-tricks.com/ease-out-in-ease-in-out/) of `in` and `out`. By default, the animation would be linear.

Based on the `repitationMode` property, three things can happen to the animation once finished:

- `none` - The animation will play once, and then stop. It will appear as a static sprite.
- `cyclic` - The animation will repeat itself from the beginning, over and over again until stopped manually.
- `full` - The animation will play itself backwards, and then forwards, backwards, forwards, and so on.

Thanks to the key-frame animation engine, we can apply it to the splash screen to show a beautifully animated logo rather than showing a static image. So in addition to the logo sprite, we will initialize a key-frame animation as well:

[{]: <helper> (diff_step 3.9)
#### Step 3.9: Apply key-frame animation to splash screen

##### Changed resources/scripts/game/screens/splash/index.js
```diff
@@ -1,9 +1,34 @@
 ┊ 1┊ 1┊Game.Screens.Splash = class Splash extends Engine.Screen {
 ┊ 2┊ 2┊  initialize() {
 ┊ 3┊ 3┊    // Create splash sprite and set its properties
-┊ 4┊  ┊    this.splashSprite = new Engine.Sprite(this.assets.splashTexture);
-┊ 5┊  ┊    this.splashSprite.align = "center";
-┊ 6┊  ┊    this.splashSprite.x = this.width / 2;
+┊  ┊ 4┊    let splashSprite = new Engine.Sprite(this.assets.splashTexture);
+┊  ┊ 5┊    splashSprite.align = "center";
+┊  ┊ 6┊    splashSprite.x = this.width / 2;
+┊  ┊ 7┊
+┊  ┊ 8┊    // Create splash sprite animation
+┊  ┊ 9┊    this.splashAnim = new Engine.Animations.Keyframe(splashSprite, [
+┊  ┊10┊      {
+┊  ┊11┊        y: (this.height / 2) - 30,
+┊  ┊12┊        width: splashSprite.width / 4,
+┊  ┊13┊        height: splashSprite.height / 4,
+┊  ┊14┊        opacity: 0,
+┊  ┊15┊        easing: "in",
+┊  ┊16┊        frame: 0
+┊  ┊17┊      },
+┊  ┊18┊      {
+┊  ┊19┊        y: this.height / 2,
+┊  ┊20┊        width: (splashSprite.width / 3) + (splashSprite.width * 0.05),
+┊  ┊21┊        height: (splashSprite.height / 3) + (splashSprite.height * 0.05),
+┊  ┊22┊        opacity: 1,
+┊  ┊23┊        frame: 3000
+┊  ┊24┊      },
+┊  ┊25┊      {
+┊  ┊26┊        frame: 3500
+┊  ┊27┊      }
+┊  ┊28┊    ]);
+┊  ┊29┊
+┊  ┊30┊    // Start playing animation
+┊  ┊31┊    this.splashAnim.play();
 ┊ 7┊32┊  }
 ┊ 8┊33┊
 ┊ 9┊34┊  load(assetsLoader) {
```
```diff
@@ -14,6 +39,10 @@
 ┊14┊39┊  }
 ┊15┊40┊
 ┊16┊41┊  draw(context) {
-┊17┊  ┊    this.splashSprite.draw(context);
+┊  ┊42┊    this.splashAnim.draw(context);
+┊  ┊43┊  }
+┊  ┊44┊
+┊  ┊45┊  update(span) {
+┊  ┊46┊    this.splashAnim.update(span);
 ┊18┊47┊  }
 ┊19┊48┊};🚫↵
```
[}]: #

The following key-frames illustrate the nodes of the animation we've just created:

    width: 0
    height: 0
    opacity: 0

![logo-empty](https://cloud.githubusercontent.com/assets/7648874/21583394/ee7a1dec-d065-11e6-80ce-fdd37c4b5dbb.png)

    width: 225
    height: 175
    opacity: 1

![logo-half](https://cloud.githubusercontent.com/assets/7648874/21583396/ee9bdf68-d065-11e6-95fb-4cf5ed58a9de.png)

    width: 342
    height: 266
    opacity: 1

![logo-full](https://cloud.githubusercontent.com/assets/7648874/21583395/ee7b3754-d065-11e6-9646-476d196a6412.png)
[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step2.md) | [Next Step >](step4.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #