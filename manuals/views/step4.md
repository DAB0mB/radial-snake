[{]: <region> (header)
# Step 4: Creating a main menu screen using a font engine
[}]: #
[{]: <region> (body)
![snake-demo-menu-small](https://cloud.githubusercontent.com/assets/7648874/21074099/e72a81bc-bed6-11e6-98cb-329dc12a4b06.gif)

In this step we will be creating the main menu screen as shown above. The main menu screen is a simple screen which will show the logo of the game and an instruction text saying `Press a key to start`. We will be using a simple texture to show the game-logo and we will use the key-frame animation engine to show a flickering animation of the instruction text. The instruction text is the main part of this step, since it is made out of a font file (`.ttf`) and the text is auto-generated, a general solution which can serve us in many situations. We will start by implementing the main menu using static assets, which means that we will use a texture to show the instructions text, and later on we will implement the generic solution I've just mentioned. First, we will download the necessary assets:

    resources/assets/textures$ wget https://raw.githubusercontent.com/DAB0mB/radial-snake/master/resources/assets/textures/instructions.png
    resources/assets/textures$ wget https://raw.githubusercontent.com/DAB0mB/radial-snake/master/resources/assets/textures/logo.png

And then we will implement the initial main menu screen:

[{]: <helper> (diff_step 4.2)
#### Step 4.2: Create initial main menu screen

##### Added resources/scripts/game/screens/menu/index.js
```diff
@@ -0,0 +1,44 @@
+┊  ┊ 1┊Game.Screens.Menu = class Menu extends Engine.Screen {
+┊  ┊ 2┊  initialize() {
+┊  ┊ 3┊    // Initialize snake logo sprite
+┊  ┊ 4┊    this.logoSprite = new Engine.Sprite(this.assets.logoTexture);
+┊  ┊ 5┊    this.logoSprite.setPercentage("width", this.width, 30, "height");
+┊  ┊ 6┊
+┊  ┊ 7┊    // Initialize instructions sprite
+┊  ┊ 8┊    let instructionsSprite = new Engine.Sprite(this.assets.instructionsTexture);
+┊  ┊ 9┊    instructionsSprite.align = "center";
+┊  ┊10┊    instructionsSprite.setPercentage("width", this.width, 35, "height");
+┊  ┊11┊    instructionsSprite.x = this.width / 2;
+┊  ┊12┊    instructionsSprite.y = this.height / 2;
+┊  ┊13┊
+┊  ┊14┊    // Create flickering animation for instructions sprite
+┊  ┊15┊    this.instructionsAnim = new Engine.Animations.Keyframe(instructionsSprite, [
+┊  ┊16┊      {
+┊  ┊17┊        opacity: 1,
+┊  ┊18┊        frame: 0
+┊  ┊19┊      },
+┊  ┊20┊      {
+┊  ┊21┊        opacity: 0,
+┊  ┊22┊        frame: 2000
+┊  ┊23┊      }
+┊  ┊24┊    ]);
+┊  ┊25┊
+┊  ┊26┊    // Play it repeatedly, back and forth
+┊  ┊27┊    this.instructionsAnim.repetitionMode = "full";
+┊  ┊28┊    this.instructionsAnim.play();
+┊  ┊29┊  }
+┊  ┊30┊
+┊  ┊31┊  unload() {
+┊  ┊32┊    // Dispose the following assets to prevent memory leaks
+┊  ┊33┊    return ["logoTexture", "instructionsTexture"];
+┊  ┊34┊  }
+┊  ┊35┊
+┊  ┊36┊  draw(context) {
+┊  ┊37┊    this.logoSprite.draw(context);
+┊  ┊38┊    this.instructionsAnim.draw(context);
+┊  ┊39┊  }
+┊  ┊40┊
+┊  ┊41┊  update(span) {
+┊  ┊42┊    this.instructionsAnim.update(span);
+┊  ┊43┊  }
+┊  ┊44┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -16,6 +16,7 @@
 ┊16┊16┊    <script type="text/javascript" src="/scripts/engine/screen.js"></script>
 ┊17┊17┊    <script type="text/javascript" src="/scripts/engine/assets_loader.js"></script>
 ┊18┊18┊    <script type="text/javascript" src="/scripts/engine/game.js"></script>
+┊  ┊19┊    <script type="text/javascript" src="/scripts/game/screens/menu/index.js"></script>
 ┊19┊20┊    <script type="text/javascript" src="/scripts/game/screens/splash/index.js"></script>
 ┊20┊21┊    <script type="text/javascript" src="/scripts/main.js"></script>
```
[}]: #

This screen is dependent on several assets which we will load during "splash screen time", to save some loading time and for a smooth experience. The main menu screen will be shown automatically once the splash animation has been finished:

[{]: <helper> (diff_step 4.3)
#### Step 4.3: Queue main menu screen

##### Changed resources/scripts/game/screens/splash/index.js
```diff
@@ -32,10 +32,21 @@
 ┊32┊32┊  }
 ┊33┊33┊
 ┊34┊34┊  load(assetsLoader) {
+┊  ┊35┊    // Load assets
+┊  ┊36┊    let instructionsTexture = assetsLoader.texture("/textures/instrucitons");
+┊  ┊37┊    let logoTexture = assetsLoader.texture("/textures/logo");
+┊  ┊38┊    let splashTexture = assetsLoader.texture("/textures/splash");
+┊  ┊39┊
+┊  ┊40┊    // These are global assets which will be shared among all screens until manually
+┊  ┊41┊    // disposed. We use the time gap created by the splash animation to load necessary
+┊  ┊42┊    // assets without wasting any time
+┊  ┊43┊    this.game.extendAssets({
+┊  ┊44┊      instructionsTexture,
+┊  ┊45┊      logoTexture
+┊  ┊46┊    });
+┊  ┊47┊
 ┊35┊48┊    // These are local assets which will be disposed along with the screen
-┊36┊  ┊    return {
-┊37┊  ┊      splashTexture: assetsLoader.texture("/textures/splash")
-┊38┊  ┊    };
+┊  ┊49┊    return { splashTexture };
 ┊39┊50┊  }
 ┊40┊51┊
 ┊41┊52┊  draw(context) {
```
```diff
@@ -43,6 +54,12 @@
 ┊43┊54┊  }
 ┊44┊55┊
 ┊45┊56┊  update(span) {
-┊46┊  ┊    this.splashAnim.update(span);
+┊  ┊57┊    if (this.splashAnim.playing) {
+┊  ┊58┊      this.splashAnim.update(span);
+┊  ┊59┊    }
+┊  ┊60┊    // Once animation has stopped play switch to main menu
+┊  ┊61┊    else {
+┊  ┊62┊      this.game.changeScreen(Game.Screens.Menu);
+┊  ┊63┊    }
 ┊47┊64┊  }
 ┊48┊65┊};🚫↵
```
[}]: #

By now if you launch the application you should see the main menu screen as described in the beginning. But event though it works, we're not yet finished. We still need to convert the instruction texture into an auto-generated font texture. Obviously, this requires us to download the desired `ttf` file:

    resources/assets/fonts$ wget https://raw.githubusercontent.com/DAB0mB/radial-snake/master/resources/assets/fonts/minecraftia.ttf

> Any font file can be used here, but to save time and effort I already provided you with one

`ttf` is the most common format, but since we're using JavaScript, it would make sense to convert it into a `json` file, and that's exactly what we're going to do. There's a very convenient software called [font-builder](https://github.com/andryblack/fontbuilder), and it can cut fonts, store them in `png` files, along with some user-specified meta-data stored in an `xml` file.

![font-builder](https://camo.githubusercontent.com/b2c95cda825c783f5399d9197599848c33cdfcc8/687474703a2f2f7777772e67616d656465762e72752f66696c65732f696d616765732f73637265656e312e6a706567)

Go over to this website: https://github.com/andryblack/fontbuilder.
Fetch a copy of the `font-builder` repo, and try to convert the `minecraftia.ttf` file into a `png` file. If you want to skip this step, although I wouldn't recommend it, you can download the following files which I already generated myself:

    resources/assets/fonts$ wget https://raw.githubusercontent.com/DAB0mB/radial-snake/master/resources/assets/fonts/minecraftia.png
    resources/assets/fonts$ wget https://raw.githubusercontent.com/DAB0mB/radial-snake/master/resources/assets/fonts/minecraftia.xml

As promised, we will be working with a `json` file, not a `ttf` file and not an `xml` file. For this task we will be implementing a font-parser module, which will simply take all the meta-data in the `xml` file and put it into a nice `json` schema:

[{]: <helper> (diff_step 4.6)
#### Step 4.6: Create font parser so we can convert 'xml' font format to 'json'

##### Added helpers/font_parser.js
```diff
@@ -0,0 +1,102 @@
+┊   ┊  1┊const _ = require("underscore");
+┊   ┊  2┊const Async = require("async");
+┊   ┊  3┊const Fs = require("fs");
+┊   ┊  4┊const Path = require("path");
+┊   ┊  5┊const { DOMParser } = require("xmldom");
+┊   ┊  6┊
+┊   ┊  7┊if (module === require.main) {
+┊   ┊  8┊  let fonstDir = Path.resolve(__dirname, "../resources/assets/fonts");
+┊   ┊  9┊  xmlsToJsons(fonstDir, err => { if (err) throw err });
+┊   ┊ 10┊}
+┊   ┊ 11┊
+┊   ┊ 12┊// Gets a dir path containing font xmls and converts them all to jsons
+┊   ┊ 13┊function xmlsToJsons(path, callback = _.noop) {
+┊   ┊ 14┊  Fs.readdir(path, (err, files) => {
+┊   ┊ 15┊    if (err) return callback(err);
+┊   ┊ 16┊
+┊   ┊ 17┊    // Remove all extensions
+┊   ┊ 18┊    fileNames = _.uniq(files.map(file => file.split(".")[0]));
+┊   ┊ 19┊
+┊   ┊ 20┊    // Convert each xml individually
+┊   ┊ 21┊    Async.each(fileNames, (fileName, next) => {
+┊   ┊ 22┊      xmlToJson(`${path}/${fileName}`, next);
+┊   ┊ 23┊    },
+┊   ┊ 24┊    (err) => {
+┊   ┊ 25┊      if (!err) console.log(
+┊   ┊ 26┊        'All fonts have been successfully parsed!'
+┊   ┊ 27┊      );
+┊   ┊ 28┊
+┊   ┊ 29┊      callback(err);
+┊   ┊ 30┊    });
+┊   ┊ 31┊  });
+┊   ┊ 32┊}
+┊   ┊ 33┊
+┊   ┊ 34┊// Gets a font xml and converts it to json
+┊   ┊ 35┊function xmlToJson(path, callback = _.noop) {
+┊   ┊ 36┊  Async.waterfall([
+┊   ┊ 37┊    (next) => {
+┊   ┊ 38┊      Fs.readFile(`${path}.xml`, function(err, xmlBuffer) {
+┊   ┊ 39┊        if (err) return next(err);
+┊   ┊ 40┊
+┊   ┊ 41┊        let json = {
+┊   ┊ 42┊          chars: {}
+┊   ┊ 43┊        };
+┊   ┊ 44┊
+┊   ┊ 45┊        let xml = xmlBuffer.toString();
+┊   ┊ 46┊        let doc = new DOMParser().parseFromString(xml);
+┊   ┊ 47┊        let fontDoc = doc.getElementsByTagName("Font")[0];
+┊   ┊ 48┊        let charsDoc = fontDoc.getElementsByTagName("Char");
+┊   ┊ 49┊
+┊   ┊ 50┊        // Compose meta-data about font like size and family
+┊   ┊ 51┊        _.each(fontDoc.attributes, (attr) => {
+┊   ┊ 52┊          json[attr.name] = parseInt(attr.value) || attr.value;
+┊   ┊ 53┊        });
+┊   ┊ 54┊
+┊   ┊ 55┊        // Compose data about each character in font
+┊   ┊ 56┊        _.each(charsDoc, (charDoc) => {
+┊   ┊ 57┊          let charCode = charDoc.getAttribute("code");
+┊   ┊ 58┊
+┊   ┊ 59┊          let char = json.chars[charCode] = {
+┊   ┊ 60┊            rect: rect = {},
+┊   ┊ 61┊            offset: offset = {},
+┊   ┊ 62┊            width: parseInt(charDoc.getAttribute("width"))
+┊   ┊ 63┊          };
+┊   ┊ 64┊
+┊   ┊ 65┊          [
+┊   ┊ 66┊            rect.x,
+┊   ┊ 67┊            rect.y,
+┊   ┊ 68┊            rect.width,
+┊   ┊ 69┊            rect.height
+┊   ┊ 70┊          ] = extractIntegers(charDoc.getAttribute("rect"));
+┊   ┊ 71┊
+┊   ┊ 72┊          [offset.x, offset.y] = extractIntegers(charDoc.getAttribute("offset"));
+┊   ┊ 73┊        });
+┊   ┊ 74┊
+┊   ┊ 75┊        next(null, JSON.stringify(json, null, 2));
+┊   ┊ 76┊      });
+┊   ┊ 77┊    },
+┊   ┊ 78┊    (json, next) => {
+┊   ┊ 79┊      // Once finished, write json into file
+┊   ┊ 80┊      Fs.writeFile(path + ".json", json, (err) => {
+┊   ┊ 81┊        next(err);
+┊   ┊ 82┊      });
+┊   ┊ 83┊    }
+┊   ┊ 84┊  ], (err) => {
+┊   ┊ 85┊    if (!err) console.log(
+┊   ┊ 86┊      `Font ${path} has been successfully parsed...`
+┊   ┊ 87┊    );
+┊   ┊ 88┊
+┊   ┊ 89┊    callback(err);
+┊   ┊ 90┊  });
+┊   ┊ 91┊};
+┊   ┊ 92┊
+┊   ┊ 93┊// Converts an string of numbers to array of numbers
+┊   ┊ 94┊// e.g. extractIntegers("1 2 3") -> [1, 2, 3]
+┊   ┊ 95┊function extractIntegers(srcstr) {
+┊   ┊ 96┊  return srcstr.split(" ").map((substr) => parseInt(substr));
+┊   ┊ 97┊}
+┊   ┊ 98┊
+┊   ┊ 99┊module.exports = {
+┊   ┊100┊  xmlToJson,
+┊   ┊101┊  xmlsToJsons
+┊   ┊102┊};🚫↵
```
[}]: #

This script will take everything that's in the `fonts` dir and parser it as mentioned above. Before we can user this script we will need to install some NPM dependencies like so:

    $ npm install --save underscore
    $ npm install --save xmldom

And instead of running the parser manually over and over again whenever we wanna use it, we will add an NPM script called `parse:fonts`:

[{]: <helper> (diff_step 4.8)
#### Step 4.8: Add font parsing npm scripts

##### Changed package.json
```diff
@@ -3,7 +3,8 @@
 ┊ 3┊ 3┊  "description": "A tutorial for creating a Tron-style game",
 ┊ 4┊ 4┊  "private": true,
 ┊ 5┊ 5┊  "scripts": {
-┊ 6┊  ┊    "serve": "nodemon server.js"
+┊  ┊ 6┊    "serve": "npm run parse:fonts && nodemon server.js",
+┊  ┊ 7┊    "parse:fonts": "node helpers/font_parser.js"
 ┊ 7┊ 8┊  },
 ┊ 8┊ 9┊  "dependencies": {
 ┊ 9┊10┊    "async": "^2.1.4",
```
[}]: #

Now we will build our `minecraftia` font by simply running:

    $ npm run parse:fonts

And voila! We have a freshly created `json` file which we can work with. You can also get it from here:

    resources/assets/fonts$ wget https://raw.githubusercontent.com/DAB0mB/radial-snake/master/resources/assets/fonts/minecraftia.json

Now that we have our assets finally ready we can go ahead and focus on extending the engine which powers up our game. We need some sort of a generic font-engine which will know how to load a font file and create a text-sprite out of it. First we will implement a class called `Restorable`, which shares the same restore API as the CanvasRenderingContext2D and will give us the ability to save and restore the font's state (More information can be found [here](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/restore)):

[{]: <helper> (diff_step 4.10)
#### Step 4.10: Add 'Restorable' class

##### Added resources/scripts/engine/restorable.js
```diff
@@ -0,0 +1,21 @@
+┊  ┊ 1┊Engine.Restorable = class Restorable {
+┊  ┊ 2┊  // Acts the same as canvas's save() and restore() API.
+┊  ┊ 3┊  // 'restorable' props are defined in the constructor
+┊  ┊ 4┊  constructor(...restorableProps) {
+┊  ┊ 5┊    this._restorableProps = restorableProps;
+┊  ┊ 6┊    this._restorableStates = [];
+┊  ┊ 7┊  }
+┊  ┊ 8┊
+┊  ┊ 9┊  // Save current state in the stack
+┊  ┊10┊  save() {
+┊  ┊11┊    this._restorableStates.push(this._restorableProps.reduce((state, prop) => {
+┊  ┊12┊      state[prop] = this[prop];
+┊  ┊13┊      return state;
+┊  ┊14┊    }, {}));
+┊  ┊15┊  }
+┊  ┊16┊
+┊  ┊17┊  // Pop most recent state and apply it
+┊  ┊18┊  restore() {
+┊  ┊19┊    _.extend(this, this._restorableStates.pop());
+┊  ┊20┊  }
+┊  ┊21┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -9,6 +9,7 @@
 ┊ 9┊ 9┊
 ┊10┊10┊    <!-- Scripts -->
 ┊11┊11┊    <script type="text/javascript" src="/scripts/namespaces.js"></script>
+┊  ┊12┊    <script type="text/javascript" src="/scripts/engine/restorable.js"></script>
 ┊12┊13┊    <script type="text/javascript" src="/scripts/engine/sprite.js"></script>
 ┊13┊14┊    <script type="text/javascript" src="/scripts/engine/animations/keyframe.js"></script>
 ┊14┊15┊    <script type="text/javascript" src="/scripts/engine/key_states.js"></script>
```
[}]: #

And now we can go ahead and implement the font class itself:

[{]: <helper> (diff_step 4.11)
#### Step 4.11: Create font engine

##### Added resources/scripts/engine/font.js
```diff
@@ -0,0 +1,133 @@
+┊   ┊  1┊Engine.Font = class Font extends Engine.Restorable {
+┊   ┊  2┊  // The src property acts just line native image's src property.
+┊   ┊  3┊  // Once finished loading, the onload() callback will be invoked
+┊   ┊  4┊  get src() {
+┊   ┊  5┊    return this._src;
+┊   ┊  6┊  }
+┊   ┊  7┊
+┊   ┊  8┊  set src(src) {
+┊   ┊  9┊    this._src = src;
+┊   ┊ 10┊
+┊   ┊ 11┊    // The font is actually an image, therefore we have 2 onload callbacks.
+┊   ┊ 12┊    // The first one is the native one which will always be run,
+┊   ┊ 13┊    // and the second one is a user defined one
+┊   ┊ 14┊    if (this.onload) var done = _.after(2, this.onload);
+┊   ┊ 15┊
+┊   ┊ 16┊    this.atlas = new Image();
+┊   ┊ 17┊    this.atlas.onload = done;
+┊   ┊ 18┊    this.atlas.src = `${src}.png`;
+┊   ┊ 19┊
+┊   ┊ 20┊    // Get json based on the given src property
+┊   ┊ 21┊    $.getJSON(`${src}.json`, data => {
+┊   ┊ 22┊      this.data = data;
+┊   ┊ 23┊      if (done) done();
+┊   ┊ 24┊    });
+┊   ┊ 25┊
+┊   ┊ 26┊    return this._src;
+┊   ┊ 27┊  }
+┊   ┊ 28┊
+┊   ┊ 29┊  constructor() {
+┊   ┊ 30┊    // The color property is the only restorable property
+┊   ┊ 31┊    super("color");
+┊   ┊ 32┊    this.charSpritesCache = {};
+┊   ┊ 33┊  }
+┊   ┊ 34┊
+┊   ┊ 35┊  // Creates a texture out of the font with the given text
+┊   ┊ 36┊  createTexture(text, options = {}) {
+┊   ┊ 37┊    let { noOffsets, noSpaces } = options;
+┊   ┊ 38┊    let canvas = document.createElement("canvas");
+┊   ┊ 39┊    let context = canvas.getContext("2d");
+┊   ┊ 40┊    let height = canvas.height = this.data.height;
+┊   ┊ 41┊
+┊   ┊ 42┊    // Calculates the width of the canvas based on the text and the font
+┊   ┊ 43┊    let width = canvas.width = _.reduce(text, (width, c) => {
+┊   ┊ 44┊      // No-space option means that the characters will be
+┊   ┊ 45┊      // drawn with no any space between them
+┊   ┊ 46┊      if (noSpaces) {
+┊   ┊ 47┊        return width + this.getCharSprite(c).width;
+┊   ┊ 48┊      }
+┊   ┊ 49┊
+┊   ┊ 50┊      return width + this.data.chars[c].width;
+┊   ┊ 51┊    }, 0);
+┊   ┊ 52┊
+┊   ┊ 53┊    // A custom size can be specified for a font as well
+┊   ┊ 54┊    if (this.size) {
+┊   ┊ 55┊      let ratio = this.size / this.data.size;
+┊   ┊ 56┊      canvas.height *= ratio;
+┊   ┊ 57┊      canvas.width *= ratio;
+┊   ┊ 58┊      context.scale(ratio, ratio);
+┊   ┊ 59┊    }
+┊   ┊ 60┊
+┊   ┊ 61┊    // No we are going to draw each char on the canvas individually,
+┊   ┊ 62┊    // naturally, there should be an offset after we draw each character.
+┊   ┊ 63┊    // This variable will be used to calculate the offset
+┊   ┊ 64┊    let offset = 0;
+┊   ┊ 65┊
+┊   ┊ 66┊    // Get for each char
+┊   ┊ 67┊    _.map(text, (char) => {
+┊   ┊ 68┊      return this.getCharSprite(char);
+┊   ┊ 69┊    })
+┊   ┊ 70┊    // Start drawing each char on the canvas
+┊   ┊ 71┊    .forEach((charSprite, index) => {
+┊   ┊ 72┊      let charData = this.data.chars[text.charAt(index)];
+┊   ┊ 73┊
+┊   ┊ 74┊      // Each char in the font xml has a native offset in addition to its rectangle.
+┊   ┊ 75┊      // This option will disable the calculation of the native offset
+┊   ┊ 76┊      if (noOffsets) {
+┊   ┊ 77┊        charSprite.draw(context, offset);
+┊   ┊ 78┊      }
+┊   ┊ 79┊      else {
+┊   ┊ 80┊        charSprite.draw(context, offset + charData.offset.x, charData.offset.y);
+┊   ┊ 81┊      }
+┊   ┊ 82┊
+┊   ┊ 83┊      if (noSpaces) {
+┊   ┊ 84┊        offset += charSprite.width;
+┊   ┊ 85┊      }
+┊   ┊ 86┊      else {
+┊   ┊ 87┊        offset += charData.width;
+┊   ┊ 88┊      }
+┊   ┊ 89┊
+┊   ┊ 90┊      // A color for the font can be specified as well
+┊   ┊ 91┊      if (this.color) {
+┊   ┊ 92┊        let overlayCanvas = document.createElement("canvas");
+┊   ┊ 93┊        let overlayContext = overlayCanvas.getContext("2d");
+┊   ┊ 94┊        overlayCanvas.width = width;
+┊   ┊ 95┊        overlayCanvas.height = height;
+┊   ┊ 96┊        overlayContext.beginPath();
+┊   ┊ 97┊        overlayContext.rect(0, 0, width, height);
+┊   ┊ 98┊        overlayContext.fillStyle = this.color;
+┊   ┊ 99┊        overlayContext.fill();
+┊   ┊100┊
+┊   ┊101┊        context.save();
+┊   ┊102┊        context.globalCompositeOperation = "source-in";
+┊   ┊103┊        context.drawImage(overlayCanvas, 0, 0);
+┊   ┊104┊        context.restore();
+┊   ┊105┊      }
+┊   ┊106┊    });
+┊   ┊107┊
+┊   ┊108┊    // The canvas will be treated like an image
+┊   ┊109┊    return canvas;
+┊   ┊110┊  }
+┊   ┊111┊
+┊   ┊112┊  // Gets a sprite of the given char, using the current font
+┊   ┊113┊  getCharSprite(char) {
+┊   ┊114┊    // If char is already stored in cache, abort calculation and return it
+┊   ┊115┊    if (this.charSpritesCache[char]) return this.charSpritesCache[char];
+┊   ┊116┊
+┊   ┊117┊    // This data is fetched by the given json
+┊   ┊118┊    let { x, y, width, height } = this.data.chars[char].rect;
+┊   ┊119┊    // Creating a canvas which we will use to draw on,
+┊   ┊120┊    // but it is used exactly like an image afterwards
+┊   ┊121┊    let canvas = document.createElement("canvas");
+┊   ┊122┊    let context = canvas.getContext("2d");
+┊   ┊123┊
+┊   ┊124┊    // The canvas will have the same dimensions as the font
+┊   ┊125┊    canvas.width = width;
+┊   ┊126┊    canvas.height = height;
+┊   ┊127┊    // Draw a cropped image from the atlas, this image contains the char font
+┊   ┊128┊    context.drawImage(this.atlas, x, y, width, height, 0, 0, width, height);
+┊   ┊129┊
+┊   ┊130┊    // Store in cache and return it
+┊   ┊131┊    return this.charSpritesCache[char] = new Engine.Sprite(canvas);
+┊   ┊132┊  }
+┊   ┊133┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -10,6 +10,7 @@
 ┊10┊10┊    <!-- Scripts -->
 ┊11┊11┊    <script type="text/javascript" src="/scripts/namespaces.js"></script>
 ┊12┊12┊    <script type="text/javascript" src="/scripts/engine/restorable.js"></script>
+┊  ┊13┊    <script type="text/javascript" src="/scripts/engine/font.js"></script>
 ┊13┊14┊    <script type="text/javascript" src="/scripts/engine/sprite.js"></script>
 ┊14┊15┊    <script type="text/javascript" src="/scripts/engine/animations/keyframe.js"></script>
 ┊15┊16┊    <script type="text/javascript" src="/scripts/engine/key_states.js"></script>
```
[}]: #

The font API shares a similar API as [HTMLImageElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image), once we set the `src` property the font will start loading itself, and the `onload` user-defined callback should be called once finished. Another neat feature would be the `createTexture` method, which takes a string as its first argument, representing the text that we would like to generate, and returns an instance of the `Sprite` class.

We will also be adding the option to load some font assets in our asset-loader:

[{]: <helper> (diff_step 4.12)
#### Step 4.12: Add a font loading option to 'AssetLoader'

##### Changed resources/scripts/engine/assets_loader.js
```diff
@@ -10,4 +10,12 @@
 ┊10┊10┊    image.src = `${path}.png`;
 ┊11┊11┊    return image;
 ┊12┊12┊  }
+┊  ┊13┊
+┊  ┊14┊  // Load font
+┊  ┊15┊  font(path) {
+┊  ┊16┊    let font = new Engine.Font();
+┊  ┊17┊    font.onload = this.next();
+┊  ┊18┊    font.src = path;
+┊  ┊19┊    return font;
+┊  ┊20┊  }
 ┊13┊21┊};🚫↵
```
[}]: #

And replace the instructions texture loading with a `minecraftia` font loading in the initial splash screen:

[{]: <helper> (diff_step 4.13)
#### Step 4.13: Load 'minecraftia' font in splash screen

##### Changed resources/scripts/game/screens/splash/index.js
```diff
@@ -33,7 +33,7 @@
 ┊33┊33┊
 ┊34┊34┊  load(assetsLoader) {
 ┊35┊35┊    // Load assets
-┊36┊  ┊    let instructionsTexture = assetsLoader.texture("/textures/instrucitons");
+┊  ┊36┊    let minecraftiaFont = assetsLoader.font("/fonts/minecraftia");
 ┊37┊37┊    let logoTexture = assetsLoader.texture("/textures/logo");
 ┊38┊38┊    let splashTexture = assetsLoader.texture("/textures/splash");
 ┊39┊39┊
```
```diff
@@ -41,7 +41,7 @@
 ┊41┊41┊    // disposed. We use the time gap created by the splash animation to load necessary
 ┊42┊42┊    // assets without wasting any time
 ┊43┊43┊    this.game.extendAssets({
-┊44┊  ┊      instructionsTexture,
+┊  ┊44┊      minecraftiaFont,
 ┊45┊45┊      logoTexture
 ┊46┊46┊    });
```
[}]: #

Now it can use us in the main menu screen where we will create a text-sprite saying `Press a key to start`, just like the instruction sprite we're about to replace:

[{]: <helper> (diff_step 4.14)
#### Step 4.14: Replace texture usage with font usage in main menu screen

##### Changed resources/scripts/game/screens/menu/index.js
```diff
@@ -5,7 +5,8 @@
 ┊ 5┊ 5┊    this.logoSprite.setPercentage("width", this.width, 30, "height");
 ┊ 6┊ 6┊
 ┊ 7┊ 7┊    // Initialize instructions sprite
-┊ 8┊  ┊    let instructionsSprite = new Engine.Sprite(this.assets.instructionsTexture);
+┊  ┊ 8┊    let instructionsTexture = this.assets.minecraftiaFont.createTexture("Press a key to start");
+┊  ┊ 9┊    let instructionsSprite = new Engine.Sprite(instructionsTexture);
 ┊ 9┊10┊    instructionsSprite.align = "center";
 ┊10┊11┊    instructionsSprite.setPercentage("width", this.width, 35, "height");
 ┊11┊12┊    instructionsSprite.x = this.width / 2;
```
```diff
@@ -30,7 +31,7 @@
 ┊30┊31┊
 ┊31┊32┊  unload() {
 ┊32┊33┊    // Dispose the following assets to prevent memory leaks
-┊33┊  ┊    return ["logoTexture", "instructionsTexture"];
+┊  ┊34┊    return "logoTexture";
 ┊34┊35┊  }
 ┊35┊36┊
 ┊36┊37┊  draw(context) {
```
```diff
@@ -41,4 +42,8 @@
 ┊41┊42┊  update(span) {
 ┊42┊43┊    this.instructionsAnim.update(span);
 ┊43┊44┊  }
+┊  ┊45┊
+┊  ┊46┊  update(span) {
+┊  ┊47┊    this.instructionsAnim.update(span);
+┊  ┊48┊  }
 ┊44┊49┊};🚫↵
```
[}]: #

It shouldn't look any different from the beginning of the step where we manually drew the instruction texture, but in the next steps we will be using the font-engine a lot, and you will be thankful for what we've just did.
[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step3.md) | [Next Step >](step5.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #