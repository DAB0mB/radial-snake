![snake-demo-menu-small](https://cloud.githubusercontent.com/assets/7648874/21074099/e72a81bc-bed6-11e6-98cb-329dc12a4b06.gif)

In this step we will be creating the main menu screen as shown above. The main menu screen is a simple screen which will show the logo of the game and an instruction text saying `Press a key to start`. We will be using a simple texture to show the game-logo and we will use the key-frame animation engine to show a flickering animation of the instruction text. The instruction text is the main part of this step, since it is made out of a font file (`.ttf`) and the text is auto-generated, a general solution which can serve us in many situations. We will start by implementing the main menu using static assets, which means that we will use a texture to show the instructions text, and later on we will implement the generic solution I've just mentioned. First, we will download the necessary assets:

    resources/assets/textures$ wget https://raw.githubusercontent.com/DAB0mB/radial-snake/master/resources/assets/textures/instructions.png
    resources/assets/textures$ wget https://raw.githubusercontent.com/DAB0mB/radial-snake/master/resources/assets/textures/logo.png

And then we will implement the initial main menu screen:

{{{diff_step 4.2}}}

This screen is dependent on several assets which we will load during "splash screen time", to save some loading time and for a smooth experience. The main menu screen will be shown automatically once the splash animation has been finished:

{{{diff_step 4.3}}}

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

{{{diff_step 4.6}}}

This script will take everything that's in the `fonts` dir and parser it as mentioned above. Before we can user this script we will need to install some NPM dependencies like so:

    $ npm install --save underscore
    $ npm install --save xmldom

And instead of running the parser manually over and over again whenever we wanna use it, we will add an NPM script called `parse:fonts`:

{{{diff_step 4.8}}}

Now we will build our `minecraftia` font by simply running:

    $ npm run parse:fonts

And voila! We have a freshly created `json` file which we can work with. You can also get it from here:

    resources/assets/fonts$ wget https://raw.githubusercontent.com/DAB0mB/radial-snake/master/resources/assets/fonts/minecraftia.json

Now that we have our assets finally ready we can go ahead and focus on extending the engine which powers up our game. We need some sort of a generic font-engine which will know how to load a font file and create a text-sprite out of it. First we will implement a class called `Restorable`, which shares the same restore API as the CanvasRenderingContext2D and will give us the ability to save and restore the font's state (More information can be found [here](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/restore)):

{{{diff_step 4.10}}}

And now we can go ahead and implement the font class itself:

{{{diff_step 4.11}}}

The font API shares a similar API as [HTMLImageElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image), once we set the `src` property the font will start loading itself, and the `onload` user-defined callback should be called once finished. Another neat feature would be the `createTexture` method, which takes a string as its first argument, representing the text that we would like to generate, and returns an instance of the `Sprite` class.

We will also be adding the option to load some font assets in our asset-loader:

{{{diff_step 4.12}}}

And replace the instructions texture loading with a `minecraftia` font loading in the initial splash screen:

{{{diff_step 4.13}}}

Now it can use us in the main menu screen where we will create a text-sprite saying `Press a key to start`, just like the instruction sprite we're about to replace:

{{{diff_step 4.14}}}

It shouldn't look any different from the beginning of the step where we manually drew the instruction texture, but in the next steps we will be using the font-engine a lot, and you will be thankful for what we've just did.