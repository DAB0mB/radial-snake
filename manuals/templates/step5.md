![snake-illustrate](https://cloud.githubusercontent.com/assets/7648874/21074115/46ef4466-bed7-11e6-9d5d-12fa6d43147b.gif)

In this step we will be creating all the necessary geometry shapes to form a snake; we're basically implementing the right infrastructure so in the next step we will be able to implement the game screen with ease. What exactly do I mean by "geometry shapes"? Well, our snake will be made out of circles, and lines. If we don't press any buttons at all, the snake should move forward at a straight line, and once we press on one of the arrow keys, the snake should move in a circular motion. Not only we want to draw the screen on the canvas, we also want to be able to detect collision with other snakes, since this is a "Tron" style game where we gonna fight against an opponent.

Keep in mind that a computer's precision is limited due its [binary representation in memory](https://en.wikipedia.org/wiki/Memory_cell_(binary)). We need to take into consideration that there might be a significant deviation when detecting collisions and intersections between geometry shapes, especially when elapsed time is not always guaranteed to stay precise. To handle these deviation issues, we're gonna create some utility functions and place then as an extension for the `Number` prototype:

{{{diff_step 5.1}}}

Now we would like to start implementing the first class representation for a line, and for that we're requires to add a new module called `Geometry` to the `Engine` namespace:

{{{diff_step 5.2}}}

And now that we have this module available to use, we can go ahead and implement our first geometry shape class - `Line`:

{{{diff_step 5.3}}}

You can go through the comments of the step above which will guide you through the programmatic aspect of it, but I think it's more important to understand the concept of a line in 2D space. A line is made out of two points, usually represented as `(x1, y1)` and `(x2, y2)`. The slope of the line, usually represented as `m`, can be determined using these two points based on the following formula:

![slope](https://cloud.githubusercontent.com/assets/7648874/21788249/b4c7e41c-d6b4-11e6-9c17-baff66ec6bc8.png)

Once we have two lines whose `m` is different (Unparalleled) and there is no intersection between the points of which they are represented with (In which case they are united), there must be an intersection point. The intersection point can be found using the following formula:

![line-line](https://cloud.githubusercontent.com/assets/7648874/21787164/c9d83bf0-d6ae-11e6-9846-4fc013eebab3.png)

![line-line-illustration](https://cloud.githubusercontent.com/assets/7648874/21790864/56725cf0-d6c6-11e6-916b-50b1fc0b87af.png)

> See reference: http://mathworld.wolfram.com/Line-LineIntersection.html.

Obviously we have some logic here which needs to be tested. To test our `Line` class, we will be using a testing framework called [Jasmine](https://jasmine.github.io/). We first need to download `Jasmine`'s essentials in order for it to work:

    resources/libs$ mkdir jasmine
    resources/libs$ cd jasmine
    resources/libs/jasmine$ wget https://raw.githubusercontent.com/DAB0mB/radial-snake/master/resources/libs/jasmine/boot.js
    resources/libs/jasmine$ wget https://raw.githubusercontent.com/DAB0mB/radial-snake/master/resources/libs/jasmine/console.js
    resources/libs/jasmine$ wget https://raw.githubusercontent.com/DAB0mB/radial-snake/master/resources/libs/jasmine/jasmine-html.js
    resources/libs/jasmine$ wget https://raw.githubusercontent.com/DAB0mB/radial-snake/master/resources/libs/jasmine/jasmine.css
    resources/libs/jasmine$ wget https://raw.githubusercontent.com/DAB0mB/radial-snake/master/resources/libs/jasmine/jasmine.js
    resources/libs/jasmine$ wget https://raw.githubusercontent.com/DAB0mB/radial-snake/master/resources/libs/jasmine/jasmine_favicon.png

These essentials should be loaded in a newly created view where we're gonna see our specs running:

{{{diff_step 5.5}}}

Now once we'll navigate to the `/test` sub-route (`localhost:8000/test` by default) we should be provided with the spec runner. As for now there are no specs implemented at all, which brings us to the next stage - Implementing tests for `Line` class:

{{{diff_step 5.6}}}

Now if you'll refresh the spec runner page you should be able to a green screen indicating all tests have passed (Assuming the tutorial is updated and you followed it correctly). As introduced at the beginning of the step, the snake is also dependent on circles, whose representing class should look like so:

{{{diff_step 5.7}}}

Just like a line, a circle can be presented using variables as well. The center of the circle is represented as `(x, y)` and its radius is represented as `r`. Remember that our circle doesn't necessarily have to be a full one, therefore we limit its range using two radians - `rad1` and `rad2`. The formula for representing a circle in a 2D space looks like this:

![circle-formula](https://cloud.githubusercontent.com/assets/7648874/21829783/84a54574-d77f-11e6-9b87-3fb0f073bb8d.png)

![circle-circle-illustration](https://cloud.githubusercontent.com/assets/7648874/21790842/3a73408c-d6c6-11e6-8bdd-9c73355e6ebb.png)

> `a` and `b` represent the offsets from the `x` and the `y` axes respectively.
> See reference: http://mathworld.wolfram.com/Circle-CircleIntersection.html.

To find intersection between two circles, we simply calculate the solution for two equations with two variables. Given that a line can be represented in a 2D space using the following formula:

![line-formula](https://cloud.githubusercontent.com/assets/7648874/21790671/1609c050-d6c5-11e6-8bd7-16cc306f5eea.png)

![circle-line-illustration](https://cloud.githubusercontent.com/assets/7648874/21790810/1a052086-d6c6-11e6-9c5c-24298fedb043.png)

> `n` represents the intersection value with the `y` axis.
> See reference: http://mathworld.wolfram.com/Circle-LineIntersection.html.

we can find the intersection between a circle and line by solving the systems formed by the equations of both. We also want the line-circle algorithm to be available for any `Line` instance, therefore we gonna add the following delegate on the `Line` prototype:

{{{diff_step 5.8}}}

Then again a newly created geometry shape class should be tested against different scenarios:

{{{diff_step 5.9}}}

Our final shape in the geometry module would be a polygon. Why a polygon? Since I'm planning to make the snake's movement circular, which means that once the snake hits a random boundary, he will reappear from the other side of the canvas. The collision detection between the snake and the canvas would be done using a polygon - which is simply made out of 4 lines:

{{{diff_step 5.10}}}

Again we will delegate the newly created intersection methods in the `Line` class and `Circle` class:

{{{diff_step 5.11}}}

Now we will create a some tests to make sure our newly created polygon works properly:

{{{diff_step 5.12}}}

At last, all the necessary geometry shapes are implemented and ready to use. We will now focus on the snake itself. Since our game can potentially have infinite number of entities, not necessarily just a snake, we will add the a new module under the `Game` namespace called `Entities`:

{{{diff_step 5.13}}}

And now we can add the `Snake` class:

{{{diff_step 5.14}}}

This class is titled with most complexity out of everything we did so far in this step. You can follow the code accompanied by comments regard it, but I'd also like to explain the key concepts. As said earlier, the `Snake` is simply made out of shapes; In this case - lines and circles.

The `draw` method just goes through this array and draws whatever shape it's currently looping through. Regardless of its type, every shape is provided with a `draw` method of its own, all shapes share the same interface, therefore we can just draw them regularly and the snake should be drawn automatically.

The `update` method updates the last bit only according to its type, the time elapsed and the speed of the snake. For example, the last bit of the snake is a line, and 5 seconds have passed at a speed of 5 meters per second, our line should be extended by 5 meters long. Same principle applies to circle extension only based on radians. The last bit's type might be changed according to the current input; e.g. if the `right` key is held the last bit would turn into a circle, and once released it would turn into a straight line.

Note that besides shapes extension, collision detection should also be made. The embedded is the collision detection between the snake and the canvas, which means that any time the snake collides with the canvas's boundaries the last bit should be redrawn from the opposite side of the canvas. In addition, we've implemented intersection methods for self collision detection and collision detection between rivals, which should be used externally by the hosting screen.

In the next step we will be implementing the game screen where we will make use of the `Snake` class we've just created, and see how it works in action.