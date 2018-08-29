![snake-demo-splash-small](https://cloud.githubusercontent.com/assets/7648874/21074086/a19fa9ce-bed6-11e6-9060-2ce94c215712.gif)

In this step we will be creating the `splash` screen - the initial screen that should be shown once we launch the game. Our splash is consisted of a random logo animation as presented in the `gif` file above. The "splash" effect can be achieved using 2 concepts:

- A sprite class - Which will present the logo texture in different dimensions, angles and rotations.
- A key-frame animation - Which will draw an animation automatically along the time axis using key-frames - each is a sprite representation of the texture in a specific time point.

So first thing first, we will start by implementing the sprite class:

{{{diff_step 3.1}}}

And we will download the logo which will be presented in the splash screen using the sprite class:

    resources$ mkdir assets
    resources$ cd assets
    resources/assets$ mkdir textures
    resources/assets$ cd textures
    resources/assets/textures$ wget raw.githubusercontent.com/dab0mb/radial-snake/master/resources/assets/textures/splash.png

> Any logo can that you desired can be used instead! But to ease things up I already provided you with one as a sample

Now we will create the initial splash screen, where we only gonna show a sprite of the logo in the middle of the screen, with no animation applied yet. We will first define a dedicated `Screens` module under the `Game` namespace:

{{{diff_step 3.3}}}

And we can go ahead and implement the screen itself:

{{{diff_step 3.4}}}

Now we can set the splash screen as the initial screen in the entry script file:

{{{diff_step 3.5}}}

And we will get rid of the unnecessary test screen since we make no use of it any longer:

    $ rm resources/scripts/test_screen.js

We will now proceed into the next stage where we will be implementing the key-frame animation engine as said at the beginning of the step. We first need to define an `Animations` module, since we can have multiple types of animation strategy like [sprite-atlas animation](http://www.joshmorony.com/how-to-create-animations-in-phaser-with-a-texture-atlas/), not necessarily a key-frame animation:

{{{diff_step 3.7}}}

Inside the newly created module we will create the key-frame animation engine. The key-frame animation consists of the following methods:

- update - Updates the animation.
- draw - Draws the current animation frame on the provided canvas context.
- play - Enables update operations.
- pause - Disables update operations.

{{{diff_step 3.8}}}

When initializing a new instance of the key-frame animation, we should invoke it with the desired sprite, and an array of key-frames. What exactly does a single key-frame represents? The properties of the sprite at that specific time point. In addition, a key-frame can be set with an [easing mode](https://css-tricks.com/ease-out-in-ease-in-out/) of `in` and `out`. By default, the animation would be linear.

Based on the `repitationMode` property, three things can happen to the animation once finished:

- `none` - The animation will play once, and then stop. It will appear as a static sprite.
- `cyclic` - The animation will repeat itself from the beginning, over and over again until stopped manually.
- `full` - The animation will play itself backwards, and then forwards, backwards, forwards, and so on.

Thanks to the key-frame animation engine, we can apply it to the splash screen to show a beautifully animated logo rather than showing a static image. So in addition to the logo sprite, we will initialize a key-frame animation as well:

{{{diff_step 3.9}}}

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