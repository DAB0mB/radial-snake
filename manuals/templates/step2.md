Like any other JavaScript-based application, we should have an entry view written in HTML. However, in our application, the only visible element is going to be an [HTMLCanvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API). The canvas is exactly what it sounds like - a blank white surface which we can draw things on top of it. As we go further with this tutorial, we will learn more about the canvas and dive into its API and how to use it. Now that you got the general idea, let's create the HTML file:

{{{diff_step 2.1}}}

In the previous step we've already set the route for this file, so if you'd like to run the game, simply start the server by typing `npm run serve`, and navigate to the address presented on the screen (Should be `localhost:8000` by default).

> From now on I'm going to assume the server is running in the background, so I won't repeat the instruction above

Just to make sure that the canvas is visible and not blended into the background, we will draw a black border around using a simple style-sheet:

{{{diff_step 2.2}}}

> Note that every asset we create should be declared in the HTML file in order for it to take effect

To build this project we're also gonna use two very famous utility libraries called [JQuery](http://jquery.com/) and [Underscore](http://underscorejs.org/) which will make our lives a bit easier. Third-party libraries should be located in a directory called `libs`, according to the routes-map we created in the previous step. To set these libraries up, type the following commands in series:

    resources$ mkdir libs
    resources$ cd libs
    resources/libs$ wget raw.githubusercontent.com/dab0mb/radial-snake/master/resources/libs/underscore.js
    resources/libs$ wget raw.githubusercontent.com/dab0mb/radial-snake/master/resources/libs/jquery-2.1.1.js

And load them in the game's HTML file's header:

{{{diff_step 2.3 views/game.html}}}

Now, we're finally going to build the game engine. At first, it's gonna be very basic simple, but further in this tutorial we're going to extend it and add some pretty neat features. When creating an application, of any kind, you don't want to garbage the global scope, so it can stay clean without any conflicts. Therefore, we're going to create an initial namespace for our game engine called `Engine`, which is going to contain all our game engine's classes and entities:

{{{diff_step 2.4}}}

The first thing we're going to define in the namespace we've just created would be the game loop. The game loop is the central code of your game, split into different parts. Generally, these are: update and draw.

The main purpose of the update phase is to prepare all objects to be drawn, so this is where all the geometry code, coordinate updates, score changes, animation refreshments and other similar operations belong. This is also where the input will be captured and processed.

When everything is properly updated and ready, we enter the draw phase where all this information is put on the screen. This function should contain all the code to manage and draw the levels, shapes, score board and so on.

![game-loop](https://cloud.githubusercontent.com/assets/7648874/21332964/4b80ef4e-c633-11e6-946a-0c5870d2f9c9.png)

> You can find plenty of details and information about what "game loop" means simply by typing in on Google.

A game loop can wear many forms, but the concept is gonna be the same, plus-minus. This is how our game loop is going to loop like:

{{{diff_step 2.5}}}

The only thing it's doing right now is only drawing a black background, but we're soon going to learn how to take advantage of this game-loop to draw some custom stuff. I just want to point out that in the `draw` method I used a very handy technique called [double-buffer](https://en.wikipedia.org/wiki/Multiple_buffering), where I first draw everything on a virtual canvas which is not visible to us, and once it's finished, I the result on the main canvas. It behaves the same way React's [virtual DOM](https://www.npmjs.com/package/react-dom) behaves like, and it will prevent our game from stuttering. To start running the game, we first need to wait for the DOM content to initialize, and once its ready we gonna create a new game instance and call the `play` method:

{{{diff_step 2.6}}}

This will take control over the canvas and will draw a new picture every 17ms, which is 60fps (Frames per second). As for now you're only going to see a black canvas, but I promise the final result is not going to disappoint you.

The next thing we're gonna do would be adding a 'key state' manager, which will store a flag for each key pressed on the keyboard. Once we press the key, the flag's value would be `true`, and once we release it, its value would turn into `false`. This way we have an easy way to track all the key presses without registering a specific event listener for each key press we wanna track:

{{{diff_step 2.7}}}

Now that we have the key state manager, we will initialize a new instance as part of our game's essentials, and we will create a global event listener for key presses; Each time a key is pressed, the key state manager will update itself:

{{{diff_step 2.8}}}

A 2D game's view might get complex as we go through with its development and add more logic and entities into it. Having only one `draw` method and only one `update` method is not enough, and if you think of it, it might easily get buffed up into ridiculous dimensions, which is not the way to go. I'd like to introduce you into a new methodology which involves `screens` and `layers`:

- **screen** - Will literally be used whenever we want to show a new screen in our game e.g. 'splash' screen and 'main menu' screen. A screen consists of multiple layers, and will be used as their communicator; All the relevant assets and logic will be initialized inside it.
- **layer** - similar to Photoshop's layer system, any time we want to add something to the view we add new layers on top or beneath of each other.

![screen-layer](https://cloud.githubusercontent.com/assets/7648874/21487708/9b366efe-cbb7-11e6-8669-3212e440871a.png)

As I said earlier, the purpose of the screens and the layers is just to split the task of updating and drawing and updating, so we can have logical segments; So the `layer` class should mainly consist of a `draw` and an `update` method:

{{{diff_step 2.9}}}

Same thing for the screen, it only has a `draw` and `update` methods, only it has a stack of layers, which can either be added or removed:

{{{diff_step 2.10}}}

Now that we have the `screen` class available for us, let's apply it to the main game loop:

{{{diff_step 2.11}}}

This step looks kind of useless for now, unless we will have the ability to change screens as we please. Any time a screen is changed, it should be loaded with its necessary assets e.g textures, sounds, fonts, etc. The assets loading is an asynchronous operation whose logic might get a bit messy if not managed properly. To make it easier, we're going to define an assets loader, which will help us load assets asynchronously:

{{{diff_step 2.12}}}

> As for now the `assets loader` only has the ability to load textures, but we will extend it as we go further in this tutorial, no need to overdo it.

Now that we have the `assets loader` we can add the ability to change a screen. Whenever we change a screen, the old screen's assets should be unloaded, and the new screen's assets should be loaded using the `assets loader`:

{{{diff_step 2.13}}}

Let's add a test screen just so we can get the hang of it. The test screen will only print a message to the canvas:

{{{diff_step 2.14}}}

Now we will use the test screen by changing to it as we create an instance of the game:

{{{diff_step 2.15}}}

Once you will load the application you should see a black canvas with a white text saying:

    This is a test screen

It means our screen system works and you may proceed to the next step, where we're gonna create our first screen :-)