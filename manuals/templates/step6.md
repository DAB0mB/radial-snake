![snake-demo-game-small](https://cloud.githubusercontent.com/assets/7648874/21074124/8b7cd724-bed7-11e6-9f91-2a211630ac78.gif)

In this step we will be using the `Snake` class we've just created in the previous step to form the actual game screen - called the `Play` screen. The play screen is a complex screen made out multiple layers as following:

- **`Ready` layer** - Displays a message at the beginning of each match.
- **`Snake` layer** - Displays the the competitors' snakes.
- **`Score` layer** - Displays the score board.
- **`Win` layer** - Displays the winner at the end of each match.

As we go further with this step, we will give a deeper explanation about each layer and how they interact with each other; As for let's start with the `Play` screen's basis. Regardless of what the `Play` screen should contain at the final result, we want to have the ability to abort the match whenever we press the `Escape` key, therefore, the initial implementation should look like this:

{{{diff_step 6.1}}}

Now that we have the `Play` screen, we need to hook it to the `Menu` screen, so whenever we press a key, we will be proceeded to it:

{{{diff_step 6.2}}}

By now there shouldn't be anything special. Once you're at the main menu, just press a key as instructed, and you shall see a black screen, which is actually the `Play` screen we've just created; And once you'll press the `Escape` key, you should be receded to the main menu.

The next stage would be displaying a `Ready` message on the screen, and whenever a key is pressed, the message should fade away using a key-frame animation, and the match should start in the background:

{{{diff_step 6.3}}}

In order to hook the `Ready` layer to the `Play` screen, we will just push a new instance of it to the layers stack, using the screen's `appendLayer` method. Note that the order of the layer is super critic! Since if we push a new layer it means it will be drawn on top of any previous layer. To "shift" a layer to the layers stack, we can simply use the `prependLayer` method instead. Without further due, this is how our hook should look like:

{{{diff_step 6.4}}}

Now if you'll launch the game and start a new match, you should see a white `Ready` message in the middle of the screen. Up next, would be the `Snake` layer, which will simply initialize 2 new `Snake` instances, and take care of drawing and updating them:

{{{diff_step 6.5}}}

Once pressing a key in the `Ready` layer, not only we want to display an animation, but we also want the match to start in the background, thus, we gonna push a new instance of the `Snake` layer we've just created like so:

{{{diff_step 6.6}}}

Note that the layer is pushed when the animation starts and not once finished; This would give a nice smooth feeling to our game-flow. If you'll test out the game, you would discover that the match is actually playable! The first snake (Red) snake should be controlled by the arrow keys, and the second snake (Blue) should be controlled by the letter keys `a`, `s`, `d` and `w`. So far, the snakes function great, but you can probably tell that whenever a match is finished, it feels a bit dull. There's no indication of winning, and there's no score board to present the score of each competitor, which brings us to the next stage - Implementing the `Score` layer.

The `Score` layer is a simple layer which takes the 2 snakes as a parameter and displays their scores at the top of the screen:

{{{diff_step 6.7}}}

> Note that the current score board is suitable for two players, but can easily be modified to support as much players as you want if done correctly.

The `Score` board should be appended to the layers stack as soon as the `Snake` layers is initialized, so it would be available to us once the match is started:

{{{diff_step 6.8}}}

Now we're one layer further from completing the `Play` screen, the only thing missing is the `Win` layer, which should present the winner once the match is finished:

{{{diff_step 6.9}}}

Note how we use the `changeScreen` method once the `Win` layer has reached its age limit (Time to live, aka `ttl`); This would clear the layers stack and restart the `Play` screen, so we can start a new match all-over, only this time we will pass the `Snake` instances to reserve the original scores. The `Win` layer should be presented whenever a collision has been detected between the snakes:

{{{diff_step 6.10}}}

That's it folks, the `Play` screen is finished, and you can play as much matches as you'd feel like.

Although the game is finished, it can still be optimized using `C++`. To discover more on hooking efficiency and how we can hook `C++` to the browser, see the next step.