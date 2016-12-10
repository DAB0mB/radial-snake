[{]: <region> (header)
# Step 5: Creating a snake and related geometry shapes
[}]: #
[{]: <region> (body)
![snake-illustrate](https://cloud.githubusercontent.com/assets/7648874/21074115/46ef4466-bed7-11e6-9d5d-12fa6d43147b.gif)

In this step we will be creating all the necessary geometry shapes to form a snake; we're basically implementing the right infrastructure so in the next step we will be able to implement the game screen with ease. What exactly do I mean by "geometry shapes"? Well, our snake will be made out of circles, and lines. If we don't press any buttons at all, the snake should move forward at a straight line, and once we press on one of the arrow keys, the snake should move in a circular motion. Not only we want to draw the screen on the canvas, we also want to be able to detect collision with other snakes, since this is a "Tron" style game where we gonna fight against an opponent.

Keep in mind that a computer's precision is limited due its [binary representation in memory](https://en.wikipedia.org/wiki/Memory_cell_(binary)). We need to take into consideration that there might be a significant deviation when detecting collisions and intersections between geometry shapes, especially when elapsed time is not always guaranteed to stay precise. To handle these deviation issues, we're gonna create some utility functions and place then in a new module called `Utils`:

[{]: <helper> (diff_step 5.1)
#### Step 5.1: Create utilities module

##### Added resources/scripts/utils.js
```diff
@@ -0,0 +1,78 @@
+┊  ┊ 1┊// A wrapper function for our utilities which will enable chaining
+┊  ┊ 2┊// e.g. Utils().mod().trim().isBetween()...
+┊  ┊ 3┊Utils = function Utils(context) {
+┊  ┊ 4┊  const chain = {};
+┊  ┊ 5┊
+┊  ┊ 6┊  Object.keys(Utils).forEach((utilName) => {
+┊  ┊ 7┊    chain[utilName] = (...args) => {
+┊  ┊ 8┊      const result = Utils[utilName](context, ...args);
+┊  ┊ 9┊      return Utils(result);
+┊  ┊10┊    };
+┊  ┊11┊  });
+┊  ┊12┊
+┊  ┊13┊  // Returns the result of the chaining
+┊  ┊14┊  chain.value = () => context;
+┊  ┊15┊
+┊  ┊16┊  return chain;
+┊  ┊17┊};
+┊  ┊18┊
+┊  ┊19┊// Fixed modulo method which can calculate modulo of negative numbers properly
+┊  ┊20┊// e.g. (-803).mod(800) returns 797
+┊  ┊21┊Utils.mod = function (context, num) {
+┊  ┊22┊  return ((context % num) + num) % num;
+┊  ┊23┊};
+┊  ┊24┊
+┊  ┊25┊// Trims number and leaves the number of decimals specified.
+┊  ┊26┊// The "mode" argument specifies which math function should be invoked
+┊  ┊27┊// right after the number has been trimmed.
+┊  ┊28┊// e.g. 12.12345.trim(3, "ceil") returns 12.124
+┊  ┊29┊Utils.trim = function (context, decimals, mode = "round") {
+┊  ┊30┊  return Math[mode](context * Math.pow(10, decimals)) / Math.pow(10, decimals);
+┊  ┊31┊};
+┊  ┊32┊
+┊  ┊33┊// Tells if number is in specified range based on given precision.
+┊  ┊34┊// See the "compare" method for more information about precision
+┊  ┊35┊Utils.isBetween = function (context, num1, num2, precision) {
+┊  ┊36┊  return Utils.compare(context, Math.min(num1, num2), ">=", precision) &&
+┊  ┊37┊         Utils.compare(context, Math.max(num1, num2), "<=", precision);
+┊  ┊38┊};
+┊  ┊39┊
+┊  ┊40┊// Initiates comparison operator between context number and a given number, only here
+┊  ┊41┊// a precision can be specified
+┊  ┊42┊Utils.compare = function (context, num, method, precision) {
+┊  ┊43┊  switch (arguments.length) {
+┊  ┊44┊    case 2:
+┊  ┊45┊      var precision = arguments[1];
+┊  ┊46┊      break;
+┊  ┊47┊    case 3:
+┊  ┊48┊      var method = arguments[1];
+┊  ┊49┊      precision = arguments[2];
+┊  ┊50┊      break;
+┊  ┊51┊  }
+┊  ┊52┊
+┊  ┊53┊  switch (precision) {
+┊  ┊54┊    // Fixed precision, "almost equal" with a deviation of ε
+┊  ┊55┊    case "f":
+┊  ┊56┊      switch (method) {
+┊  ┊57┊        case "<": case "<=": return context <= num + Number.EPSILON;
+┊  ┊58┊        case ">": case ">=": return context >= num - Number.EPSILON;
+┊  ┊59┊        default: return Math.abs(context - num) <= Number.EPSILON;
+┊  ┊60┊      }
+┊  ┊61┊    // Pixel precision, round comparison
+┊  ┊62┊    case "px":
+┊  ┊63┊      switch (method) {
+┊  ┊64┊        case "<": case "<=": return Math.round(context) <= Math.round(num);
+┊  ┊65┊        case ">": case ">=": return Math.round(context) >= Math.round(num);
+┊  ┊66┊        default: return Math.round(context) == Math.round(num);
+┊  ┊67┊      }
+┊  ┊68┊    // Exact precision
+┊  ┊69┊    default:
+┊  ┊70┊      switch (method) {
+┊  ┊71┊        case "<": return context < num;
+┊  ┊72┊        case "<=": return context <= num;
+┊  ┊73┊        case ">": return context > num;
+┊  ┊74┊        case ">=": return context >= num;
+┊  ┊75┊        default: return context === num;
+┊  ┊76┊      }
+┊  ┊77┊  }
+┊  ┊78┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -8,6 +8,7 @@
 ┊ 8┊ 8┊    <script type="text/javascript" src="/libs/underscore.js"></script>
 ┊ 9┊ 9┊
 ┊10┊10┊    <!-- Scripts -->
+┊  ┊11┊    <script type="text/javascript" src="/scripts/utils.js"></script>
 ┊11┊12┊    <script type="text/javascript" src="/scripts/namespaces.js"></script>
 ┊12┊13┊    <script type="text/javascript" src="/scripts/engine/restorable.js"></script>
 ┊13┊14┊    <script type="text/javascript" src="/scripts/engine/font.js"></script>
```
[}]: #

Now we would like to start implementing the first class representation for a line, and for that we're requires to add a new module called `Geometry` to the `Engine` namespace:

[{]: <helper> (diff_step 5.2)
#### Step 5.2: Add 'Shapes' module to 'Engine' namespace

##### Changed resources/scripts/namespaces.js
```diff
@@ -3,5 +3,6 @@
 ┊3┊3┊};
 ┊4┊4┊
 ┊5┊5┊Engine = {
-┊6┊ ┊  Animations: {}
+┊ ┊6┊  Animations: {},
+┊ ┊7┊  Geometry: {}
 ┊7┊8┊};🚫↵
```
[}]: #

And now that we have this module available to use, we can go ahead and implement our first geometry shape class - `Line`:

[{]: <helper> (diff_step 5.3)
#### Step 5.3: Create 'Line' class

##### Added resources/scripts/engine/geometry/line.js
```diff
@@ -0,0 +1,65 @@
+┊  ┊ 1┊Engine.Geometry.Line = class Line {
+┊  ┊ 2┊  // x1 - The first point's x value
+┊  ┊ 3┊  // y1 - The first point's y value
+┊  ┊ 4┊  // x1 - The second point's x value
+┊  ┊ 5┊  // y2 - The second point's y value
+┊  ┊ 6┊  constructor(x1, y1, x2, y2) {
+┊  ┊ 7┊    this.x1 = Utils.trim(x1, 9);
+┊  ┊ 8┊    this.y1 = Utils.trim(y1, 9);
+┊  ┊ 9┊    this.x2 = Utils.trim(x2, 9);
+┊  ┊10┊    this.y2 = Utils.trim(y2, 9);
+┊  ┊11┊  }
+┊  ┊12┊
+┊  ┊13┊  // Draws the line on the given context
+┊  ┊14┊  draw(context) {
+┊  ┊15┊    context.moveTo(this.x1, this.y1);
+┊  ┊16┊    context.lineTo(this.x2, this.y2);
+┊  ┊17┊  }
+┊  ┊18┊
+┊  ┊19┊  // Gets the matching x value for a given y value
+┊  ┊20┊  getX(y) {
+┊  ┊21┊    let x = Utils.trim((((y - this.y1) * (this.x2 - this.x1)) / (this.y2 - this.y1)) + this.x1, 9);
+┊  ┊22┊    if (isNaN(x) || Utils.isBetween(x, this.x1, this.x2)) return x;
+┊  ┊23┊  }
+┊  ┊24┊
+┊  ┊25┊  // Gets the matching y value for a given x value
+┊  ┊26┊  getY(x) {
+┊  ┊27┊    let y = Utils.trim((((x - this.x1) * (this.y2 - this.y1)) / (this.x2 - this.x1)) + this.y1, 9);
+┊  ┊28┊    if (isNaN(y) || Utils.isBetween(y, this.y1, this.y2)) return y;
+┊  ┊29┊  }
+┊  ┊30┊
+┊  ┊31┊  // Returns if line has given point
+┊  ┊32┊  hasPoint(x, y) {
+┊  ┊33┊    if (!this.boundsHavePoint(x, y)) return false;
+┊  ┊34┊    let m = Utils.trim((this.y2 - this.y1) / (this.x2 - this.x1), 9);
+┊  ┊35┊    return (y - this.y1) / (x - this.x1) == m;
+┊  ┊36┊  }
+┊  ┊37┊
+┊  ┊38┊  // Returns if given point is contained by the bounds aka cage of line
+┊  ┊39┊  boundsHavePoint(x, y) {
+┊  ┊40┊    return Utils.isBetween(x, this.x1, this.x2) &&
+┊  ┊41┊           Utils.isBetween(y, this.y1, this.y2);
+┊  ┊42┊  }
+┊  ┊43┊
+┊  ┊44┊  getIntersection(shape) {
+┊  ┊45┊    if (shape instanceof Engine.Geometry.Line)
+┊  ┊46┊      return this.getLineIntersection(shape);
+┊  ┊47┊  }
+┊  ┊48┊
+┊  ┊49┊  // line - line intersection method
+┊  ┊50┊  getLineIntersection(line) {
+┊  ┊51┊    // Escape if lines are parallel
+┊  ┊52┊    if (!(((this.x1 - this.x2) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * (line.x1 - line.x2)))) return;
+┊  ┊53┊
+┊  ┊54┊    // Intersection point formula
+┊  ┊55┊    let x = Utils.trim(((((this.x1 * this.y2) - (this.y1 * this.x2)) * (line.x1 - line.x2)) - ((this.x1 - this.x2) * ((line.x1 * line.y2) - (line.y1 * line.x2)))) /
+┊  ┊56┊        (((this.x1 - this.x2) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * (line.x1 - line.x2))), 9);
+┊  ┊57┊    let y = Utils.trim(((((this.x1 * this.y2) - (this.y1 * this.x2)) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * ((line.x1 * line.y2) - (line.y1 * line.x2)))) /
+┊  ┊58┊        (((this.x1 - this.x2) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * (line.x1 - line.x2))), 9);
+┊  ┊59┊
+┊  ┊60┊    if (Utils.isBetween(x, this.x1, this.x2) && Utils.isBetween(x, line.x1, line.x2) &&
+┊  ┊61┊        Utils.isBetween(y, this.y1, this.y2) && Utils.isBetween(y, line.y1, line.y2)) {
+┊  ┊62┊      return { x, y };
+┊  ┊63┊    }
+┊  ┊64┊  }
+┊  ┊65┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -10,6 +10,7 @@
 ┊10┊10┊    <!-- Scripts -->
 ┊11┊11┊    <script type="text/javascript" src="/scripts/utils.js"></script>
 ┊12┊12┊    <script type="text/javascript" src="/scripts/namespaces.js"></script>
+┊  ┊13┊    <script type="text/javascript" src="/scripts/engine/geometry/line.js"></script>
 ┊13┊14┊    <script type="text/javascript" src="/scripts/engine/restorable.js"></script>
 ┊14┊15┊    <script type="text/javascript" src="/scripts/engine/font.js"></script>
 ┊15┊16┊    <script type="text/javascript" src="/scripts/engine/sprite.js"></script>
```
[}]: #

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

[{]: <helper> (diff_step 5.5)
#### Step 5.5: Create specs runner view

##### Added views/spec_runner.html
```diff
@@ -0,0 +1,27 @@
+┊  ┊ 1┊
+┊  ┊ 2┊<!DOCTYPE html>
+┊  ┊ 3┊<html>
+┊  ┊ 4┊  <head>
+┊  ┊ 5┊    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
+┊  ┊ 6┊    <title>Jasmine Spec Runner v2.0.1</title>
+┊  ┊ 7┊
+┊  ┊ 8┊    <!-- Jasmine -->
+┊  ┊ 9┊    <script type="text/javascript" src="libs/jasmine/jasmine.js"></script>
+┊  ┊10┊    <script type="text/javascript" src="libs/jasmine/jasmine-html.js"></script>
+┊  ┊11┊    <script type="text/javascript" src="libs/jasmine/boot.js"></script>
+┊  ┊12┊    <link rel="shortcut icon" type="image/png" href="libs/jasmine/jasmine_favicon.png">
+┊  ┊13┊    <link rel="stylesheet" type="text/css" href="libs/jasmine/jasmine.css">
+┊  ┊14┊
+┊  ┊15┊    <!-- Libs -->
+┊  ┊16┊    <script type="text/javascript" src="libs/underscore.js"></script>
+┊  ┊17┊
+┊  ┊18┊    <!-- Scripts -->
+┊  ┊19┊    <script type="text/javascript" src="scripts/utils.js"></script>
+┊  ┊20┊    <script type="text/javascript" src="scripts/namespaces.js"></script>
+┊  ┊21┊
+┊  ┊22┊    <!-- Specs -->
+┊  ┊23┊  </head>
+┊  ┊24┊
+┊  ┊25┊  <body>
+┊  ┊26┊  </body>
+┊  ┊27┊</html>🚫↵
```
[}]: #

Now once we'll navigate to the `/test` sub-route (`localhost:8000/test` by default) we should be provided with the spec runner. As for now there are no specs implemented at all, which brings us to the next stage - Implementing tests for `Line` class:

[{]: <helper> (diff_step 5.6)
#### Step 5.6: Create 'Line' class tests

##### Added resources/scripts/specs/engine/geometry/line.js
```diff
@@ -0,0 +1,78 @@
+┊  ┊ 1┊describe("Engine.Geometry.Line class", function() {
+┊  ┊ 2┊  beforeEach(function() {
+┊  ┊ 3┊    this.line = new Engine.Geometry.Line(-5, -5, 5, 5);
+┊  ┊ 4┊  });
+┊  ┊ 5┊
+┊  ┊ 6┊  describe("getX method", function() {
+┊  ┊ 7┊    describe("given inranged y", function() {
+┊  ┊ 8┊      it("returns x", function() {
+┊  ┊ 9┊        expect(this.line.getX(1)).toBeCloseTo(1);
+┊  ┊10┊      });
+┊  ┊11┊    });
+┊  ┊12┊
+┊  ┊13┊    describe("given outranged y", function() {
+┊  ┊14┊      it("returns nothing", function() {
+┊  ┊15┊        expect(this.line.getX(10)).toBeUndefined();
+┊  ┊16┊      });
+┊  ┊17┊    });
+┊  ┊18┊  });
+┊  ┊19┊
+┊  ┊20┊  describe("getY method", function() {
+┊  ┊21┊    describe("given inranged x", function() {
+┊  ┊22┊      it("returns y", function() {
+┊  ┊23┊        expect(this.line.getY(1)).toBeCloseTo(1);
+┊  ┊24┊      });
+┊  ┊25┊    });
+┊  ┊26┊
+┊  ┊27┊    describe("given outranged x", function() {
+┊  ┊28┊      it("returns nothing", function() {
+┊  ┊29┊        expect(this.line.getY(10)).toBeUndefined();
+┊  ┊30┊      });
+┊  ┊31┊    });
+┊  ┊32┊  });
+┊  ┊33┊
+┊  ┊34┊  describe("hasPoint method", function() {
+┊  ┊35┊    describe("given contained point", function() {
+┊  ┊36┊      it("returns true", function() {
+┊  ┊37┊        let x = 1;
+┊  ┊38┊        let y = 1;
+┊  ┊39┊        expect(this.line.hasPoint(x, y)).toBeTruthy();
+┊  ┊40┊      });
+┊  ┊41┊    });
+┊  ┊42┊
+┊  ┊43┊    describe("given uncontained point", function() {
+┊  ┊44┊      it("returns false", function() {
+┊  ┊45┊        let x = 10;
+┊  ┊46┊        let y = 10;
+┊  ┊47┊        expect(this.line.hasPoint(x, y)).toBeFalsy();
+┊  ┊48┊      });
+┊  ┊49┊    });
+┊  ┊50┊  });
+┊  ┊51┊
+┊  ┊52┊  describe("getLineIntersection method", function() {
+┊  ┊53┊    describe("given intersecting line", function() {
+┊  ┊54┊      it("returns intersection point", function() {
+┊  ┊55┊        let line = new Engine.Geometry.Line(1, -5, 1, 5);
+┊  ┊56┊
+┊  ┊57┊        expect(this.line.getLineIntersection(line)).toEqual({
+┊  ┊58┊          x: 1,
+┊  ┊59┊          y: 1
+┊  ┊60┊        });
+┊  ┊61┊      });
+┊  ┊62┊    });
+┊  ┊63┊
+┊  ┊64┊    describe("given parallel line", function() {
+┊  ┊65┊      it("returns nothing", function() {
+┊  ┊66┊        let line = new Engine.Geometry.Line(-5, -6, 5, 4);
+┊  ┊67┊        expect(this.line.getLineIntersection(line)).toBeUndefined();
+┊  ┊68┊      });
+┊  ┊69┊    });
+┊  ┊70┊
+┊  ┊71┊    describe("given outranged line", function() {
+┊  ┊72┊      it("returns nothing", function() {
+┊  ┊73┊        let line = new Engine.Geometry.Line(10, 10, 10, 15);
+┊  ┊74┊        expect(this.line.getLineIntersection(line)).toBeUndefined();
+┊  ┊75┊      });
+┊  ┊76┊    });
+┊  ┊77┊  });
+┊  ┊78┊});🚫↵
```

##### Changed views/spec_runner.html
```diff
@@ -18,8 +18,10 @@
 ┊18┊18┊    <!-- Scripts -->
 ┊19┊19┊    <script type="text/javascript" src="scripts/utils.js"></script>
 ┊20┊20┊    <script type="text/javascript" src="scripts/namespaces.js"></script>
+┊  ┊21┊    <script type="text/javascript" src="scripts/engine/geometry/line.js"></script>
 ┊21┊22┊
 ┊22┊23┊    <!-- Specs -->
+┊  ┊24┊    <script type="text/javascript" src="scripts/specs/engine/geometry/line.js"></script>
 ┊23┊25┊  </head>
 ┊24┊26┊
 ┊25┊27┊  <body>
```
[}]: #

Now if you'll refresh the spec runner page you should be able to a green screen indicating all tests have passed (Assuming the tutorial is updated and you followed it correctly). As introduced at the beginning of the step, the snake is also dependent on circles, whose representing class should look like so:

[{]: <helper> (diff_step 5.7)
#### Step 5.7: Create 'Circle' class

##### Added resources/scripts/engine/geometry/circle.js
```diff
@@ -0,0 +1,167 @@
+┊   ┊  1┊Engine.Geometry.Circle = class Circle {
+┊   ┊  2┊  // x - The x value of the circle's center
+┊   ┊  3┊  // y - The y value of the circle's center
+┊   ┊  4┊  // r - The radius of the center
+┊   ┊  5┊  // rad1 - The first radian of the circle, not necessarily its beginning
+┊   ┊  6┊  // rad2 - The second radian of the circle, not necessarily its beginning
+┊   ┊  7┊  constructor(x, y, r, rad1, rad2) {
+┊   ┊  8┊    this.x = Utils.trim(x, 9);
+┊   ┊  9┊    this.y = Utils.trim(y, 9);
+┊   ┊ 10┊    this.r = Utils.trim(r, 9);
+┊   ┊ 11┊
+┊   ┊ 12┊    // Trimming mode is done based on which radian represents the ending and which radian
+┊   ┊ 13┊    // represents the ending
+┊   ┊ 14┊    if (rad1 > rad2) {
+┊   ┊ 15┊      this.rad1 = Utils.trim(rad1, 9, "floor");
+┊   ┊ 16┊      this.rad2 = Utils.trim(rad2, 9, "ceil");
+┊   ┊ 17┊    }
+┊   ┊ 18┊    else {
+┊   ┊ 19┊      this.rad1 = Utils.trim(rad1, 9, "ceil");
+┊   ┊ 20┊      this.rad2 = Utils.trim(rad2, 9, "floor");
+┊   ┊ 21┊    }
+┊   ┊ 22┊  }
+┊   ┊ 23┊
+┊   ┊ 24┊  // Draws the circle on the given context
+┊   ┊ 25┊  draw(context) {
+┊   ┊ 26┊    context.arc(this.x, this.y, this.r, this.rad1, this.rad2);
+┊   ┊ 27┊  }
+┊   ┊ 28┊
+┊   ┊ 29┊  // Gets the matching x value for the given radian
+┊   ┊ 30┊  getX(rad) {
+┊   ┊ 31┊    if (!Utils(rad).trim(9).isBetween(this.rad1, this.rad2).value()) return;
+┊   ┊ 32┊    return Utils.trim((this.r * Math.cos(rad)) + this.x, 9);
+┊   ┊ 33┊  }
+┊   ┊ 34┊
+┊   ┊ 35┊  // Gets the matching y value for the given radian
+┊   ┊ 36┊  getY(rad) {
+┊   ┊ 37┊    if (!Utils(rad).trim(9).isBetween(this.rad1, this.rad2).value()) return;
+┊   ┊ 38┊    return Utils.trim((this.r * Math.sin(rad)) + this.y, 9);
+┊   ┊ 39┊  }
+┊   ┊ 40┊
+┊   ┊ 41┊  // Gets the matching point for the given radian
+┊   ┊ 42┊  getPoint(rad) {
+┊   ┊ 43┊    if (!Utils.isBetween(rad, this.rad1, this.rad2)) return;
+┊   ┊ 44┊
+┊   ┊ 45┊    return {
+┊   ┊ 46┊      x: Utils.trim((this.r * Math.cos(rad)) + this.x, 9),
+┊   ┊ 47┊      y: Utils.trim((this.r * Math.sin(rad)) + this.y, 9)
+┊   ┊ 48┊    };
+┊   ┊ 49┊  }
+┊   ┊ 50┊
+┊   ┊ 51┊  // Gets the matching radian for the given point
+┊   ┊ 52┊  getRad(x, y) {
+┊   ┊ 53┊    let rad = Math.atan2(y - this.y, x - this.x);
+┊   ┊ 54┊
+┊   ┊ 55┊    // If calculated radian is in circle's radian range, return it
+┊   ┊ 56┊    if (rad != null && Utils.isBetween(rad, this.rad1, this.rad2)) {
+┊   ┊ 57┊      return rad;
+┊   ┊ 58┊    }
+┊   ┊ 59┊
+┊   ┊ 60┊    // The calculated radian can still be in the circle's radian range in case one
+┊   ┊ 61┊    // of the radians is greater than 2 PIEs
+┊   ┊ 62┊    if (Math.abs(this.rad1) > Math.abs(this.rad2)) {
+┊   ┊ 63┊      var greatestRad = this.rad1;
+┊   ┊ 64┊    }
+┊   ┊ 65┊    else {
+┊   ┊ 66┊      var greatestRad = this.rad2;
+┊   ┊ 67┊    }
+┊   ┊ 68┊
+┊   ┊ 69┊    // Check if the absolute radian is in the circle's radian range
+┊   ┊ 70┊    if (Utils(rad + (2 * Math.PI * Math.floor(greatestRad / (2 * Math.PI)))).trim(9).isBetween(this.rad1, this.rad2).value() ||
+┊   ┊ 71┊        Utils(rad + (2 * Math.PI * Math.ceil(greatestRad / (2 * Math.PI)))).trim(9).isBetween(this.rad1, this.rad2).value()) {
+┊   ┊ 72┊      return rad;
+┊   ┊ 73┊    }
+┊   ┊ 74┊  }
+┊   ┊ 75┊
+┊   ┊ 76┊  // Returns if circle has given points
+┊   ┊ 77┊  hasPoint(x, y) {
+┊   ┊ 78┊    return this.getRad(x, y) != null;
+┊   ┊ 79┊  }
+┊   ┊ 80┊
+┊   ┊ 81┊  getIntersection(shape) {
+┊   ┊ 82┊    if (shape instanceof Engine.Geometry.Line)
+┊   ┊ 83┊      return this.getLineIntersection(shape);
+┊   ┊ 84┊    if (shape instanceof Engine.Geometry.Circle)
+┊   ┊ 85┊      return this.getCircleIntersection(shape);
+┊   ┊ 86┊  }
+┊   ┊ 87┊
+┊   ┊ 88┊  // circle - circle intersection method
+┊   ┊ 89┊  getCircleIntersection(circle) {
+┊   ┊ 90┊    let dx = circle.x - this.x;
+┊   ┊ 91┊    let dy = circle.y - this.y;
+┊   ┊ 92┊    let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
+┊   ┊ 93┊
+┊   ┊ 94┊    if (d > this.r + circle.r ||
+┊   ┊ 95┊       d < Math.abs(this.r - circle.r)) {
+┊   ┊ 96┊      return;
+┊   ┊ 97┊    }
+┊   ┊ 98┊
+┊   ┊ 99┊    let a = ((Math.pow(this.r, 2) - Math.pow(circle.r, 2)) + Math.pow(d, 2)) / (2 * d);
+┊   ┊100┊    let x = this.x + ((dx * a) / d);
+┊   ┊101┊    let y = this.y + ((dy * a) / d);
+┊   ┊102┊    let h = Math.sqrt(Math.pow(this.r, 2) - Math.pow(a, 2));
+┊   ┊103┊    let rx = (- dy * h) / d;
+┊   ┊104┊    let ry = (dx * h) / d;
+┊   ┊105┊
+┊   ┊106┊    let interPoints = [
+┊   ┊107┊      {
+┊   ┊108┊        x: x + rx,
+┊   ┊109┊        y: y + ry
+┊   ┊110┊      },
+┊   ┊111┊      {
+┊   ┊112┊        x: x - rx,
+┊   ┊113┊        y: y - ry
+┊   ┊114┊      }
+┊   ┊115┊    ]
+┊   ┊116┊    .map(point => ({
+┊   ┊117┊        x: Utils.trim(point.x, 9),
+┊   ┊118┊        y: Utils.trim(point.y, 9)
+┊   ┊119┊     }));
+┊   ┊120┊
+┊   ┊121┊    interPoints = _.uniq(interPoints, point => `(${point.x}, ${point.y})`);
+┊   ┊122┊
+┊   ┊123┊    [this, circle].forEach(function(circle) {
+┊   ┊124┊      interPoints = interPoints.filter(point => circle.hasPoint(point.x, point.y));
+┊   ┊125┊    });
+┊   ┊126┊
+┊   ┊127┊    if (interPoints.length > 0) return interPoints;
+┊   ┊128┊  }
+┊   ┊129┊
+┊   ┊130┊  // circle - line intersection method
+┊   ┊131┊  getLineIntersection(line) {
+┊   ┊132┊    let x1 = line.x1 - this.x;
+┊   ┊133┊    let x2 = line.x2 - this.x;
+┊   ┊134┊    let y1 = line.y1 - this.y;
+┊   ┊135┊    let y2 = line.y2 - this.y;
+┊   ┊136┊    let dx = x2 - x1;
+┊   ┊137┊    let dy = y2 - y1;
+┊   ┊138┊    let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
+┊   ┊139┊    let h = (x1 * y2) - (x2 * y1);
+┊   ┊140┊    let delta = (Math.pow(this.r, 2) * Math.pow(d, 2)) - Math.pow(h, 2);
+┊   ┊141┊
+┊   ┊142┊    if (delta < 0) return;
+┊   ┊143┊
+┊   ┊144┊    let interPoints = [
+┊   ┊145┊      {
+┊   ┊146┊        x: (((h * dy) + (((dy / Math.abs(dy)) || 1) * dx * Math.sqrt(delta))) / Math.pow(d, 2)) + this.x,
+┊   ┊147┊        y: (((-h * dx) + (Math.abs(dy) * Math.sqrt(delta))) / Math.pow(d, 2)) + this.y
+┊   ┊148┊      },
+┊   ┊149┊      {
+┊   ┊150┊        x: (((h * dy) - (((dy / Math.abs(dy)) || 1) * dx * Math.sqrt(delta))) / Math.pow(d, 2)) + this.x,
+┊   ┊151┊        y: (((-h * dx) - (Math.abs(dy) * Math.sqrt(delta))) / Math.pow(d, 2)) + this.y
+┊   ┊152┊      }
+┊   ┊153┊    ]
+┊   ┊154┊    .map(point => ({
+┊   ┊155┊        x: Utils.trim(point.x, 9),
+┊   ┊156┊        y: Utils.trim(point.y, 9)
+┊   ┊157┊    }))
+┊   ┊158┊    .filter(point => {
+┊   ┊159┊      return this.hasPoint(point.x, point.y) &&
+┊   ┊160┊        line.boundsHavePoint(point.x, point.y);
+┊   ┊161┊    });
+┊   ┊162┊
+┊   ┊163┊    interPoints = _.uniq(interPoints, point => `(${point.x}, ${point.y})`);
+┊   ┊164┊
+┊   ┊165┊    if (interPoints.length > 0) return interPoints;
+┊   ┊166┊  }
+┊   ┊167┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -11,6 +11,7 @@
 ┊11┊11┊    <script type="text/javascript" src="/scripts/utils.js"></script>
 ┊12┊12┊    <script type="text/javascript" src="/scripts/namespaces.js"></script>
 ┊13┊13┊    <script type="text/javascript" src="/scripts/engine/geometry/line.js"></script>
+┊  ┊14┊    <script type="text/javascript" src="/scripts/engine/geometry/circle.js"></script>
 ┊14┊15┊    <script type="text/javascript" src="/scripts/engine/restorable.js"></script>
 ┊15┊16┊    <script type="text/javascript" src="/scripts/engine/font.js"></script>
 ┊16┊17┊    <script type="text/javascript" src="/scripts/engine/sprite.js"></script>
```
[}]: #

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

[{]: <helper> (diff_step 5.8)
#### Step 5.8: Delegate circle intersection methods

##### Changed resources/scripts/engine/geometry/line.js
```diff
@@ -44,6 +44,8 @@
 ┊44┊44┊  getIntersection(shape) {
 ┊45┊45┊    if (shape instanceof Engine.Geometry.Line)
 ┊46┊46┊      return this.getLineIntersection(shape);
+┊  ┊47┊    if (shape instanceof Engine.Geometry.Circle)
+┊  ┊48┊      return this.getCircleIntersection(shape);
 ┊47┊49┊  }
 ┊48┊50┊
 ┊49┊51┊  // line - line intersection method
```
```diff
@@ -62,4 +64,9 @@
 ┊62┊64┊      return { x, y };
 ┊63┊65┊    }
 ┊64┊66┊  }
+┊  ┊67┊
+┊  ┊68┊  // line - circle intersection method
+┊  ┊69┊  getCircleIntersection(circle) {
+┊  ┊70┊    return circle.getLineIntersection(this);
+┊  ┊71┊  }
 ┊65┊72┊};🚫↵
```
[}]: #

Then again a newly created geometry shape class should be tested against different scenarios:

[{]: <helper> (diff_step 5.9)
#### Step 5.9: Create 'Circle' class tests

##### Added resources/scripts/specs/engine/geometry/circle.js
```diff
@@ -0,0 +1,144 @@
+┊   ┊  1┊describe("Engine.Geometry.Circle class", function() {
+┊   ┊  2┊  beforeEach(function() {
+┊   ┊  3┊    this.circle = new Engine.Geometry.Circle(1, 1, 5, 0, 1.5 * Math.PI);
+┊   ┊  4┊  });
+┊   ┊  5┊
+┊   ┊  6┊  describe("getX method", function() {
+┊   ┊  7┊    describe("given inranged rad", function() {
+┊   ┊  8┊      it("returns x", function() {
+┊   ┊  9┊        expect(this.circle.getX(0 * Math.PI)).toBeCloseTo(6);
+┊   ┊ 10┊        expect(this.circle.getX(0.5 * Math.PI)).toBeCloseTo(1);
+┊   ┊ 11┊        expect(this.circle.getX(1 * Math.PI)).toBeCloseTo(-4);
+┊   ┊ 12┊        expect(this.circle.getX(1.5 * Math.PI)).toBeCloseTo(1);
+┊   ┊ 13┊      });
+┊   ┊ 14┊    });
+┊   ┊ 15┊
+┊   ┊ 16┊    describe("given outranged rad", function() {
+┊   ┊ 17┊      it("returns nothing", function() {
+┊   ┊ 18┊        expect(this.circle.getX(2 * Math.PI)).toBeUndefined();
+┊   ┊ 19┊      });
+┊   ┊ 20┊    });
+┊   ┊ 21┊  });
+┊   ┊ 22┊
+┊   ┊ 23┊  describe("getY method", function() {
+┊   ┊ 24┊    describe("given inranged rad", function() {
+┊   ┊ 25┊      it("returns y", function() {
+┊   ┊ 26┊        expect(this.circle.getY(0 * Math.PI)).toBeCloseTo(1);
+┊   ┊ 27┊        expect(this.circle.getY(0.5 * Math.PI)).toBeCloseTo(6);
+┊   ┊ 28┊        expect(this.circle.getY(1 * Math.PI)).toBeCloseTo(1);
+┊   ┊ 29┊        expect(this.circle.getY(1.5 * Math.PI)).toBeCloseTo(-4);
+┊   ┊ 30┊      });
+┊   ┊ 31┊    });
+┊   ┊ 32┊
+┊   ┊ 33┊    describe("given outranged rad", function() {
+┊   ┊ 34┊      it("returns nothing", function() {
+┊   ┊ 35┊        expect(this.circle.getY(2 * Math.PI)).toBeUndefined();
+┊   ┊ 36┊      });
+┊   ┊ 37┊    });
+┊   ┊ 38┊  });
+┊   ┊ 39┊
+┊   ┊ 40┊  describe("getRad method", function() {
+┊   ┊ 41┊    describe("given inranged point", function() {
+┊   ┊ 42┊      it("returns rad", function() {
+┊   ┊ 43┊        let x = -3.0450849718747346;
+┊   ┊ 44┊        let y = 3.9389262614623686;
+┊   ┊ 45┊        expect(this.circle.getRad(x, y)).toBeCloseTo(0.8 * Math.PI);
+┊   ┊ 46┊      });
+┊   ┊ 47┊    });
+┊   ┊ 48┊
+┊   ┊ 49┊    describe("given outranged point", function() {
+┊   ┊ 50┊      it("returns nothing", function() {
+┊   ┊ 51┊        let x = 5.045084971874736;
+┊   ┊ 52┊        let y = -1.9389262614623664;
+┊   ┊ 53┊        expect(this.circle.getRad(x, y)).toBeUndefined();
+┊   ┊ 54┊      });
+┊   ┊ 55┊    });
+┊   ┊ 56┊  });
+┊   ┊ 57┊
+┊   ┊ 58┊  describe("getCircleIntersection method", function() {
+┊   ┊ 59┊    describe("given circle with 2 intersection points", function() {
+┊   ┊ 60┊      it("returns array with intersection points", function() {
+┊   ┊ 61┊        let circle = new Engine.Geometry.Circle(-5, 1, 5, 0, 2 * Math.PI);
+┊   ┊ 62┊
+┊   ┊ 63┊        expect(this.circle.getCircleIntersection(circle)).toEqual([
+┊   ┊ 64┊          { x: -2, y: -3 },
+┊   ┊ 65┊          { x: -2, y: 5 }
+┊   ┊ 66┊        ]);
+┊   ┊ 67┊      });
+┊   ┊ 68┊    });
+┊   ┊ 69┊
+┊   ┊ 70┊    describe("given circle with 1 intersection points", function() {
+┊   ┊ 71┊      it("returns array with intersection point", function() {
+┊   ┊ 72┊        let circle = new Engine.Geometry.Circle(-5, 1, 5, 0, 1 * Math.PI);
+┊   ┊ 73┊
+┊   ┊ 74┊        expect(this.circle.getCircleIntersection(circle)).toEqual([
+┊   ┊ 75┊          { x: -2, y: 5 }
+┊   ┊ 76┊        ]);
+┊   ┊ 77┊      });
+┊   ┊ 78┊    });
+┊   ┊ 79┊
+┊   ┊ 80┊    describe("given kissing circle", function() {
+┊   ┊ 81┊      it("returns array with intersection point", function() {
+┊   ┊ 82┊        let circle = new Engine.Geometry.Circle(-9, 1, 5, 0, 2 * Math.PI);
+┊   ┊ 83┊
+┊   ┊ 84┊        expect(this.circle.getCircleIntersection(circle)).toEqual([
+┊   ┊ 85┊          { x: -4, y: 1 }
+┊   ┊ 86┊        ]);
+┊   ┊ 87┊      });
+┊   ┊ 88┊    });
+┊   ┊ 89┊
+┊   ┊ 90┊    describe("given outer circle", function() {
+┊   ┊ 91┊      it("returns nothing", function() {
+┊   ┊ 92┊        let circle = new Engine.Geometry.Circle(10, 10, 2, 0, 2 * Math.PI);
+┊   ┊ 93┊        expect(this.circle.getCircleIntersection(circle)).toBeUndefined();
+┊   ┊ 94┊      });
+┊   ┊ 95┊    });
+┊   ┊ 96┊
+┊   ┊ 97┊    describe("given inner circle", function() {
+┊   ┊ 98┊      it("nothing", function() {
+┊   ┊ 99┊        let circle = new Engine.Geometry.Circle(1, 1, 2, 0, 2 * Math.PI);
+┊   ┊100┊        expect(this.circle.getCircleIntersection(circle)).toBeUndefined();
+┊   ┊101┊      });
+┊   ┊102┊    });
+┊   ┊103┊  });
+┊   ┊104┊
+┊   ┊105┊  describe("getLineIntersection method", function() {
+┊   ┊106┊    describe("given line with 2 intersection points", function() {
+┊   ┊107┊      it("returns array with intersection points", function() {
+┊   ┊108┊        let line = new Engine.Geometry.Line(-10, 1, 10, 1);
+┊   ┊109┊
+┊   ┊110┊        expect(this.circle.getLineIntersection(line)).toEqual([
+┊   ┊111┊          { x: 6, y: 1 },
+┊   ┊112┊          { x: -4, y: 1 }
+┊   ┊113┊        ]);
+┊   ┊114┊      });
+┊   ┊115┊    });
+┊   ┊116┊
+┊   ┊117┊    describe("given line with 1 intersection point", function() {
+┊   ┊118┊      it("returns array with intersection point", function() {
+┊   ┊119┊        let line = new Engine.Geometry.Line(-10, 1, 1, 1);
+┊   ┊120┊
+┊   ┊121┊        expect(this.circle.getLineIntersection(line)).toEqual([
+┊   ┊122┊          { x: -4, y: 1 }
+┊   ┊123┊        ]);
+┊   ┊124┊      });
+┊   ┊125┊    });
+┊   ┊126┊
+┊   ┊127┊    describe("given kissing line", function() {
+┊   ┊128┊      it("returns array with intersection point", function() {
+┊   ┊129┊        let line = new Engine.Geometry.Line(-10, 6, 10, 6);
+┊   ┊130┊
+┊   ┊131┊        expect(this.circle.getLineIntersection(line)).toEqual([
+┊   ┊132┊          { x: 1, y: 6 }
+┊   ┊133┊        ]);
+┊   ┊134┊      });
+┊   ┊135┊    });
+┊   ┊136┊
+┊   ┊137┊    describe("given outranged line", function() {
+┊   ┊138┊      it("returns nothing", function() {
+┊   ┊139┊        let line = new Engine.Geometry.Line(-10, 10, 10, 10);
+┊   ┊140┊        expect(this.circle.getLineIntersection(line)).toBeUndefined();
+┊   ┊141┊      });
+┊   ┊142┊    });
+┊   ┊143┊  });
+┊   ┊144┊});🚫↵
```

##### Changed views/spec_runner.html
```diff
@@ -19,9 +19,11 @@
 ┊19┊19┊    <script type="text/javascript" src="scripts/utils.js"></script>
 ┊20┊20┊    <script type="text/javascript" src="scripts/namespaces.js"></script>
 ┊21┊21┊    <script type="text/javascript" src="scripts/engine/geometry/line.js"></script>
+┊  ┊22┊    <script type="text/javascript" src="scripts/engine/geometry/circle.js"></script>
 ┊22┊23┊
 ┊23┊24┊    <!-- Specs -->
 ┊24┊25┊    <script type="text/javascript" src="scripts/specs/engine/geometry/line.js"></script>
+┊  ┊26┊    <script type="text/javascript" src="scripts/specs/engine/geometry/circle.js"></script>
 ┊25┊27┊  </head>
 ┊26┊28┊
 ┊27┊29┊  <body>
```
[}]: #

Our final shape in the geometry module would be a polygon. Why a polygon? Since I'm planning to make the snake's movement circular, which means that once the snake hits a random boundary, he will reappear from the other side of the canvas. The collision detection between the snake and the canvas would be done using a polygon - which is simply made out of 4 lines:

[{]: <helper> (diff_step 5.10)
#### Step 5.10: Create 'Polygon' class

##### Added resources/scripts/engine/geometry/polygon.js
```diff
@@ -0,0 +1,58 @@
+┊  ┊ 1┊Engine.Geometry.Polygon = class Polygon {
+┊  ┊ 2┊  // bounds - an array of arrays. Each sub-array represents the arguments vector which
+┊  ┊ 3┊  // will be invoked by the line's construction method
+┊  ┊ 4┊  constructor(...bounds) {
+┊  ┊ 5┊    this.bounds = bounds.map(coords => new Engine.Geometry.Line(...coords));
+┊  ┊ 6┊  }
+┊  ┊ 7┊
+┊  ┊ 8┊  // Returns if polygon has given point
+┊  ┊ 9┊  hasPoint(x, y) {
+┊  ┊10┊    // Run check for each bound
+┊  ┊11┊    return this.bounds.some(bound => bound.hasPoint(x, y));
+┊  ┊12┊  }
+┊  ┊13┊
+┊  ┊14┊  getIntersection(shape) {
+┊  ┊15┊    if (shape instanceof Engine.Geometry.Line)
+┊  ┊16┊      return this.getLineIntersection(shape);
+┊  ┊17┊    if (shape instanceof Engine.Geometry.Circle)
+┊  ┊18┊      return this.getCircleIntersection(shape);
+┊  ┊19┊    if (shape instanceof Engine.Geometry.Polygon)
+┊  ┊20┊      return this.getPolygonIntersection(shape);
+┊  ┊21┊  }
+┊  ┊22┊
+┊  ┊23┊  // polygon - line intersection method
+┊  ┊24┊  getLineIntersection(line) {
+┊  ┊25┊    // line - line intersection for each bound
+┊  ┊26┊    let result = this.bounds.reduce((result, bound) => {
+┊  ┊27┊      let intersection = line.getLineIntersection(bound);
+┊  ┊28┊      if (intersection) result = result.concat(intersection);
+┊  ┊29┊      return result;
+┊  ┊30┊    }, []);
+┊  ┊31┊
+┊  ┊32┊    if (result.length) return result;
+┊  ┊33┊  }
+┊  ┊34┊
+┊  ┊35┊  // polygon - circle intersection method
+┊  ┊36┊  getCircleIntersection(circle) {
+┊  ┊37┊    // line - circle intersection for each bound
+┊  ┊38┊    let result = this.bounds.reduce((result, bound) => {
+┊  ┊39┊      let intersection = circle.getLineIntersection(bound);
+┊  ┊40┊      if (intersection) result = result.concat(intersection);
+┊  ┊41┊      return result;
+┊  ┊42┊    }, []);
+┊  ┊43┊
+┊  ┊44┊    if (result.length) return result;
+┊  ┊45┊  }
+┊  ┊46┊
+┊  ┊47┊  // polygon - polygon intersection method
+┊  ┊48┊  getPolygonIntersection(polygon) {
+┊  ┊49┊    // line - polygon intersection for each bound
+┊  ┊50┊    let result = this.bounds.reduce((result, bound) => {
+┊  ┊51┊      let intersection = polygon.getLineIntersection(bound);
+┊  ┊52┊      if (intersection) result = result.concat(intersection);
+┊  ┊53┊      return result;
+┊  ┊54┊    }, []);
+┊  ┊55┊
+┊  ┊56┊    if (result.length) return result;
+┊  ┊57┊  }
+┊  ┊58┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -12,6 +12,7 @@
 ┊12┊12┊    <script type="text/javascript" src="/scripts/namespaces.js"></script>
 ┊13┊13┊    <script type="text/javascript" src="/scripts/engine/geometry/line.js"></script>
 ┊14┊14┊    <script type="text/javascript" src="/scripts/engine/geometry/circle.js"></script>
+┊  ┊15┊    <script type="text/javascript" src="/scripts/engine/geometry/polygon.js"></script>
 ┊15┊16┊    <script type="text/javascript" src="/scripts/engine/restorable.js"></script>
 ┊16┊17┊    <script type="text/javascript" src="/scripts/engine/font.js"></script>
 ┊17┊18┊    <script type="text/javascript" src="/scripts/engine/sprite.js"></script>
```
[}]: #

Again we will delegate the newly created intersection methods in the `Line` class and `Circle` class:

[{]: <helper> (diff_step 5.11)
#### Step 5.11: Delegate polygon intersection methods

##### Changed resources/scripts/engine/geometry/circle.js
```diff
@@ -83,6 +83,8 @@
 ┊83┊83┊      return this.getLineIntersection(shape);
 ┊84┊84┊    if (shape instanceof Engine.Geometry.Circle)
 ┊85┊85┊      return this.getCircleIntersection(shape);
+┊  ┊86┊    if (shape instanceof Engine.Geometry.Polygon)
+┊  ┊87┊      return this.getPolygonIntersection(shape);
 ┊86┊88┊  }
 ┊87┊89┊
 ┊88┊90┊  // circle - circle intersection method
```
```diff
@@ -164,4 +166,9 @@
 ┊164┊166┊
 ┊165┊167┊    if (interPoints.length > 0) return interPoints;
 ┊166┊168┊  }
+┊   ┊169┊
+┊   ┊170┊  // circle - polygon intersection method
+┊   ┊171┊  getPolygonIntersection(polygon) {
+┊   ┊172┊    return polygon.getCircleIntersection(this);
+┊   ┊173┊  }
 ┊167┊174┊};🚫↵
```

##### Changed resources/scripts/engine/geometry/line.js
```diff
@@ -46,6 +46,8 @@
 ┊46┊46┊      return this.getLineIntersection(shape);
 ┊47┊47┊    if (shape instanceof Engine.Geometry.Circle)
 ┊48┊48┊      return this.getCircleIntersection(shape);
+┊  ┊49┊    if (shape instanceof Engine.Geometry.Polygon)
+┊  ┊50┊      return this.getPolygonIntersection(shape);
 ┊49┊51┊  }
 ┊50┊52┊
 ┊51┊53┊  // line - line intersection method
```
```diff
@@ -69,4 +71,9 @@
 ┊69┊71┊  getCircleIntersection(circle) {
 ┊70┊72┊    return circle.getLineIntersection(this);
 ┊71┊73┊  }
+┊  ┊74┊
+┊  ┊75┊  // line - polygon intersection method
+┊  ┊76┊  getPolygonIntersection(polygon) {
+┊  ┊77┊    return polygon.getLineIntersection(this);
+┊  ┊78┊  }
 ┊72┊79┊};🚫↵
```
[}]: #

Now we will create a some tests to make sure our newly created polygon works properly:

[{]: <helper> (diff_step 5.12)
#### Step 5.12: Create 'Polygon' class tests

##### Added resources/scripts/specs/engine/geometry/polygon.js
```diff
@@ -0,0 +1,96 @@
+┊  ┊ 1┊describe("Engine.Geometry.Polygon class", function() {
+┊  ┊ 2┊  beforeEach(function() {
+┊  ┊ 3┊    this.polygon = new Engine.Geometry.Polygon(
+┊  ┊ 4┊      [0, 0, 5, 0],
+┊  ┊ 5┊      [5, 0, 5, 5],
+┊  ┊ 6┊      [5, 5, 0, 5],
+┊  ┊ 7┊      [0, 5, 0, 0]
+┊  ┊ 8┊    );
+┊  ┊ 9┊  });
+┊  ┊10┊
+┊  ┊11┊  describe("hasPoint method", function() {
+┊  ┊12┊    describe("given contained point", function() {
+┊  ┊13┊      it("returns true", function() {
+┊  ┊14┊        let x = 5;
+┊  ┊15┊        let y = 3;
+┊  ┊16┊        expect(this.polygon.hasPoint(x, y)).toBeTruthy();
+┊  ┊17┊      });
+┊  ┊18┊    });
+┊  ┊19┊
+┊  ┊20┊    describe("given outranged point", function() {
+┊  ┊21┊      it("returns false", function() {
+┊  ┊22┊        let x = 10;
+┊  ┊23┊        let y = 10;
+┊  ┊24┊        expect(this.polygon.hasPoint(x, y)).toBeFalsy();
+┊  ┊25┊      });
+┊  ┊26┊    });
+┊  ┊27┊  });
+┊  ┊28┊
+┊  ┊29┊  describe("getLineIntersection method", function() {
+┊  ┊30┊    describe("given intersecting line", function() {
+┊  ┊31┊      it("returns intersection point", function() {
+┊  ┊32┊        let line = new Engine.Geometry.Line(0, 1, 5, 4);
+┊  ┊33┊
+┊  ┊34┊        expect(this.polygon.getLineIntersection(line)).toEqual([
+┊  ┊35┊          { x: 5, y: 4 },
+┊  ┊36┊          { x: -0, y: 1 }
+┊  ┊37┊        ]);
+┊  ┊38┊      });
+┊  ┊39┊    });
+┊  ┊40┊
+┊  ┊41┊    describe("given outranged line", function() {
+┊  ┊42┊      it("returns nothing", function() {
+┊  ┊43┊        let line = new Engine.Geometry.Line(10, 11, 15, 14);
+┊  ┊44┊
+┊  ┊45┊        expect(this.polygon.getLineIntersection(line)).toBeUndefined();
+┊  ┊46┊      });
+┊  ┊47┊    });
+┊  ┊48┊  });
+┊  ┊49┊
+┊  ┊50┊  describe("getCircleIntersection method", function() {
+┊  ┊51┊    describe("given circle with 2 intersection points", function() {
+┊  ┊52┊      it("returns array with intersection points", function() {
+┊  ┊53┊        let circle = new Engine.Geometry.Circle(0, 0, 2, 0, 2 * Math.PI);
+┊  ┊54┊
+┊  ┊55┊        expect(this.polygon.getCircleIntersection(circle)).toEqual([
+┊  ┊56┊          { x: 2, y: 0 },
+┊  ┊57┊          { x: 0, y: 2 }
+┊  ┊58┊        ]);
+┊  ┊59┊      });
+┊  ┊60┊    });
+┊  ┊61┊
+┊  ┊62┊    describe("given circle with 1 intersection points", function() {
+┊  ┊63┊      it("returns array with intersection point", function() {
+┊  ┊64┊        let circle = new Engine.Geometry.Circle(0, 0, 2, 0, 0.25 * Math.PI);
+┊  ┊65┊
+┊  ┊66┊        expect(this.polygon.getCircleIntersection(circle)).toEqual([
+┊  ┊67┊          { x: 2, y: 0 }
+┊  ┊68┊        ]);
+┊  ┊69┊      });
+┊  ┊70┊    });
+┊  ┊71┊
+┊  ┊72┊    describe("given kissing circle", function() {
+┊  ┊73┊      it("returns array with intersection point", function() {
+┊  ┊74┊        let circle = new Engine.Geometry.Circle(-3, 3, 3, 0, 2 * Math.PI);
+┊  ┊75┊
+┊  ┊76┊        expect(this.polygon.getCircleIntersection(circle)).toEqual([
+┊  ┊77┊          { x: 0, y: 3 }
+┊  ┊78┊        ]);
+┊  ┊79┊      });
+┊  ┊80┊    });
+┊  ┊81┊
+┊  ┊82┊    describe("given outer circle", function() {
+┊  ┊83┊      it("returns nothing", function() {
+┊  ┊84┊        let circle = new Engine.Geometry.Circle(10, 10, 2, 0, 2 * Math.PI);
+┊  ┊85┊        expect(this.polygon.getCircleIntersection(circle)).toBeUndefined();
+┊  ┊86┊      });
+┊  ┊87┊    });
+┊  ┊88┊
+┊  ┊89┊    describe("given inner circle", function() {
+┊  ┊90┊      it("nothing", function() {
+┊  ┊91┊        let circle = new Engine.Geometry.Circle(2.5, 2.5, 2, 0, 2 * Math.PI);
+┊  ┊92┊        expect(this.polygon.getCircleIntersection(circle)).toBeUndefined();
+┊  ┊93┊      });
+┊  ┊94┊    });
+┊  ┊95┊  });
+┊  ┊96┊});🚫↵
```

##### Changed views/spec_runner.html
```diff
@@ -20,10 +20,12 @@
 ┊20┊20┊    <script type="text/javascript" src="scripts/namespaces.js"></script>
 ┊21┊21┊    <script type="text/javascript" src="scripts/engine/geometry/line.js"></script>
 ┊22┊22┊    <script type="text/javascript" src="scripts/engine/geometry/circle.js"></script>
+┊  ┊23┊    <script type="text/javascript" src="scripts/engine/geometry/polygon.js"></script>
 ┊23┊24┊
 ┊24┊25┊    <!-- Specs -->
 ┊25┊26┊    <script type="text/javascript" src="scripts/specs/engine/geometry/line.js"></script>
 ┊26┊27┊    <script type="text/javascript" src="scripts/specs/engine/geometry/circle.js"></script>
+┊  ┊28┊    <script type="text/javascript" src="scripts/specs/engine/geometry/polygon.js"></script>
 ┊27┊29┊  </head>
 ┊28┊30┊
 ┊29┊31┊  <body>
```
[}]: #

At last, all the necessary geometry shapes are implemented and ready to use. We will now focus on the snake itself. Since our game can potentially have infinite number of entities, not necessarily just a snake, we will add the a new module under the `Game` namespace called `Entities`:

[{]: <helper> (diff_step 5.13)
#### Step 5.13: Add 'Entities' module to 'Game' namespace

##### Changed resources/scripts/namespaces.js
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊Game = {
+┊ ┊2┊  Entities: {},
 ┊2┊3┊  Screens: {}
 ┊3┊4┊};
```
[}]: #

And now we can add the `Snake` class:

[{]: <helper> (diff_step 5.14)
#### Step 5.14: Create 'Snake' class

##### Added resources/scripts/game/entities/snake.js
```diff
@@ -0,0 +1,234 @@
+┊   ┊  1┊Game.Entities.Snake = class Snake {
+┊   ┊  2┊  // Represents a snake data-structure which will eventually appear on screen.
+┊   ┊  3┊  // All the properties provided to the constructor are the initial values of
+┊   ┊  4┊  // the snake
+┊   ┊  5┊  constructor(x, y, r, rad, v, color, keyStates, options) {
+┊   ┊  6┊    this.x = x;
+┊   ┊  7┊    this.y = y;
+┊   ┊  8┊    this.r = r;
+┊   ┊  9┊    this.rad = rad;
+┊   ┊ 10┊    this.v = v;
+┊   ┊ 11┊    this.color = color;
+┊   ┊ 12┊    this.keyStates = keyStates;
+┊   ┊ 13┊    // A snake is made out of many geometry shapes
+┊   ┊ 14┊    this.shapes = [];
+┊   ┊ 15┊    // A snake starts with a line
+┊   ┊ 16┊    this.currentShape = new Engine.Geometry.Line(x, y, x, y);
+┊   ┊ 17┊    this.shapes.push(this.currentShape);
+┊   ┊ 18┊    // A score can be provided in case we want to reserve previous scores from
+┊   ┊ 19┊    // recent matches
+┊   ┊ 20┊    this.score = options.score || 0;
+┊   ┊ 21┊
+┊   ┊ 22┊    // Custom keys can be specified
+┊   ┊ 23┊    if (options.keys && options.keys) {
+┊   ┊ 24┊      this.leftKey = options.keys.left;
+┊   ┊ 25┊      this.rightKey = options.keys.right;
+┊   ┊ 26┊    }
+┊   ┊ 27┊    // Left and right arrow keys will be used by default
+┊   ┊ 28┊    else {
+┊   ┊ 29┊      this.leftKey = 37; // Left arrow
+┊   ┊ 30┊      this.rightKey = 39; // Right arrow
+┊   ┊ 31┊    }
+┊   ┊ 32┊  }
+┊   ┊ 33┊
+┊   ┊ 34┊  draw(context) {
+┊   ┊ 35┊    // Draw all shapes in the shapes array
+┊   ┊ 36┊    this.shapes.forEach(shape => {
+┊   ┊ 37┊      context.save();
+┊   ┊ 38┊      context.strokeStyle = this.color;
+┊   ┊ 39┊      context.lineWidth = 3;
+┊   ┊ 40┊      context.beginPath();
+┊   ┊ 41┊
+┊   ┊ 42┊      // Each shape has its own unique drawing method
+┊   ┊ 43┊      shape.draw(context);
+┊   ┊ 44┊
+┊   ┊ 45┊      context.stroke();
+┊   ┊ 46┊      context.restore();
+┊   ┊ 47┊    });
+┊   ┊ 48┊  }
+┊   ┊ 49┊
+┊   ┊ 50┊  update(span, width, height) {
+┊   ┊ 51┊    // Progress made based on elapsed time and velocity
+┊   ┊ 52┊    let step = (this.v * span) / 1000;
+┊   ┊ 53┊
+┊   ┊ 54┊    this.updateShapes(step, width, height);
+┊   ┊ 55┊    this.cycleThrough(step, width, height);
+┊   ┊ 56┊  }
+┊   ┊ 57┊
+┊   ┊ 58┊  // Updates shapes array based on progress made
+┊   ┊ 59┊  updateShapes(step, width, height, options = {}) {
+┊   ┊ 60┊    this.updateCurrentShape(step, options);
+┊   ┊ 61┊    this.updateDirection(step, options);
+┊   ┊ 62┊  }
+┊   ┊ 63┊
+┊   ┊ 64┊  // Updates current shape
+┊   ┊ 65┊  updateCurrentShape(step, options) {
+┊   ┊ 66┊    if (this.currentShape instanceof Engine.Geometry.Line)
+┊   ┊ 67┊      return this.updateCurrentLine(options);
+┊   ┊ 68┊    if (this.currentShape instanceof Engine.Geometry.Circle)
+┊   ┊ 69┊      return this.updateCurrentCircle(options);
+┊   ┊ 70┊  }
+┊   ┊ 71┊
+┊   ┊ 72┊  // Updates current shape in case it is a line
+┊   ┊ 73┊  updateCurrentLine(options) {
+┊   ┊ 74┊    let lastX = options.lastX || this.x;
+┊   ┊ 75┊    let lastY = options.lastY || this.y;
+┊   ┊ 76┊    this.x = options.x || this.currentShape.x2;
+┊   ┊ 77┊    this.y = options.y || this.currentShape.y2;
+┊   ┊ 78┊    this.lastBit = new Engine.Geometry.Line(lastX, lastY, this.x, this.y);
+┊   ┊ 79┊  }
+┊   ┊ 80┊
+┊   ┊ 81┊  // Updates current shape in case it is a circle
+┊   ┊ 82┊  updateCurrentCircle(options) {
+┊   ┊ 83┊    let lastX = options.lastX || this.currentShape.x;
+┊   ┊ 84┊    let lastY = options.lastY || this.currentShape.y;
+┊   ┊ 85┊    let lastR = options.lastR || this.currentShape.r;
+┊   ┊ 86┊
+┊   ┊ 87┊    // Update logic for left rotation
+┊   ┊ 88┊    if (this.direction == "left") {
+┊   ┊ 89┊      let lastRad = this.rad + (0.5 * Math.PI);
+┊   ┊ 90┊      let currentShapePoint = this.currentShape.getPoint(this.currentShape.rad1);
+┊   ┊ 91┊      this.x = options.x || currentShapePoint.x;
+┊   ┊ 92┊      this.y = options.y || currentShapePoint.y;
+┊   ┊ 93┊      this.rad = this.currentShape.rad1 - (0.5 * Math.PI);
+┊   ┊ 94┊      this.lastBit = new Engine.Geometry.Circle(lastX, lastY, lastR, this.currentShape.rad1, lastRad);
+┊   ┊ 95┊    }
+┊   ┊ 96┊    // Update logic for right rotation
+┊   ┊ 97┊    else {
+┊   ┊ 98┊      let lastRad = this.rad - (0.5 * Math.PI);
+┊   ┊ 99┊      let currentShapePoint = this.currentShape.getPoint(this.currentShape.rad2);
+┊   ┊100┊      this.x = options.x || currentShapePoint.x;
+┊   ┊101┊      this.y = options.y || currentShapePoint.y;
+┊   ┊102┊      this.rad = this.currentShape.rad2 + (0.5 * Math.PI);
+┊   ┊103┊      this.lastBit = new Engine.Geometry.Circle(lastX, lastY, lastR, lastRad, this.currentShape.rad2);
+┊   ┊104┊    }
+┊   ┊105┊  }
+┊   ┊106┊
+┊   ┊107┊  updateDirection(step, options) {
+┊   ┊108┊    // Update the direction based on pressed key
+┊   ┊109┊    if (this.keyStates.get(this.leftKey))
+┊   ┊110┊      var direction = "left";
+┊   ┊111┊    else if (this.keyStates.get(this.rightKey))
+┊   ┊112┊      var direction = "right";
+┊   ┊113┊
+┊   ┊114┊    this.changeDirection(step, direction, options);
+┊   ┊115┊    this.continueDirection(step, direction, options);
+┊   ┊116┊  }
+┊   ┊117┊
+┊   ┊118┊  // Change the recent shape type according to the given direction
+┊   ┊119┊  changeDirection(step, direction, options) {
+┊   ┊120┊    // If there is no change in direction, abort, unless we force it
+┊   ┊121┊    if (direction == this.direction && !options.force) return;
+┊   ┊122┊
+┊   ┊123┊    this.direction = direction;
+┊   ┊124┊
+┊   ┊125┊    // This will push a new shape with new properties, based on the direction
+┊   ┊126┊    switch (direction) {
+┊   ┊127┊      case "left":
+┊   ┊128┊        var angle = this.rad - (0.5 * Math.PI);
+┊   ┊129┊        var rad = this.rad + (0.5 * Math.PI);
+┊   ┊130┊        var x = this.x + (this.r * Math.cos(angle));
+┊   ┊131┊        var y = this.y + (this.r * Math.sin(angle));
+┊   ┊132┊        this.currentShape = new Engine.Geometry.Circle(x, y, this.r, rad, rad);
+┊   ┊133┊        break;
+┊   ┊134┊      case "right":
+┊   ┊135┊        angle = this.rad + (0.5 * Math.PI);
+┊   ┊136┊        rad = this.rad - (0.5 * Math.PI);
+┊   ┊137┊        x = this.x + (this.r * Math.cos(angle));
+┊   ┊138┊        y = this.y + (this.r * Math.sin(angle));
+┊   ┊139┊        this.currentShape = new Engine.Geometry.Circle(x, y, this.r, rad, rad);
+┊   ┊140┊        break;
+┊   ┊141┊      default:
+┊   ┊142┊        this.currentShape = new Engine.Geometry.Line(this.x, this.y, this.x, this.y);
+┊   ┊143┊    }
+┊   ┊144┊
+┊   ┊145┊    this.shapes.push(this.currentShape);
+┊   ┊146┊  }
+┊   ┊147┊
+┊   ┊148┊  // Extend the recent shape based on progress made
+┊   ┊149┊  continueDirection(step, direction) {
+┊   ┊150┊    switch (direction) {
+┊   ┊151┊      case "left":
+┊   ┊152┊        this.currentShape.rad1 -= step / this.r;
+┊   ┊153┊        break;
+┊   ┊154┊      case "right":
+┊   ┊155┊        this.currentShape.rad2 += step / this.r;
+┊   ┊156┊        break;
+┊   ┊157┊      default:
+┊   ┊158┊        this.currentShape.x2 += step * Math.cos(this.rad);
+┊   ┊159┊        this.currentShape.y2 += step * Math.sin(this.rad);
+┊   ┊160┊    }
+┊   ┊161┊  }
+┊   ┊162┊
+┊   ┊163┊  // Handles case where snake is out limits and we need to render it from
+┊   ┊164┊  // the other side of the canvas
+┊   ┊165┊  cycleThrough(step, width, height) {
+┊   ┊166┊    let intersectionPoint = this.getCanvasIntersection(width, height);
+┊   ┊167┊
+┊   ┊168┊    if (!intersectionPoint) return;
+┊   ┊169┊
+┊   ┊170┊    intersectionPoint = intersectionPoint[0];
+┊   ┊171┊
+┊   ┊172┊    // Re-calculate position based on canvas bounds
+┊   ┊173┊    if (intersectionPoint.x % width == 0)
+┊   ┊174┊      this.x = Utils.mod(this.x - width, width);
+┊   ┊175┊    if (intersectionPoint.y % height == 0)
+┊   ┊176┊      this.y = Utils.mod(this.y - height, height);
+┊   ┊177┊
+┊   ┊178┊    // Update shapes again based on custom properties
+┊   ┊179┊    this.updateShapes(step, width, height, {
+┊   ┊180┊      force: true,
+┊   ┊181┊      lastX: this.x,
+┊   ┊182┊      lastY: this.y,
+┊   ┊183┊      x: this.x,
+┊   ┊184┊      y: this.y
+┊   ┊185┊    });
+┊   ┊186┊  }
+┊   ┊187┊
+┊   ┊188┊  // Gets intersection points between last bit and own shapes
+┊   ┊189┊  getSelfIntersection() {
+┊   ┊190┊    if (this.currentShape instanceof Engine.Geometry.Circle &&
+┊   ┊191┊       Math.abs(this.currentShape.rad1 - this.currentShape.rad2) >= 2 * Math.PI) {
+┊   ┊192┊      if (this.direction == "left")
+┊   ┊193┊        var rad = this.currentShape.rad1;
+┊   ┊194┊      else
+┊   ┊195┊        var rad = this.currentShape.rad2;
+┊   ┊196┊
+┊   ┊197┊      return this.currentShape.getPoint(rad);
+┊   ┊198┊    }
+┊   ┊199┊
+┊   ┊200┊    let result;
+┊   ┊201┊
+┊   ┊202┊    this.shapes.slice(0, -2).some(shape =>
+┊   ┊203┊      result = this.lastBit.getIntersection(shape)
+┊   ┊204┊    );
+┊   ┊205┊
+┊   ┊206┊    return result;
+┊   ┊207┊  }
+┊   ┊208┊
+┊   ┊209┊  // Returns intersection points between snakes
+┊   ┊210┊  getSnakeIntersection(snake) {
+┊   ┊211┊    let result;
+┊   ┊212┊
+┊   ┊213┊    snake.shapes.some(shape =>
+┊   ┊214┊      // Only last bit is relevant, if we reached this point it means that
+┊   ┊215┊      // previous intersection will definitely fail
+┊   ┊216┊      result = this.lastBit.getIntersection(shape)
+┊   ┊217┊    );
+┊   ┊218┊
+┊   ┊219┊    return result;
+┊   ┊220┊  }
+┊   ┊221┊
+┊   ┊222┊  // Returns intersection points between snake and canvas
+┊   ┊223┊  getCanvasIntersection(width, height) {
+┊   ┊224┊    // Canvas polygon
+┊   ┊225┊    let canvasPolygon = new Engine.Geometry.Polygon(
+┊   ┊226┊      [0, 0, width, 0],
+┊   ┊227┊      [width, 0, width, height],
+┊   ┊228┊      [width, height, 0, height],
+┊   ┊229┊      [0, height, 0, 0]
+┊   ┊230┊    );
+┊   ┊231┊
+┊   ┊232┊    return canvasPolygon.getIntersection(this.lastBit);
+┊   ┊233┊  }
+┊   ┊234┊};🚫↵
```

##### Changed views/game.html
```diff
@@ -22,6 +22,7 @@
 ┊22┊22┊    <script type="text/javascript" src="/scripts/engine/screen.js"></script>
 ┊23┊23┊    <script type="text/javascript" src="/scripts/engine/assets_loader.js"></script>
 ┊24┊24┊    <script type="text/javascript" src="/scripts/engine/game.js"></script>
+┊  ┊25┊    <script type="text/javascript" src="/scripts/game/entities/snake.js"></script>
 ┊25┊26┊    <script type="text/javascript" src="/scripts/game/screens/menu/index.js"></script>
 ┊26┊27┊    <script type="text/javascript" src="/scripts/game/screens/splash/index.js"></script>
 ┊27┊28┊    <script type="text/javascript" src="/scripts/main.js"></script>
```
[}]: #

This class is titled with most complexity out of everything we did so far in this step. You can follow the code accompanied by comments regard it, but I'd also like to explain the key concepts. As said earlier, the `Snake` is simply made out of shapes; In this case - lines and circles.

The `draw` method just goes through this array and draws whatever shape it's currently looping through. Regardless of its type, every shape is provided with a `draw` method of its own, all shapes share the same interface, therefore we can just draw them regularly and the snake should be drawn automatically.

The `update` method updates the last bit only according to its type, the time elapsed and the speed of the snake. For example, the last bit of the snake is a line, and 5 seconds have passed at a speed of 5 meters per second, our line should be extended by 5 meters long. Same principle applies to circle extension only based on radians. The last bit's type might be changed according to the current input; e.g. if the `right` key is held the last bit would turn into a circle, and once released it would turn into a straight line.

Note that besides shapes extension, collision detection should also be made. The embedded is the collision detection between the snake and the canvas, which means that any time the snake collides with the canvas's boundaries the last bit should be redrawn from the opposite side of the canvas. In addition, we've implemented intersection methods for self collision detection and collision detection between rivals, which should be used externally by the hosting screen.

In the next step we will be implementing the game screen where we will make use of the `Snake` class we've just created, and see how it works in action.
[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step4.md) | [Next Step >](step6.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #