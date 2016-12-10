[{]: <region> (header)
# Step 7: Bonus! Re-implementing geometry in C++
[}]: #
[{]: <region> (body)
> This step is part of a bigger tutorial series where we learn how to create a game engine and implement a Tron-style game in JavaScript. The base project for the following step is available [here](https://github.com/DAB0mB/radial-snake/tree/step6).

So far I covered up pretty much everything I planned. I showed you how to create a game engine, including a font generator, an animation player and a screening system. On top of that, we've learned how to structure and organize our code well, so if in the future we'd like to extend our game by adding more screens or capabilities, we can do that with ease. Indeed, we've went through lots of great stuff, and if you've reached this point I give you my thumbs up. If so far this wasn't enough, in this step we will be focusing on optimization, and making our game engine run faster (a lot, faster). Obviously, when talking about optimizations, the first thing you would probably think of is how we can make our algorithms efficient by using minimum number of operations. While this is true, we will be actually focusing on optimizing our code using C++.

Unlike JavaScript, which is a dynamic scripting file executed by an interpreter, C++ is a general purpose language which compiles into executables. Naturally, executables are much faster than scripts, since they don't have to be interpreted, and they can approach the hardware and memory much faster. In C++, we have to explicitly define our data-types, meaning that variables don't have to be parsed during run-time. While explicit variables definition is C++'s biggest drawback, it's also one of its biggest advantages. The mere fact that variables can be handled much faster, makes code much more efficient.

Accordingly, we can conclude that the programming language we're using plays a very important role when it comes to efficiency. So how exactly are we going to integrate C++ into the browser? We're going to do that by using a compiler called - [Emscripten](http://kripken.github.io/emscripten-site/).

![emscripten](https://cloud.githubusercontent.com/assets/7648874/22675449/ee6d7e9c-eccc-11e6-9570-1dd5d982ee66.png)

Emscripten is an Open Source [LLVM](https://en.wikipedia.org/wiki/LLVM) to JavaScript compiler. Using Emscripten you can:

- Compile C and C++ code into JavaScript
- Compile any other code that can be translated into LLVM bitcode into JavaScript.
- Compile the C/C++ runtimes of other languages into JavaScript, and then run code in those other languages in an indirect way (this has been done for Python and Lua)!

LLVM is a library that is used to construct, optimize and produce intermediate and/or binary machine code. LLVM can be used as a compiler framework, where you provide the "front end" (parser and lexer) and the "back end" (code that converts LLVM's representation to actual machine code). LLVM can also act as a JIT compiler - it has support for x86/x86_64 and PPC/PPC64 assembly generation with fast code optimizations aimed for compilation speed.

Emscripten operates by taking LLVM code and converting it into a subset of JavaScript called asm.js that can run anywhere that JavaScript can run (usually the browser, but also Node.js, etc.) and is easy for browsers to optimize. This means that you can basically write web applications in any language that has an LLVM compiler.

![emscripten-flow](https://cloud.githubusercontent.com/assets/7648874/22675751/b244b76c-ecce-11e6-917e-f7039ed4b340.png)

In order to use Emscripten you will first have to install it. I recommend you to follow Emscripten's official installation instructions at their website over [here](https://kripken.github.io/emscripten-site/docs/getting_started/downloads.html). Installing Emscripten might be a bit tiring for some, I know for me it was, but if you're hyped about writing native code in the browser as much as I do, take as much time as needed to install it, and bare with me.

Assuming that you have Emscripten installed, we can get right to business. The goal for this step is to re-implement our geometry namespace in C++, and to be more specific, the circle class and line class. We will start by creating an entry file for our C++ code under the path `resources/cpp/src/index.cpp`:

    $ mkdir resources/cpp
    $ mkdir resources/cpp/src
    $ touch resources/cpp/src/index.cpp

From now on, every C++ file that we would like to run in the browser should be included in the `index.cpp` file we've just created, otherwise it's not going to appear anywhere. The first stage for re-implementing our geometry would be re-writing the utility module, since our geometry is heavily based on it; Therefore the firs inclusion in our `index.cpp` file would be the following:

[{]: <helper> (diff_step 7.1)
#### Step 7.1: Add CPP entry script

##### Added resources/cpp/src/index.cpp
```diff
@@ -0,0 +1 @@
+┊ ┊1┊#include "utils.cpp"🚫↵
```
[}]: #

Following that, we will create the `utils.cpp` module included above, which is a direct translation from C++ to JavaScript for the `utils.js` we've created earlier in this tutorial.

[{]: <helper> (diff_step 7.2)
#### Step 7.2: Add base utility CPP module

##### Added resources/cpp/src/utils.cpp
```diff
@@ -0,0 +1,73 @@
+┊  ┊ 1┊#include <cfloat>
+┊  ┊ 2┊#include <cmath>
+┊  ┊ 3┊#include <string>
+┊  ┊ 4┊#include "utils.h"
+┊  ┊ 5┊
+┊  ┊ 6┊namespace utils {
+┊  ┊ 7┊  // Fixed modulo method which can calculate modulo of negative numbers properly
+┊  ┊ 8┊  // e.g. (-803).mod(800) returns 797
+┊  ┊ 9┊  double mod(double context, double num) {
+┊  ┊10┊    return std::fmod((std::fmod(context, num) + num), num);
+┊  ┊11┊  }
+┊  ┊12┊
+┊  ┊13┊  // Trims number and leaves the number of decimals specified.
+┊  ┊14┊  // The "mode" argument specifies which math function should be invoked
+┊  ┊15┊  // right after the number has been trimmed.
+┊  ┊16┊  // e.g. 12.12345.trim(3, "ceil") returns 12.124
+┊  ┊17┊  double trim(double context, int decimals, const std::string mode) {
+┊  ┊18┊    double accumulator = context * std::pow(10, decimals);
+┊  ┊19┊
+┊  ┊20┊    if (mode.compare("ceil") == 0)
+┊  ┊21┊      accumulator = std::ceil(accumulator);
+┊  ┊22┊    else if (mode.compare("floor") == 0)
+┊  ┊23┊      accumulator = std::floor(accumulator);
+┊  ┊24┊    else
+┊  ┊25┊      accumulator = std::round(accumulator);
+┊  ┊26┊
+┊  ┊27┊    return accumulator / std::pow(10, decimals);
+┊  ┊28┊  }
+┊  ┊29┊
+┊  ┊30┊  // Tells if number is in specified range based on given precision.
+┊  ┊31┊  // See the "compare" method for more information about precision
+┊  ┊32┊  bool isBetween(double context, double num1, double num2, const std::string precision) {
+┊  ┊33┊    return compare(context, std::min(num1, num2), ">=", precision) &&
+┊  ┊34┊           compare(context, std::max(num1, num2), "<=", precision);
+┊  ┊35┊  }
+┊  ┊36┊
+┊  ┊37┊  bool compare(double context, double num, const std::string precision) {
+┊  ┊38┊    return compare(context, num, "==", precision);
+┊  ┊39┊  }
+┊  ┊40┊
+┊  ┊41┊  // Initiates comparison operator between context number and a given number, only here
+┊  ┊42┊  // a precision can be specified
+┊  ┊43┊  bool compare(double context, double num, const std::string method, const std::string precision) {
+┊  ┊44┊    // Fixed precision, "almost equal" with a deviation of ε
+┊  ┊45┊    if (precision.compare("f") == 0) {
+┊  ┊46┊      if (method.compare("<") == 0 ||
+┊  ┊47┊          method.compare("<=") == 0)
+┊  ┊48┊        return context <= num + DBL_EPSILON;
+┊  ┊49┊      if (method.compare(">") == 0 ||
+┊  ┊50┊          method.compare(">=") == 0)
+┊  ┊51┊        return context >= num - DBL_EPSILON;
+┊  ┊52┊      return std::abs(context - num) <= DBL_EPSILON;
+┊  ┊53┊    }
+┊  ┊54┊    // Pixel precision, round comparison
+┊  ┊55┊    else if (precision.compare("px") == 0) {
+┊  ┊56┊      if (method.compare("<") == 0 ||
+┊  ┊57┊          method.compare("<=") == 0)
+┊  ┊58┊        return std::round(context) <= std::round(num);
+┊  ┊59┊      if (method.compare(">") == 0 ||
+┊  ┊60┊          method.compare(">=") == 0)
+┊  ┊61┊        return std::round(context) >= std::round(num);
+┊  ┊62┊      return std::round(context) == std::round(num);
+┊  ┊63┊    }
+┊  ┊64┊    // Exact precision
+┊  ┊65┊    else {
+┊  ┊66┊      if (method.compare("<") == 0) return context < num;
+┊  ┊67┊      if (method.compare("<=") == 0) return context <= num;
+┊  ┊68┊      if (method.compare(">") == 0) return context > num;
+┊  ┊69┊      if (method.compare(">=") == 0) return context >= num;
+┊  ┊70┊      return context == num;
+┊  ┊71┊    }
+┊  ┊72┊  }
+┊  ┊73┊}🚫↵
```

##### Added resources/cpp/src/utils.h
```diff
@@ -0,0 +1,15 @@
+┊  ┊ 1┊#pragma once
+┊  ┊ 2┊
+┊  ┊ 3┊#include <string>
+┊  ┊ 4┊
+┊  ┊ 5┊namespace utils {
+┊  ┊ 6┊  double mod(double context, double num);
+┊  ┊ 7┊
+┊  ┊ 8┊  double trim(double context, int decimals, const std::string mode = "round");
+┊  ┊ 9┊
+┊  ┊10┊  bool isBetween(double context, double num1, double num2, const std::string precision = "exact");
+┊  ┊11┊
+┊  ┊12┊  bool compare(double context, double num, const std::string precision = "exact");
+┊  ┊13┊
+┊  ┊14┊  bool compare(double context, double num, const std::string method, const std::string precision);
+┊  ┊15┊}🚫↵
```
[}]: #

The module above should work by itself when interacting with it inside the C++ scope, but that's not what we're striving for. We want this module to be available for use in our JavaScript project. This requires us to wrap our code in such a way the the Emscripten compiler will know how to compile it. Apart from providing a compiler, Emscripten provides us with functions and macros that will help use bind our C++ code to the JavaScript environment. These functionalities are packed in a single library which can be imported in our C++ code, and it is called [Embind](https://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/embind.html) (probably stands for "Emscripten bind"). Using EMBind, let's wrap our utils module accordingly:

[{]: <helper> (diff_step 7.3)
#### Step 7.3: EMBind CPP utils

##### Changed resources/cpp/src/utils.cpp
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊#include <cfloat>
 ┊2┊2┊#include <cmath>
 ┊3┊3┊#include <string>
+┊ ┊4┊#include <emscripten/bind.h>
 ┊4┊5┊#include "utils.h"
 ┊5┊6┊
 ┊6┊7┊namespace utils {
```
```diff
@@ -70,4 +71,15 @@
 ┊70┊71┊      return context == num;
 ┊71┊72┊    }
 ┊72┊73┊  }
+┊  ┊74┊}
+┊  ┊75┊
+┊  ┊76┊EMSCRIPTEN_BINDINGS(utils_module) {
+┊  ┊77┊  emscripten::function("utils_mod", &utils::mod);
+┊  ┊78┊  emscripten::function("utils_trim", &utils::trim);
+┊  ┊79┊  emscripten::function("utils_isBetween", &utils::isBetween);
+┊  ┊80┊  emscripten::function("utils_compare",
+┊  ┊81┊    emscripten::select_overload<bool(double, double, const std::string, const std::string)>(
+┊  ┊82┊      &utils::compare
+┊  ┊83┊    )
+┊  ┊84┊  );
 ┊73┊85┊}🚫↵
```
[}]: #

After a while you'll get used for Embind's API. If you'll look at it, it's self explanatory and easy to understand. Bound objects will be available the JavaScript environment will be available under an object named `Module`, e.g. the C++ method `mod` will be available for use as `Module.utils_mod`. Bound functions should have supported return types and argument types, meaning that if we're using a custom structure as a return type or an argument type, we first need to wrap it using EMBind, otherwise the compiler won't know how to handle it. A list of natively supported data-types can be found [here](https://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/embind.html#built-in-type-conversions).

Even though we've wrapped our C++ code and hypothetically it can already be used in the browser, I'd go for a second wrapper, since the compiled code doesn't have the optimal architecture. Right now we will have to approach C++ utility functions using `Module.utils_foo`. Instead, I'd like it to be `CPP.Utils.foo`, since it's clearer this way. The output of the Emscripten compiler can be wrapped with JavaScript code, using a prefix and a suffix, defined in 2 separate files respectively, called `pre.js` and `post.js`:

[{]: <helper> (diff_step 7.4)
#### Step 7.4: Create CPP wrappers

##### Added resources/cpp/post.js
```diff
@@ -0,0 +1,10 @@
+┊  ┊ 1┊return {
+┊  ┊ 2┊  Utils: {
+┊  ┊ 3┊    mod: Module.utils_mod,
+┊  ┊ 4┊    trim: Module.utils_trim,
+┊  ┊ 5┊    isBetween: Module.utils_isBetween,
+┊  ┊ 6┊    compare: Module.utils_compare
+┊  ┊ 7┊  }
+┊  ┊ 8┊};
+┊  ┊ 9┊
+┊  ┊10┊})();🚫↵
```

##### Added resources/cpp/pre.js
```diff
@@ -0,0 +1 @@
+┊ ┊1┊CPP = (function() {🚫↵
```
[}]: #

What we've done in the code snippet above, we've created an anonymous function which calls itself, and inside we've exported a new namespace called `CPP` (C++). This way we can keep the generated code encapsulated, without worrying about spamming the global object.

After creating a wrapper, I'd also recommend you to integrate the generated C++ code into existing namespaces, meaning that if for example we would like to approach the `CPP.Utils.foo` method, it could be done using `Utils.foo`. This way existing code won't have to be changed, and extra wrapping logic can be applied with ease, like the chaining logic implemented in the `Utils` namespace:

[{]: <helper> (diff_step 7.5)
#### Step 7.5: Bind CPP utils to JS utils

##### Changed resources/scripts/utils.js
```diff
@@ -16,53 +16,9 @@
 ┊16┊16┊  return chain;
 ┊17┊17┊};
 ┊18┊18┊
-┊19┊  ┊// Fixed modulo method which can calculate modulo of negative numbers properly
-┊20┊  ┊// e.g. (-803).mod(800) returns 797
-┊21┊  ┊Utils.mod = function (context, num) {
-┊22┊  ┊  return ((context % num) + num) % num;
-┊23┊  ┊};
-┊24┊  ┊
-┊25┊  ┊// Trims number and leaves the number of decimals specified.
-┊26┊  ┊// The "mode" argument specifies which math function should be invoked
-┊27┊  ┊// right after the number has been trimmed.
-┊28┊  ┊// e.g. 12.12345.trim(3, "ceil") returns 12.124
-┊29┊  ┊Utils.trim = function (context, decimals, mode = "round") {
-┊30┊  ┊  return Math[mode](context * Math.pow(10, decimals)) / Math.pow(10, decimals);
-┊31┊  ┊};
-┊32┊  ┊
-┊33┊  ┊// Tells if number is in specified range based on given precision.
-┊34┊  ┊// See the "compare" method for more information about precision
-┊35┊  ┊Utils.isBetween = function (context, num1, num2, precision) {
-┊36┊  ┊  return Utils.compare(context, Math.min(num1, num2), ">=", precision) &&
-┊37┊  ┊         Utils.compare(context, Math.max(num1, num2), "<=", precision);
-┊38┊  ┊};
-┊39┊  ┊
-┊40┊  ┊// Initiates comparison operator between context number and a given number, only here
-┊41┊  ┊// a precision can be specified
-┊42┊  ┊Utils.compare = function (context, num, method, precision = method) {
-┊43┊  ┊  switch (precision) {
-┊44┊  ┊    // Fixed precision, "almost equal" with a deviation of ε
-┊45┊  ┊    case "f":
-┊46┊  ┊      switch (method) {
-┊47┊  ┊        case "<": case "<=": return context <= num + Number.EPSILON;
-┊48┊  ┊        case ">": case ">=": return context >= num - Number.EPSILON;
-┊49┊  ┊        default: return Math.abs(context - num) <= Number.EPSILON;
-┊50┊  ┊      }
-┊51┊  ┊    // Pixel precision, round comparison
-┊52┊  ┊    case "px":
-┊53┊  ┊      switch (method) {
-┊54┊  ┊        case "<": case "<=": return Math.round(context) <= Math.round(num);
-┊55┊  ┊        case ">": case ">=": return Math.round(context) >= Math.round(num);
-┊56┊  ┊        default: return Math.round(context) == Math.round(num);
-┊57┊  ┊      }
-┊58┊  ┊    // Exact precision
-┊59┊  ┊    default:
-┊60┊  ┊      switch (method) {
-┊61┊  ┊        case "<": return context < num;
-┊62┊  ┊        case "<=": return context <= num;
-┊63┊  ┊        case ">": return context > num;
-┊64┊  ┊        case ">=": return context >= num;
-┊65┊  ┊        default: return context === num;
-┊66┊  ┊      }
+┊  ┊19┊Object.assign(Utils, CPP.Utils, {
+┊  ┊20┊  // Overload handling
+┊  ┊21┊  compare(context, num, method, precision = method) {
+┊  ┊22┊    return CPP.Utils.compare(context, num, method, precision);
 ┊67┊23┊  }
-┊68┊  ┊};🚫↵
+┊  ┊24┊});🚫↵
```
[}]: #

Whenever launching the compiler, the generated code should be outputted somewhere. I've decided to go with the path `resources/scripts/cpp.bundle.js`, but it doesn't matter how the file is gonna be called, as long as it's defined under the `scripts` dir, otherwise we won't be able to load it. Also, we need to make sure that we set a git-ignore rule for the generated file, since there's no reason for us to upload it to the git-host if we're planning on compiling it:

[{]: <helper> (diff_step 7.5)
#### Step 7.5: Bind CPP utils to JS utils

##### Changed resources/scripts/utils.js
```diff
@@ -16,53 +16,9 @@
 ┊16┊16┊  return chain;
 ┊17┊17┊};
 ┊18┊18┊
-┊19┊  ┊// Fixed modulo method which can calculate modulo of negative numbers properly
-┊20┊  ┊// e.g. (-803).mod(800) returns 797
-┊21┊  ┊Utils.mod = function (context, num) {
-┊22┊  ┊  return ((context % num) + num) % num;
-┊23┊  ┊};
-┊24┊  ┊
-┊25┊  ┊// Trims number and leaves the number of decimals specified.
-┊26┊  ┊// The "mode" argument specifies which math function should be invoked
-┊27┊  ┊// right after the number has been trimmed.
-┊28┊  ┊// e.g. 12.12345.trim(3, "ceil") returns 12.124
-┊29┊  ┊Utils.trim = function (context, decimals, mode = "round") {
-┊30┊  ┊  return Math[mode](context * Math.pow(10, decimals)) / Math.pow(10, decimals);
-┊31┊  ┊};
-┊32┊  ┊
-┊33┊  ┊// Tells if number is in specified range based on given precision.
-┊34┊  ┊// See the "compare" method for more information about precision
-┊35┊  ┊Utils.isBetween = function (context, num1, num2, precision) {
-┊36┊  ┊  return Utils.compare(context, Math.min(num1, num2), ">=", precision) &&
-┊37┊  ┊         Utils.compare(context, Math.max(num1, num2), "<=", precision);
-┊38┊  ┊};
-┊39┊  ┊
-┊40┊  ┊// Initiates comparison operator between context number and a given number, only here
-┊41┊  ┊// a precision can be specified
-┊42┊  ┊Utils.compare = function (context, num, method, precision = method) {
-┊43┊  ┊  switch (precision) {
-┊44┊  ┊    // Fixed precision, "almost equal" with a deviation of ε
-┊45┊  ┊    case "f":
-┊46┊  ┊      switch (method) {
-┊47┊  ┊        case "<": case "<=": return context <= num + Number.EPSILON;
-┊48┊  ┊        case ">": case ">=": return context >= num - Number.EPSILON;
-┊49┊  ┊        default: return Math.abs(context - num) <= Number.EPSILON;
-┊50┊  ┊      }
-┊51┊  ┊    // Pixel precision, round comparison
-┊52┊  ┊    case "px":
-┊53┊  ┊      switch (method) {
-┊54┊  ┊        case "<": case "<=": return Math.round(context) <= Math.round(num);
-┊55┊  ┊        case ">": case ">=": return Math.round(context) >= Math.round(num);
-┊56┊  ┊        default: return Math.round(context) == Math.round(num);
-┊57┊  ┊      }
-┊58┊  ┊    // Exact precision
-┊59┊  ┊    default:
-┊60┊  ┊      switch (method) {
-┊61┊  ┊        case "<": return context < num;
-┊62┊  ┊        case "<=": return context <= num;
-┊63┊  ┊        case ">": return context > num;
-┊64┊  ┊        case ">=": return context >= num;
-┊65┊  ┊        default: return context === num;
-┊66┊  ┊      }
+┊  ┊19┊Object.assign(Utils, CPP.Utils, {
+┊  ┊20┊  // Overload handling
+┊  ┊21┊  compare(context, num, method, precision = method) {
+┊  ┊22┊    return CPP.Utils.compare(context, num, method, precision);
 ┊67┊23┊  }
-┊68┊  ┊};🚫↵
+┊  ┊24┊});🚫↵
```
[}]: #

To compile our C++ code and turn it into JavaScript, we'll need to run the following command:

    $ emcc -O1 --pre-js resources/cpp/pre.js --post-js resources/cpp/post.js --bind -o resources/scripts/cpp.bundle.js resources/cpp/src/index.cpp

Here's a detailed list with explanations regards the arguments vector we've just passed:

- `-01` - Optimization level 1. The higher the index, the more optimized our code is gonna be, but less readable.
- `--pre-js` - Specifies a JavaScript prefix for the compiled code.
- `--post-js` - Specifies a JavaScript postfix for the compiled code.
- `--bind` - Tells the compiler to use Embind
- `-o` - The output path.

> More informations regards Emscripten's CLI can be found [here](https://kripken.github.io/emscripten-site/docs/tools_reference/emcc.html).

You don't have to memorize the compilation command we've just typed, because we're gonna save it as an NPM script called `build:cpp`:

[{]: <helper> (diff_step 7.6)
#### Step 7.6: Add ignore rule to CPP bundle

##### Changed .gitignore
```diff
@@ -1,3 +1,4 @@
 ┊1┊1┊node_modules
 ┊2┊2┊npm-debug.log
-┊3┊ ┊resources/assets/fonts/*.json🚫↵
+┊ ┊3┊resources/assets/fonts/*.json
+┊ ┊4┊resources/scripts/cpp.bundle.js🚫↵
```
[}]: #

Now if you'd like to compile the C++ code just run:

    $ npm run build:cpp

Moreover, the code should be compiled automatically any time you start the serer using the command:

    $ npm run serve

We always have to be on the alert and run our tests against modules we've just translated from JavaScript to C++. This will guarantee that once we run the game we won't stumble upon any defect whatsoever. Before running the tests, be sure to import the C++ bundle in the HTML file's header:

[{]: <helper> (diff_step 7.8)
#### Step 7.8: Load CPP bundle in spec runner

##### Changed views/spec_runner.html
```diff
@@ -16,6 +16,7 @@
 ┊16┊16┊    <script type="text/javascript" src="libs/underscore.js"></script>
 ┊17┊17┊
 ┊18┊18┊    <!-- Scripts -->
+┊  ┊19┊    <script type="text/javascript" src="scripts/cpp.bundle.js"></script>
 ┊19┊20┊    <script type="text/javascript" src="scripts/utils.js"></script>
 ┊20┊21┊    <script type="text/javascript" src="scripts/namespaces.js"></script>
 ┊21┊22┊    <script type="text/javascript" src="scripts/engine/geometry/line.js"></script>
```
[}]: #

Now we can run the tests by running the following command:

    $ npm run test

At this point **all our tests should pass**. If they don't, it means our newly created utility module is not working properly, and you will have to repeat the previous steps until you get it right.

Up next, we gonna translate the geometry line class to C++. Since it's gonna be translated almost identically, we will have to make sure that all the necessary assets are gonna be available for our class before proceeding. The first thing we will have to do would be making sure that the utility functions are chainable directly from C++ as well. To do that, we will create a chain class which should return a new instance of it whenever we're about to chain the upcoming utility method. Once calling `result()`, the accumulator should be returned:

[{]: <helper> (diff_step 7.9)
#### Step 7.9: Add chaining method to CPP utils

##### Changed resources/cpp/src/utils.cpp
```diff
@@ -5,6 +5,61 @@
 ┊ 5┊ 5┊#include "utils.h"
 ┊ 6┊ 6┊
 ┊ 7┊ 7┊namespace utils {
+┊  ┊ 8┊  template<typename T>
+┊  ┊ 9┊  Chain<T>::Chain(T accumulator): _accumulator(accumulator) {
+┊  ┊10┊  }
+┊  ┊11┊
+┊  ┊12┊  template<>
+┊  ┊13┊  Chain<double>* Chain<double>::mod(double num) {
+┊  ┊14┊    double result = utils::mod(_accumulator, num);
+┊  ┊15┊    Chain<double>* chain = new Chain<double>(result);
+┊  ┊16┊    delete this;
+┊  ┊17┊    return chain;
+┊  ┊18┊  }
+┊  ┊19┊
+┊  ┊20┊  template<>
+┊  ┊21┊  Chain<double>* Chain<double>::trim(int decimals, const std::string mode) {
+┊  ┊22┊    double result = utils::trim(_accumulator, decimals, mode);
+┊  ┊23┊    Chain<double>* chain = new Chain<double>(result);
+┊  ┊24┊    delete this;
+┊  ┊25┊    return chain;
+┊  ┊26┊  }
+┊  ┊27┊
+┊  ┊28┊  template<>
+┊  ┊29┊  Chain<bool>* Chain<double>::isBetween(double num1, double num2, const std::string precision) {
+┊  ┊30┊    bool result = utils::isBetween(_accumulator, num1, num2, precision);
+┊  ┊31┊    Chain<bool>* chain = new Chain<bool>(result);
+┊  ┊32┊    delete this;
+┊  ┊33┊    return chain;
+┊  ┊34┊  }
+┊  ┊35┊
+┊  ┊36┊  template<>
+┊  ┊37┊  Chain<bool>* Chain<double>::compare(double num, const std::string precision) {
+┊  ┊38┊    bool result = utils::compare(_accumulator, num, precision);
+┊  ┊39┊    Chain<bool>* chain = new Chain<bool>(result);
+┊  ┊40┊    delete this;
+┊  ┊41┊    return chain;
+┊  ┊42┊  }
+┊  ┊43┊
+┊  ┊44┊  template<>
+┊  ┊45┊  Chain<bool>* Chain<double>::compare(double num, const std::string method, const std::string precision) {
+┊  ┊46┊    bool result = utils::compare(_accumulator, num, method, precision);
+┊  ┊47┊    Chain<bool>* chain = new Chain<bool>(result);
+┊  ┊48┊    delete this;
+┊  ┊49┊    return chain;
+┊  ┊50┊  }
+┊  ┊51┊
+┊  ┊52┊  template<typename T>
+┊  ┊53┊  T Chain<T>::result() {
+┊  ┊54┊    delete this;
+┊  ┊55┊    return _accumulator;
+┊  ┊56┊  }
+┊  ┊57┊
+┊  ┊58┊  template<typename T>
+┊  ┊59┊  Chain<T>* chain(T accumulator) {
+┊  ┊60┊    return new Chain<T>(accumulator);
+┊  ┊61┊  }
+┊  ┊62┊
 ┊ 8┊63┊  // Fixed modulo method which can calculate modulo of negative numbers properly
 ┊ 9┊64┊  // e.g. (-803).mod(800) returns 797
 ┊10┊65┊  double mod(double context, double num) {
```

##### Changed resources/cpp/src/utils.h
```diff
@@ -3,6 +3,30 @@
 ┊ 3┊ 3┊#include <string>
 ┊ 4┊ 4┊
 ┊ 5┊ 5┊namespace utils {
+┊  ┊ 6┊  template<typename T>
+┊  ┊ 7┊  class Chain {
+┊  ┊ 8┊  private:
+┊  ┊ 9┊    T _accumulator;
+┊  ┊10┊
+┊  ┊11┊  public:
+┊  ┊12┊    Chain(T accumulator);
+┊  ┊13┊
+┊  ┊14┊    Chain<double>* mod(double num);
+┊  ┊15┊
+┊  ┊16┊    Chain<double>* trim(int decimals, const std::string mode = "round");
+┊  ┊17┊
+┊  ┊18┊    Chain<bool>* isBetween(double num1, double num2, const std::string precision = "exact");
+┊  ┊19┊
+┊  ┊20┊    Chain<bool>* compare(double num, const std::string precision = "exact");
+┊  ┊21┊
+┊  ┊22┊    Chain<bool>* compare(double num, const std::string method, const std::string precision);
+┊  ┊23┊
+┊  ┊24┊    T result();
+┊  ┊25┊  };
+┊  ┊26┊
+┊  ┊27┊  template<typename T>
+┊  ┊28┊  Chain<T>* chain(T accumulator);
+┊  ┊29┊
 ┊ 6┊30┊  double mod(double context, double num);
 ┊ 7┊31┊
 ┊ 8┊32┊  double trim(double context, int decimals, const std::string mode = "round");
```
[}]: #

> Note that when coding in C++ we have to make sure that the objects are being disposed when not needed anymore, otherwise we will have some unnecessary memory leaks.

2D shapes are presented in space using points with 2 values - `x` (axis) and `y` axis, therefore, we will create the appropriate point structure:

[{]: <helper> (diff_step 7.10)
#### Step 7.10: Add point struct

##### Added resources/cpp/src/geometry/point.h
```diff
@@ -0,0 +1,8 @@
+┊ ┊1┊#pragma once
+┊ ┊2┊
+┊ ┊3┊namespace geometry {
+┊ ┊4┊  struct Point {
+┊ ┊5┊    double x;
+┊ ┊6┊    double y;
+┊ ┊7┊  };
+┊ ┊8┊}🚫↵
```
[}]: #

Returned values can either be `null` (`undefined`) or not. Since there's no built in nullable-values mechanism in C++ (up until C++17), we're gonna create one of our own:

[{]: <helper> (diff_step 7.11)
#### Step 7.11: Add nullable class

##### Changed resources/cpp/src/index.cpp
```diff
@@ -1 +1,2 @@
+┊ ┊1┊#include "nullable.cpp"
 ┊1┊2┊#include "utils.cpp"🚫↵
```

##### Added resources/cpp/src/nullable.cpp
```diff
@@ -0,0 +1,37 @@
+┊  ┊ 1┊#include "nullable.h"
+┊  ┊ 2┊
+┊  ┊ 3┊template <typename T>
+┊  ┊ 4┊Nullable<T>::Nullable(T value): _value(value), _initialized(true) {
+┊  ┊ 5┊
+┊  ┊ 6┊}
+┊  ┊ 7┊
+┊  ┊ 8┊template <typename T>
+┊  ┊ 9┊Nullable<T>::Nullable(): _initialized(false) {
+┊  ┊10┊
+┊  ┊11┊}
+┊  ┊12┊
+┊  ┊13┊template <typename T>
+┊  ┊14┊T Nullable<T>::getValue() const {
+┊  ┊15┊  return _value;
+┊  ┊16┊}
+┊  ┊17┊
+┊  ┊18┊template <typename T>
+┊  ┊19┊void Nullable<T>::setValue(T value) {
+┊  ┊20┊  _value = value;
+┊  ┊21┊  _initialized = true;
+┊  ┊22┊}
+┊  ┊23┊
+┊  ┊24┊template <typename T>
+┊  ┊25┊void Nullable<T>::resetValue() {
+┊  ┊26┊  _initialized = false;
+┊  ┊27┊}
+┊  ┊28┊
+┊  ┊29┊template <typename T>
+┊  ┊30┊bool Nullable<T>::hasValue() const {
+┊  ┊31┊  return _initialized == true;
+┊  ┊32┊}
+┊  ┊33┊
+┊  ┊34┊template <typename T>
+┊  ┊35┊bool Nullable<T>::isNull() const {
+┊  ┊36┊  return _initialized == false;
+┊  ┊37┊}🚫↵
```

##### Added resources/cpp/src/nullable.h
```diff
@@ -0,0 +1,23 @@
+┊  ┊ 1┊#pragma once
+┊  ┊ 2┊
+┊  ┊ 3┊template <typename T>
+┊  ┊ 4┊class Nullable {
+┊  ┊ 5┊private:
+┊  ┊ 6┊  T _value;
+┊  ┊ 7┊  bool _initialized;
+┊  ┊ 8┊
+┊  ┊ 9┊public:
+┊  ┊10┊  Nullable(T value);
+┊  ┊11┊
+┊  ┊12┊  Nullable();
+┊  ┊13┊
+┊  ┊14┊  T getValue() const;
+┊  ┊15┊
+┊  ┊16┊  void setValue(T value);
+┊  ┊17┊
+┊  ┊18┊  void resetValue();
+┊  ┊19┊
+┊  ┊20┊  bool hasValue() const;
+┊  ┊21┊
+┊  ┊22┊  bool isNull() const;
+┊  ┊23┊};🚫↵
```
[}]: #

Now that all the necessary assets for the line class are ready, we can go ahead and create it:

[{]: <helper> (diff_step 7.12)
#### Step 7.12: Add base line CPP module

##### Added resources/cpp/src/geometry/line.cpp
```diff
@@ -0,0 +1,99 @@
+┊  ┊ 1┊#include "../nullable.h"
+┊  ┊ 2┊#include "../utils.h"
+┊  ┊ 3┊#include "point.h"
+┊  ┊ 4┊#include "line.h"
+┊  ┊ 5┊
+┊  ┊ 6┊namespace geometry {
+┊  ┊ 7┊  // x1 - The first point's x value
+┊  ┊ 8┊  // y1 - The first point's y value
+┊  ┊ 9┊  // x1 - The second point's x value
+┊  ┊10┊  // y2 - The second point's y value
+┊  ┊11┊  Line::Line(double x1, double y1, double x2, double y2) {
+┊  ┊12┊    _x1 = utils::trim(x1, 9);
+┊  ┊13┊    _y1 = utils::trim(y1, 9);
+┊  ┊14┊    _x2 = utils::trim(x2, 9);
+┊  ┊15┊    _y2 = utils::trim(y2, 9);
+┊  ┊16┊  }
+┊  ┊17┊
+┊  ┊18┊  // Gets the matching x value for a given y value
+┊  ┊19┊  Nullable<double> Line::getMatchingX(double y) {
+┊  ┊20┊    // If an error was thrown it means we divided a number by zero,
+┊  ┊21┊    // in which case there is not intersection point
+┊  ┊22┊    double x = utils::trim(
+┊  ┊23┊      (((y - _y1) * (_x2 - _x1)) /
+┊  ┊24┊       (_y2 - _y1)) + _x1
+┊  ┊25┊    , 9, "exact");
+┊  ┊26┊
+┊  ┊27┊    // Check if result is in values range
+┊  ┊28┊    if (utils::isBetween(x, _x1, _x2, "round")) {
+┊  ┊29┊      return Nullable<double>(x);
+┊  ┊30┊    }
+┊  ┊31┊
+┊  ┊32┊    return Nullable<double>();
+┊  ┊33┊  }
+┊  ┊34┊
+┊  ┊35┊  // Gets the matching y value for a given x value
+┊  ┊36┊  Nullable<double> Line::getMatchingY(double x) {
+┊  ┊37┊    // If an error was thrown it means we divided a number by zero,
+┊  ┊38┊    // in which case there is not intersection point
+┊  ┊39┊    double y = utils::trim(
+┊  ┊40┊      (((x - _x1) * (_y2 - _y1)) /
+┊  ┊41┊       (_x2 - _x1)) + _y1
+┊  ┊42┊    , 9, "exact");
+┊  ┊43┊
+┊  ┊44┊    // Check if result is in values range
+┊  ┊45┊    if (utils::isBetween(y, _y1, _y2, "round")) {
+┊  ┊46┊      return Nullable<double>(y);
+┊  ┊47┊    }
+┊  ┊48┊
+┊  ┊49┊    return Nullable<double>();
+┊  ┊50┊  }
+┊  ┊51┊
+┊  ┊52┊  // Returns if line has given point
+┊  ┊53┊  bool Line::hasPoint(double x, double y) {
+┊  ┊54┊    if (!boundsHavePoint(x, y)) return 0;
+┊  ┊55┊
+┊  ┊56┊    double m = utils::trim(
+┊  ┊57┊      (_y2 - _y1) / (_x2 - _x1),
+┊  ┊58┊    9, "exact");
+┊  ┊59┊
+┊  ┊60┊    return (y - _y1) / (x - _x1) == m;
+┊  ┊61┊  }
+┊  ┊62┊
+┊  ┊63┊  // Returns if given point is contained by the bounds aka cage of line
+┊  ┊64┊  bool Line::boundsHavePoint(double x, double y) {
+┊  ┊65┊    return utils::isBetween(x, _x1, _x2, "round") &&
+┊  ┊66┊           utils::isBetween(y, _y1, _y2, "round");
+┊  ┊67┊  }
+┊  ┊68┊
+┊  ┊69┊  // line - line intersection method
+┊  ┊70┊  Nullable<Point> Line::getIntersection(Line line) {
+┊  ┊71┊    // Escape if lines are parallel
+┊  ┊72┊    if (!(((_x1 - _x2) * (line._y1 - line._y2)) -
+┊  ┊73┊          ((_y1 - _y2) * (line._x1 - line._x2))))
+┊  ┊74┊      return Nullable<Point>();
+┊  ┊75┊
+┊  ┊76┊    // Intersection point formula
+┊  ┊77┊    double x = utils::trim(
+┊  ┊78┊      ((((_x1 * _y2) - (_y1 * _x2)) * (line._x1 - line._x2)) -
+┊  ┊79┊       ((_x1 - _x2) * ((line._x1 * line._y2) - (line._y1 * line._x2)))) /
+┊  ┊80┊      (((_x1 - _x2) * (line._y1 - line._y2)) - ((_y1 - _y2) *
+┊  ┊81┊        (line._x1 - line._x2)))
+┊  ┊82┊    , 9, "exact");
+┊  ┊83┊    double y = utils::trim(
+┊  ┊84┊      ((((_x1 * _y2) - (_y1 * _x2)) * (line._y1 - line._y2)) -
+┊  ┊85┊       ((_y1 - _y2) * ((line._x1 * line._y2) - (line._y1 * line._x2)))) /
+┊  ┊86┊      (((_x1 - _x2) * (line._y1 - line._y2)) - ((_y1 - _y2) *
+┊  ┊87┊        (line._x1 - line._x2)))
+┊  ┊88┊    , 9, "exact");
+┊  ┊89┊
+┊  ┊90┊    if (utils::isBetween(x, _x1, _x2, "round") &&
+┊  ┊91┊        utils::isBetween(x, line._x1, line._x2, "round") &&
+┊  ┊92┊        utils::isBetween(y, _y1, _y2, "round") &&
+┊  ┊93┊        utils::isBetween(y, line._y1, line._y2, "round")) {
+┊  ┊94┊      return Nullable<Point>({ x, y });
+┊  ┊95┊    }
+┊  ┊96┊
+┊  ┊97┊    return Nullable<Point>();
+┊  ┊98┊  }
+┊  ┊99┊}🚫↵
```

##### Added resources/cpp/src/geometry/line.h
```diff
@@ -0,0 +1,30 @@
+┊  ┊ 1┊#pragma once
+┊  ┊ 2┊
+┊  ┊ 3┊#include <vector>
+┊  ┊ 4┊#include "../nullable.h"
+┊  ┊ 5┊#include "point.h"
+┊  ┊ 6┊
+┊  ┊ 7┊namespace geometry {
+┊  ┊ 8┊  class Circle;
+┊  ┊ 9┊  class EMCircle;
+┊  ┊10┊
+┊  ┊11┊  class Line {
+┊  ┊12┊  public:
+┊  ┊13┊    double _x1;
+┊  ┊14┊    double _y1;
+┊  ┊15┊    double _x2;
+┊  ┊16┊    double _y2;
+┊  ┊17┊
+┊  ┊18┊    Line(double x1, double y1, double x2, double y2);
+┊  ┊19┊
+┊  ┊20┊    Nullable<double> getMatchingX(double y);
+┊  ┊21┊
+┊  ┊22┊    Nullable<double> getMatchingY(double x);
+┊  ┊23┊
+┊  ┊24┊    bool hasPoint(double x, double y);
+┊  ┊25┊
+┊  ┊26┊    bool boundsHavePoint(double x, double y);
+┊  ┊27┊
+┊  ┊28┊    Nullable<Point> getIntersection(Line line);
+┊  ┊29┊  };
+┊  ┊30┊}🚫↵
```

##### Changed resources/cpp/src/index.cpp
```diff
@@ -1,2 +1,3 @@
 ┊1┊1┊#include "nullable.cpp"
-┊2┊ ┊#include "utils.cpp"🚫↵
+┊ ┊2┊#include "utils.cpp"
+┊ ┊3┊#include "geometry/line.cpp"🚫↵
```
[}]: #

After creating our C++, we will also need to bind it using EMBind:

[{]: <helper> (diff_step 7.13)
#### Step 7.13: EMBind CPP line

##### Changed resources/cpp/post.js
```diff
@@ -4,6 +4,10 @@
 ┊ 4┊ 4┊    trim: Module.utils_trim,
 ┊ 5┊ 5┊    isBetween: Module.utils_isBetween,
 ┊ 6┊ 6┊    compare: Module.utils_compare
+┊  ┊ 7┊  },
+┊  ┊ 8┊
+┊  ┊ 9┊  Geometry: {
+┊  ┊10┊    Line: Module.geometry_line
 ┊ 7┊11┊  }
 ┊ 8┊12┊};
 ┊ 9┊13┊
```

##### Changed resources/cpp/src/geometry/line.cpp
```diff
@@ -1,3 +1,6 @@
+┊ ┊1┊#include <vector>
+┊ ┊2┊#include <emscripten/bind.h>
+┊ ┊3┊#include <emscripten/val.h>
 ┊1┊4┊#include "../nullable.h"
 ┊2┊5┊#include "../utils.h"
 ┊3┊6┊#include "point.h"
```
```diff
@@ -96,4 +99,52 @@
 ┊ 96┊ 99┊
 ┊ 97┊100┊    return Nullable<Point>();
 ┊ 98┊101┊  }
+┊   ┊102┊
+┊   ┊103┊  emscripten::val EMLine::getMatchingX(double y) {
+┊   ┊104┊    Nullable<double> nullableX = Line::getMatchingX(y);
+┊   ┊105┊    return nullableX.hasValue() ?
+┊   ┊106┊      emscripten::val(nullableX.getValue()) :
+┊   ┊107┊      emscripten::val::undefined();
+┊   ┊108┊  }
+┊   ┊109┊
+┊   ┊110┊  emscripten::val EMLine::getMatchingY(double x) {
+┊   ┊111┊    Nullable<double> nullableY = Line::getMatchingY(x);
+┊   ┊112┊    return nullableY.hasValue() ?
+┊   ┊113┊      emscripten::val(nullableY.getValue()) :
+┊   ┊114┊      emscripten::val::undefined();
+┊   ┊115┊  }
+┊   ┊116┊
+┊   ┊117┊  emscripten::val EMLine::getIntersection(EMLine emLine) {
+┊   ┊118┊    Line line = Line(emLine._x1, emLine._y1, emLine._x2, emLine._y2);
+┊   ┊119┊    Nullable<Point> nullablePoint = Line::getIntersection(line);
+┊   ┊120┊
+┊   ┊121┊    if (nullablePoint.isNull()) return emscripten::val::undefined();
+┊   ┊122┊
+┊   ┊123┊    Point point = nullablePoint.getValue();
+┊   ┊124┊    emscripten::val emPoint = emscripten::val::object();
+┊   ┊125┊    emPoint.set("x", emscripten::val(point.x));
+┊   ┊126┊    emPoint.set("y", emscripten::val(point.y));
+┊   ┊127┊    return emPoint;
+┊   ┊128┊  }
+┊   ┊129┊}
+┊   ┊130┊
+┊   ┊131┊EMSCRIPTEN_BINDINGS(geometry_line_module) {
+┊   ┊132┊  emscripten::class_<geometry::Line>("geometry_line_base")
+┊   ┊133┊    .constructor<double, double, double, double>()
+┊   ┊134┊    .property<double>("x1", &geometry::Line::_x1)
+┊   ┊135┊    .property<double>("y1", &geometry::Line::_y1)
+┊   ┊136┊    .property<double>("x2", &geometry::Line::_x2)
+┊   ┊137┊    .property<double>("y2", &geometry::Line::_y2)
+┊   ┊138┊    .function("hasPoint", &geometry::Line::hasPoint)
+┊   ┊139┊    .function("boundsHavePoint", &geometry::Line::boundsHavePoint);
+┊   ┊140┊
+┊   ┊141┊  emscripten::class_<geometry::EMLine, emscripten::base<geometry::Line>>("geometry_line")
+┊   ┊142┊    .constructor<double, double, double, double>()
+┊   ┊143┊    .function("getX", &geometry::EMLine::getMatchingX)
+┊   ┊144┊    .function("getY", &geometry::EMLine::getMatchingY)
+┊   ┊145┊    .function("getLineIntersection",
+┊   ┊146┊      emscripten::select_overload<emscripten::val(geometry::EMLine)>(
+┊   ┊147┊        &geometry::EMLine::getIntersection
+┊   ┊148┊      )
+┊   ┊149┊    );
 ┊ 99┊150┊}🚫↵
```

##### Changed resources/cpp/src/geometry/line.h
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊#pragma once
 ┊2┊2┊
 ┊3┊3┊#include <vector>
+┊ ┊4┊#include <emscripten/val.h>
 ┊4┊5┊#include "../nullable.h"
 ┊5┊6┊#include "point.h"
 ┊6┊7┊
```
```diff
@@ -27,4 +28,15 @@
 ┊27┊28┊
 ┊28┊29┊    Nullable<Point> getIntersection(Line line);
 ┊29┊30┊  };
+┊  ┊31┊
+┊  ┊32┊  class EMLine : public Line {
+┊  ┊33┊  public:
+┊  ┊34┊    using Line::Line;
+┊  ┊35┊
+┊  ┊36┊    emscripten::val getMatchingX(double y);
+┊  ┊37┊
+┊  ┊38┊    emscripten::val getMatchingY(double x);
+┊  ┊39┊
+┊  ┊40┊    emscripten::val getIntersection(EMLine line);
+┊  ┊41┊  };
 ┊30┊42┊}🚫↵
```
[}]: #

In the code snippet above, you can see that we used a special data-type called `val` (`emscripten::val`). `val` means that just like JavaScript, that function can return values that are not necessarily of the same data-type; For instance, the `getMatchingY` function can either return a `number` or `undefined`. If you'll take a look at the `getIntersection(Line)` method you'll notice that instead of returning the raw point structure, I chose to build a JavaScript object using the `object` data type (`emscripten::object`). `object` behaves exactly like a native JavaScript `Object`, and it can save us some precious work of binding which sometimes might be just too much.

If you'll compare the C++ version of the line class to the JavaScript line class you'll notice that the `draw` and `getIntersection` methods are missing (when we used EMBind we renamed `getIntersection` to `getLineIntersection` because overloadings are forbidden). In addition, Emscripten's API exposes some additional class methods for generated C++ classes, like the `delete` method, which we will shed light on further in this tutorial. Inheritance would be the natural solution for such an issue, unfortunately, generated C++ constructors don't accept indirect instances. For example, if we have a C++ parent class called `Shape` and we have a JavaScript child class called `Line`, we won't be able to initialize a new instance of the `Line` class. Here's a demonstration:

```js
class JSLine extends CPPShape {}
const line = new JSLine(); // Throws error
```

There are 3 ways to implement inheritance when interacting with C++ classes:

- Define an interface when using EMBind. This is the official way but rather complicated, since it requires us to define an extra layer for our wrapper. More information can be found [here](https://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/embind.html#abstract-methods).
- Extending the prototype of exported C++ classes directly, which is not really an inheritance.
- Using a proxy class, which is the easiest and cleanest solution of all, but it is not really mentioned anywhere. At the same time, I didn't find any restriction regards that.

We're gonna use the 3rd method in the list above, because as I said, it's the easiest and cleanest of all. First I will try to explain what I meant by saying "proxy class". If you're an intermediate JavaScript developer, you probably know that constructors can be overridden by returning a value explicitly. By doing that, we can actually bypass Emscripten's prohibitions, we can just return the newly created C++ instance and extend it in specific. Proxy classes actually take it a step further by providing a middle-class which will then inject a new link to the prototype chain of the returned instance.

```js
class JSLine {
  constructor() {
    const line = new CPPShape();
    return line;
  }
}

const line = new JSLine(); // Legal!
```

> More information about the code snippet above can be found [here](https://www.bennadel.com/blog/2522-providing-a-return-value-in-a-javascript-constructor.htm).

I believe that as we go through this tutorial, the concept will get much clearer. The utility function of the proxy class should look like so:

[{]: <helper> (diff_step 7.14)
#### Step 7.14: Add proxy utility method

##### Changed resources/scripts/utils.js
```diff
@@ -20,5 +20,18 @@
 ┊20┊20┊  // Overload handling
 ┊21┊21┊  compare(context, num, method, precision = method) {
 ┊22┊22┊    return CPP.Utils.compare(context, num, method, precision);
+┊  ┊23┊  },
+┊  ┊24┊
+┊  ┊25┊  proxy(Class) {
+┊  ┊26┊    return class extends Class {
+┊  ┊27┊      constructor() {
+┊  ┊28┊        // Initialize original class
+┊  ┊29┊        let that = new Class(...arguments);
+┊  ┊30┊        // Inject caller's prototype into the prototype chain
+┊  ┊31┊        Object.setPrototypeOf(that, new.target.prototype);
+┊  ┊32┊        // Will original instance will be the substitute for 'this'
+┊  ┊33┊        return that;
+┊  ┊34┊      }
+┊  ┊35┊    }
 ┊23┊36┊  }
 ┊24┊37┊});🚫↵
```
[}]: #

If you'll take a look at the following line:

```js
Object.setPrototypeOf(that, new.target.prototype);
```

This is where the magic actually happens! It enables inheritance for explicitly returned objects; This way we can safely extend C++ classes. Accordingly, our new JavaScript line class should look like so:

[{]: <helper> (diff_step 7.15)
#### Step 7.15: Extend CPP line class

##### Changed resources/scripts/engine/geometry/line.js
```diff
@@ -1,46 +1,10 @@
-┊ 1┊  ┊Engine.Geometry.Line = class Line {
-┊ 2┊  ┊  // x1 - The first point's x value
-┊ 3┊  ┊  // y1 - The first point's y value
-┊ 4┊  ┊  // x1 - The second point's x value
-┊ 5┊  ┊  // y2 - The second point's y value
-┊ 6┊  ┊  constructor(x1, y1, x2, y2) {
-┊ 7┊  ┊    this.x1 = Utils.trim(x1, 9);
-┊ 8┊  ┊    this.y1 = Utils.trim(y1, 9);
-┊ 9┊  ┊    this.x2 = Utils.trim(x2, 9);
-┊10┊  ┊    this.y2 = Utils.trim(y2, 9);
-┊11┊  ┊  }
-┊12┊  ┊
+┊  ┊ 1┊Engine.Geometry.Line = class Line extends Utils.proxy(CPP.Geometry.Line) {
 ┊13┊ 2┊  // Draws the line on the given context
 ┊14┊ 3┊  draw(context) {
 ┊15┊ 4┊    context.moveTo(this.x1, this.y1);
 ┊16┊ 5┊    context.lineTo(this.x2, this.y2);
 ┊17┊ 6┊  }
 ┊18┊ 7┊
-┊19┊  ┊  // Gets the matching x value for a given y value
-┊20┊  ┊  getX(y) {
-┊21┊  ┊    let x = Utils.trim((((y - this.y1) * (this.x2 - this.x1)) / (this.y2 - this.y1)) + this.x1, 9);
-┊22┊  ┊    if (isNaN(x) || Utils.isBetween(x, this.x1, this.x2)) return x;
-┊23┊  ┊  }
-┊24┊  ┊
-┊25┊  ┊  // Gets the matching y value for a given x value
-┊26┊  ┊  getY(x) {
-┊27┊  ┊    let y = Utils.trim((((x - this.x1) * (this.y2 - this.y1)) / (this.x2 - this.x1)) + this.y1, 9);
-┊28┊  ┊    if (isNaN(y) || Utils.isBetween(y, this.y1, this.y2)) return y;
-┊29┊  ┊  }
-┊30┊  ┊
-┊31┊  ┊  // Returns if line has given point
-┊32┊  ┊  hasPoint(x, y) {
-┊33┊  ┊    if (!this.boundsHavePoint(x, y)) return false;
-┊34┊  ┊    let m = Utils.trim((this.y2 - this.y1) / (this.x2 - this.x1), 9);
-┊35┊  ┊    return (y - this.y1) / (x - this.x1) == m;
-┊36┊  ┊  }
-┊37┊  ┊
-┊38┊  ┊  // Returns if given point is contained by the bounds aka cage of line
-┊39┊  ┊  boundsHavePoint(x, y) {
-┊40┊  ┊    return Utils.isBetween(x, this.x1, this.x2) &&
-┊41┊  ┊           Utils.isBetween(y, this.y1, this.y2);
-┊42┊  ┊  }
-┊43┊  ┊
 ┊44┊ 8┊  getIntersection(shape) {
 ┊45┊ 9┊    if (shape instanceof Engine.Geometry.Line)
 ┊46┊10┊      return this.getLineIntersection(shape);
```
```diff
@@ -50,23 +14,6 @@
 ┊50┊14┊      return this.getPolygonIntersection(shape);
 ┊51┊15┊  }
 ┊52┊16┊
-┊53┊  ┊  // line - line intersection method
-┊54┊  ┊  getLineIntersection(line) {
-┊55┊  ┊    // Escape if lines are parallel
-┊56┊  ┊    if (!(((this.x1 - this.x2) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * (line.x1 - line.x2)))) return;
-┊57┊  ┊
-┊58┊  ┊    // Intersection point formula
-┊59┊  ┊    let x = Utils.trim(((((this.x1 * this.y2) - (this.y1 * this.x2)) * (line.x1 - line.x2)) - ((this.x1 - this.x2) * ((line.x1 * line.y2) - (line.y1 * line.x2)))) /
-┊60┊  ┊        (((this.x1 - this.x2) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * (line.x1 - line.x2))), 9);
-┊61┊  ┊    let y = Utils.trim(((((this.x1 * this.y2) - (this.y1 * this.x2)) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * ((line.x1 * line.y2) - (line.y1 * line.x2)))) /
-┊62┊  ┊        (((this.x1 - this.x2) * (line.y1 - line.y2)) - ((this.y1 - this.y2) * (line.x1 - line.x2))), 9);
-┊63┊  ┊
-┊64┊  ┊    if (Utils.isBetween(x, this.x1, this.x2) && Utils.isBetween(x, line.x1, line.x2) &&
-┊65┊  ┊        Utils.isBetween(y, this.y1, this.y2) && Utils.isBetween(y, line.y1, line.y2)) {
-┊66┊  ┊      return { x, y };
-┊67┊  ┊    }
-┊68┊  ┊  }
-┊69┊  ┊
 ┊70┊17┊  // line - circle intersection method
 ┊71┊18┊  getCircleIntersection(circle) {
 ┊72┊19┊    return circle.getLineIntersection(this);
```
[}]: #

By now, our tests should pass. Accept, there is memory leak we need to handle. But you probably ask yourself - "What memory leak? It's JavaScript man! Have you ever heard of something called garbage collector?!". Well, this is not the case when compiling C++ code with Emscripten. You see, Emscripten uses asm.js, which is a subset for JavaScript built exactly for these proposes, enabling C++ modules run on the browser. This is how the [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) project actually started, an almost complete conversion from the famous C++ [OpenGL](https://www.opengl.org/) to JavaScript. Part of what asm.js does, it disables the garbage collector, and instead, it holds raw pointers, just like in C++. Since returned class instances are pointers with unknown lifespans, they need to be disposed manually, using the `delete` method (identical to how we clear memory from the Heap in C++). Let's dispose unused test data by calling the `delete` method as just mentioned:

[{]: <helper> (diff_step 7.16)
#### Step 7.16: Delete line instances in tests

##### Changed resources/scripts/specs/engine/geometry/circle.js
```diff
@@ -111,6 +111,8 @@
 ┊111┊111┊          { x: 6, y: 1 },
 ┊112┊112┊          { x: -4, y: 1 }
 ┊113┊113┊        ]);
+┊   ┊114┊
+┊   ┊115┊        line.delete();
 ┊114┊116┊      });
 ┊115┊117┊    });
 ┊116┊118┊
```
```diff
@@ -121,6 +123,8 @@
 ┊121┊123┊        expect(this.circle.getLineIntersection(line)).toEqual([
 ┊122┊124┊          { x: -4, y: 1 }
 ┊123┊125┊        ]);
+┊   ┊126┊
+┊   ┊127┊        line.delete();
 ┊124┊128┊      });
 ┊125┊129┊    });
 ┊126┊130┊
```
```diff
@@ -131,6 +135,8 @@
 ┊131┊135┊        expect(this.circle.getLineIntersection(line)).toEqual([
 ┊132┊136┊          { x: 1, y: 6 }
 ┊133┊137┊        ]);
+┊   ┊138┊
+┊   ┊139┊        line.delete();
 ┊134┊140┊      });
 ┊135┊141┊    });
 ┊136┊142┊
```
```diff
@@ -138,6 +144,7 @@
 ┊138┊144┊      it("returns nothing", function() {
 ┊139┊145┊        let line = new Engine.Geometry.Line(-10, 10, 10, 10);
 ┊140┊146┊        expect(this.circle.getLineIntersection(line)).toBeUndefined();
+┊   ┊147┊        line.delete();
 ┊141┊148┊      });
 ┊142┊149┊    });
 ┊143┊150┊  });
```

##### Changed resources/scripts/specs/engine/geometry/line.js
```diff
@@ -3,6 +3,10 @@
 ┊ 3┊ 3┊    this.line = new Engine.Geometry.Line(-5, -5, 5, 5);
 ┊ 4┊ 4┊  });
 ┊ 5┊ 5┊
+┊  ┊ 6┊  afterEach(function () {
+┊  ┊ 7┊    this.line.delete();
+┊  ┊ 8┊  });
+┊  ┊ 9┊
 ┊ 6┊10┊  describe("getX method", function() {
 ┊ 7┊11┊    describe("given inranged y", function() {
 ┊ 8┊12┊      it("returns x", function() {
```
```diff
@@ -58,6 +62,8 @@
 ┊58┊62┊          x: 1,
 ┊59┊63┊          y: 1
 ┊60┊64┊        });
+┊  ┊65┊
+┊  ┊66┊        line.delete();
 ┊61┊67┊      });
 ┊62┊68┊    });
 ┊63┊69┊
```
```diff
@@ -65,6 +71,7 @@
 ┊65┊71┊      it("returns nothing", function() {
 ┊66┊72┊        let line = new Engine.Geometry.Line(-5, -6, 5, 4);
 ┊67┊73┊        expect(this.line.getLineIntersection(line)).toBeUndefined();
+┊  ┊74┊        line.delete();
 ┊68┊75┊      });
 ┊69┊76┊    });
 ┊70┊77┊
```
```diff
@@ -72,6 +79,7 @@
 ┊72┊79┊      it("returns nothing", function() {
 ┊73┊80┊        let line = new Engine.Geometry.Line(10, 10, 10, 15);
 ┊74┊81┊        expect(this.line.getLineIntersection(line)).toBeUndefined();
+┊  ┊82┊        line.delete();
 ┊75┊83┊      });
 ┊76┊84┊    });
 ┊77┊85┊  });
```

##### Changed resources/scripts/specs/engine/geometry/polygon.js
```diff
@@ -35,6 +35,8 @@
 ┊35┊35┊          { x: 5, y: 4 },
 ┊36┊36┊          { x: 0, y: 1 }
 ┊37┊37┊        ]);
+┊  ┊38┊
+┊  ┊39┊        line.delete();
 ┊38┊40┊      });
 ┊39┊41┊    });
 ┊40┊42┊
```
```diff
@@ -43,6 +45,8 @@
 ┊43┊45┊        let line = new Engine.Geometry.Line(10, 11, 15, 14);
 ┊44┊46┊
 ┊45┊47┊        expect(this.polygon.getLineIntersection(line)).toBeUndefined();
+┊  ┊48┊
+┊  ┊49┊        line.delete();
 ┊46┊50┊      });
 ┊47┊51┊    });
 ┊48┊52┊  });
```
[}]: #

Since our game also uses polygons, which is made of an abstract number of lines, its test-data needs to be disposed as well. First, we will add a `delete` method to the polygon class, which will simply go though all its bounds and delete each of its lines:

[{]: <helper> (diff_step 7.17)
#### Step 7.17: Add polygon deletion method

##### Changed resources/scripts/engine/geometry/polygon.js
```diff
@@ -5,6 +5,10 @@
 ┊ 5┊ 5┊    this.bounds = bounds.map(coords => new Engine.Geometry.Line(...coords));
 ┊ 6┊ 6┊  }
 ┊ 7┊ 7┊
+┊  ┊ 8┊  delete() {
+┊  ┊ 9┊    this.bounds.forEach(bound => bound.delete());
+┊  ┊10┊  }
+┊  ┊11┊
 ┊ 8┊12┊  // Returns if polygon has given point
 ┊ 9┊13┊  hasPoint(x, y) {
 ┊10┊14┊    // Run check for each bound
```
[}]: #

Now we can conveniently delete unused polygons in the tests:

[{]: <helper> (diff_step 7.18)
#### Step 7.18: Delete polygon instances in tests

##### Changed resources/scripts/specs/engine/geometry/polygon.js
```diff
@@ -8,6 +8,10 @@
 ┊ 8┊ 8┊    );
 ┊ 9┊ 9┊  });
 ┊10┊10┊
+┊  ┊11┊  afterEach(function () {
+┊  ┊12┊    this.polygon.delete();
+┊  ┊13┊  });
+┊  ┊14┊
 ┊11┊15┊  describe("hasPoint method", function() {
 ┊12┊16┊    describe("given contained point", function() {
 ┊13┊17┊      it("returns true", function() {
```
[}]: #

Moving on, we have the circle class to transform. The process is almost the identical to how we transformed the line class, so it's gonna be way easier now. We first start by translating our code from JavaScript to C++:

[{]: <helper> (diff_step 7.19)
#### Step 7.19: Add base circle CPP module

##### Added resources/cpp/src/geometry/circle.cpp
```diff
@@ -0,0 +1,202 @@
+┊   ┊  1┊
+┊   ┊  2┊#include <algorithm>
+┊   ┊  3┊#include <cmath>
+┊   ┊  4┊#include <vector>
+┊   ┊  5┊#include "../nullable.h"
+┊   ┊  6┊#include "../utils.h"
+┊   ┊  7┊#include "point.h"
+┊   ┊  8┊#include "line.h"
+┊   ┊  9┊
+┊   ┊ 10┊namespace geometry {
+┊   ┊ 11┊  // x - The x value of the circle's center
+┊   ┊ 12┊  // y - The y value of the circle's center
+┊   ┊ 13┊  // r - The radius of the center
+┊   ┊ 14┊  // rad1 - The first radian of the circle, not necessarily its beginning
+┊   ┊ 15┊  // rad2 - The second radian of the circle, not necessarily its beginning
+┊   ┊ 16┊  Circle::Circle(double x, double y, double r, double rad1, double rad2) {
+┊   ┊ 17┊    _x = utils::trim(x, 9);
+┊   ┊ 18┊    _y = utils::trim(y, 9);
+┊   ┊ 19┊    _r = utils::trim(r, 9);
+┊   ┊ 20┊
+┊   ┊ 21┊    // Trimming mode is done based on which radian represents the ending and which radian
+┊   ┊ 22┊    // represents the ending
+┊   ┊ 23┊    if (rad1 > rad2) {
+┊   ┊ 24┊      _rad1 = utils::trim(rad1, 9, "floor");
+┊   ┊ 25┊      _rad2 = utils::trim(rad2, 9, "ceil");
+┊   ┊ 26┊    }
+┊   ┊ 27┊    else {
+┊   ┊ 28┊      _rad1 = utils::trim(rad1, 9, "ceil");
+┊   ┊ 29┊      _rad2 = utils::trim(rad2, 9, "floor");
+┊   ┊ 30┊    }
+┊   ┊ 31┊  }
+┊   ┊ 32┊
+┊   ┊ 33┊  // Gets the matching x value for the given radian
+┊   ┊ 34┊  Nullable<double> Circle::getMatchingX(double rad) {
+┊   ┊ 35┊    if (!utils::chain(rad)->trim(9)->isBetween(_rad1, _rad2)->result()) {
+┊   ┊ 36┊      return Nullable<double>();
+┊   ┊ 37┊    }
+┊   ┊ 38┊
+┊   ┊ 39┊    return Nullable<double>(utils::trim((_r * std::cos(rad)) + _x, 9));
+┊   ┊ 40┊  }
+┊   ┊ 41┊
+┊   ┊ 42┊  // Gets the matching y value for the given radian
+┊   ┊ 43┊  Nullable<double> Circle::getMatchingY(double rad) {
+┊   ┊ 44┊    if (!utils::chain(rad)->trim(9)->isBetween(_rad1, _rad2)->result()) {
+┊   ┊ 45┊      return Nullable<double>();
+┊   ┊ 46┊    }
+┊   ┊ 47┊
+┊   ┊ 48┊    return Nullable<double>(utils::trim((_r * std::sin(rad)) + _y, 9));
+┊   ┊ 49┊  }
+┊   ┊ 50┊
+┊   ┊ 51┊  // Gets the matching point for the given radian
+┊   ┊ 52┊  Nullable<Point> Circle::getMatchingPoint(double rad) {
+┊   ┊ 53┊    if (!utils::isBetween(rad, _rad1, _rad2)) {
+┊   ┊ 54┊      return Nullable<Point>();
+┊   ┊ 55┊    }
+┊   ┊ 56┊
+┊   ┊ 57┊    return Nullable<Point>({
+┊   ┊ 58┊      utils::trim((_r * std::cos(rad)) + _x, 9),
+┊   ┊ 59┊      utils::trim((_r * std::sin(rad)) + _y, 9)
+┊   ┊ 60┊    });
+┊   ┊ 61┊  }
+┊   ┊ 62┊
+┊   ┊ 63┊  // Gets the matching radian for the given point
+┊   ┊ 64┊  Nullable<double> Circle::getMatchingRad(double x, double y) {
+┊   ┊ 65┊    double rad = std::atan2(y - _y, x - _x);
+┊   ┊ 66┊
+┊   ┊ 67┊    // If calculated radian is in circle's radian range, return it
+┊   ┊ 68┊    if (!std::isnan(rad) && utils::isBetween(rad, _rad1, _rad2)) {
+┊   ┊ 69┊      return Nullable<double>(rad);
+┊   ┊ 70┊    }
+┊   ┊ 71┊
+┊   ┊ 72┊    // The calculated radian can still be in the circle's radian range in case one
+┊   ┊ 73┊    // of the radians is greater than 2 PIEs
+┊   ┊ 74┊    double greatestRad = std::abs(_rad1) > std::abs(_rad2) ? _rad1 : _rad2;
+┊   ┊ 75┊
+┊   ┊ 76┊    // Check if the absolute radian is in the circle's radian range
+┊   ┊ 77┊    if (utils::chain(rad + (2 * M_PI * std::floor(greatestRad / (2 * M_PI))))
+┊   ┊ 78┊        ->trim(9)->isBetween(_rad1, _rad2)->result() ||
+┊   ┊ 79┊        utils::chain(rad + (2 * M_PI * std::ceil(greatestRad / (2 * M_PI))))
+┊   ┊ 80┊        ->trim(9)->isBetween(_rad1, _rad2)->result()) {
+┊   ┊ 81┊      return Nullable<double>(rad);
+┊   ┊ 82┊    }
+┊   ┊ 83┊
+┊   ┊ 84┊    return Nullable<double>();
+┊   ┊ 85┊  }
+┊   ┊ 86┊
+┊   ┊ 87┊  // Returns if circle has given points
+┊   ┊ 88┊  bool Circle::hasPoint(double x, double y) {
+┊   ┊ 89┊    return getMatchingRad(x, y).hasValue();
+┊   ┊ 90┊  }
+┊   ┊ 91┊
+┊   ┊ 92┊  // circle - circle intersection method
+┊   ┊ 93┊  Nullable<std::vector<Point>> Circle::getIntersection(Circle circle) {
+┊   ┊ 94┊    double dx = circle._x - _x;
+┊   ┊ 95┊    double dy = circle._y - _y;
+┊   ┊ 96┊    double d = std::sqrt(std::pow(dx, 2) + std::pow(dy, 2));
+┊   ┊ 97┊
+┊   ┊ 98┊    if (d > _r + circle._r ||
+┊   ┊ 99┊       d < std::abs(_r - circle._r)) {
+┊   ┊100┊      return Nullable<std::vector<Point>>();
+┊   ┊101┊    }
+┊   ┊102┊
+┊   ┊103┊    double a = ((std::pow(_r, 2) - std::pow(circle._r, 2)) + std::pow(d, 2)) / (2 * d);
+┊   ┊104┊    double x = _x + ((dx * a) / d);
+┊   ┊105┊    double y = _y + ((dy * a) / d);
+┊   ┊106┊    double h = std::sqrt(std::pow(_r, 2) - std::pow(a, 2));
+┊   ┊107┊    double rx = (- dy * h) / d;
+┊   ┊108┊    double ry = (dx * h) / d;
+┊   ┊109┊
+┊   ┊110┊    std::vector<Point> interPoints(2);
+┊   ┊111┊    interPoints.at(0).x = x + rx;
+┊   ┊112┊    interPoints.at(0).y = y + ry;
+┊   ┊113┊    interPoints.at(1).x = x - rx;
+┊   ┊114┊    interPoints.at(1).y = y - ry;
+┊   ┊115┊
+┊   ┊116┊    for (unsigned i = 0; i < interPoints.size(); i++) {
+┊   ┊117┊      Point& point = interPoints.at(i);
+┊   ┊118┊      point.x = utils::trim(point.x, 9);
+┊   ┊119┊      point.y = utils::trim(point.y, 9);
+┊   ┊120┊    }
+┊   ┊121┊
+┊   ┊122┊    auto pointsBegin = std::unique(interPoints.begin(), interPoints.end(),
+┊   ┊123┊      [](Point pointA, Point pointB) {
+┊   ┊124┊        return pointA.x == pointB.x && pointA.y == pointB.y;
+┊   ┊125┊      }
+┊   ┊126┊    );
+┊   ┊127┊
+┊   ┊128┊    interPoints.erase(pointsBegin, interPoints.end());
+┊   ┊129┊
+┊   ┊130┊    std::vector<Circle> circles = { *this, circle };
+┊   ┊131┊
+┊   ┊132┊    std::for_each(circles.begin(), circles.end(), [&interPoints](Circle circle) {
+┊   ┊133┊      auto pointsBegin = std::remove_if(interPoints.begin(), interPoints.end(),
+┊   ┊134┊        [&circle](Point point) {
+┊   ┊135┊          return !circle.hasPoint(point.x, point.y);
+┊   ┊136┊        }
+┊   ┊137┊      );
+┊   ┊138┊
+┊   ┊139┊      interPoints.erase(pointsBegin, interPoints.end());
+┊   ┊140┊    });
+┊   ┊141┊
+┊   ┊142┊    if (interPoints.size()) {
+┊   ┊143┊      return Nullable<std::vector<Point>>(interPoints);
+┊   ┊144┊    }
+┊   ┊145┊
+┊   ┊146┊    return Nullable<std::vector<Point>>();
+┊   ┊147┊  }
+┊   ┊148┊
+┊   ┊149┊  // circle - line intersection method
+┊   ┊150┊  Nullable<std::vector<Point>> Circle::getIntersection(Line line) {
+┊   ┊151┊    double x1 = line._x1 - _x;
+┊   ┊152┊    double x2 = line._x2 - _x;
+┊   ┊153┊    double y1 = line._y1 - _y;
+┊   ┊154┊    double y2 = line._y2 - _y;
+┊   ┊155┊    double dx = x2 - x1;
+┊   ┊156┊    double dy = y2 - y1;
+┊   ┊157┊    double d = std::sqrt(std::pow(dx, 2) + std::pow(dy, 2));
+┊   ┊158┊    double h = (x1 * y2) - (x2 * y1);
+┊   ┊159┊    double delta = (std::pow(_r, 2) * std::pow(d, 2)) - std::pow(h, 2);
+┊   ┊160┊
+┊   ┊161┊    if (delta < 0) Nullable<std::vector<Point>>();
+┊   ┊162┊
+┊   ┊163┊    double sign = dy / std::abs(dy); if (std::isnan(sign)) sign = 1;
+┊   ┊164┊    double sqrtx = sign * dx * std::sqrt(delta);
+┊   ┊165┊    double sqrty = std::abs(dy) * std::sqrt(delta);
+┊   ┊166┊
+┊   ┊167┊    std::vector<Point> interPoints(2);
+┊   ┊168┊    interPoints.at(0).x = (((h * dy) + sqrtx) / std::pow(d, 2)) + _x;
+┊   ┊169┊    interPoints.at(0).y = (((-h * dx) + sqrty) / std::pow(d, 2)) + _y;
+┊   ┊170┊    interPoints.at(1).x = (((h * dy) - sqrtx) / std::pow(d, 2)) + _x;
+┊   ┊171┊    interPoints.at(1).y = (((-h * dx) - sqrty) / std::pow(d, 2)) + _y;
+┊   ┊172┊
+┊   ┊173┊    for (unsigned i = 0; i < interPoints.size(); i++) {
+┊   ┊174┊      Point& point = interPoints.at(i);
+┊   ┊175┊      point.x = utils::trim(point.x, 9);
+┊   ┊176┊      point.y = utils::trim(point.y, 9);
+┊   ┊177┊    }
+┊   ┊178┊
+┊   ┊179┊    auto pointsBegin = std::remove_if(interPoints.begin(), interPoints.end(),
+┊   ┊180┊      [this, &line](Point point) {
+┊   ┊181┊        return !hasPoint(point.x, point.y) ||
+┊   ┊182┊          !line.boundsHavePoint(point.x, point.y);
+┊   ┊183┊      }
+┊   ┊184┊    );
+┊   ┊185┊
+┊   ┊186┊    interPoints.erase(pointsBegin, interPoints.end());
+┊   ┊187┊
+┊   ┊188┊    pointsBegin = std::unique(interPoints.begin(), interPoints.end(),
+┊   ┊189┊      [](Point pointA, Point pointB) {
+┊   ┊190┊        return pointA.x == pointB.x && pointA.y == pointB.y;
+┊   ┊191┊      }
+┊   ┊192┊    );
+┊   ┊193┊
+┊   ┊194┊    interPoints.erase(pointsBegin, interPoints.end());
+┊   ┊195┊
+┊   ┊196┊    if (interPoints.size()) {
+┊   ┊197┊      return Nullable<std::vector<Point>>(interPoints);
+┊   ┊198┊    }
+┊   ┊199┊
+┊   ┊200┊    return Nullable<std::vector<Point>>();
+┊   ┊201┊  }
+┊   ┊202┊}🚫↵
```

##### Added resources/cpp/src/geometry/circle.h
```diff
@@ -0,0 +1,35 @@
+┊  ┊ 1┊#pragma once
+┊  ┊ 2┊
+┊  ┊ 3┊#include <vector>
+┊  ┊ 4┊#include "../nullable.h"
+┊  ┊ 5┊#include "point.h"
+┊  ┊ 6┊#include "line.h"
+┊  ┊ 7┊
+┊  ┊ 8┊namespace geometry {
+┊  ┊ 9┊  class Line;
+┊  ┊10┊
+┊  ┊11┊  class Circle {
+┊  ┊12┊  public:
+┊  ┊13┊    double _x;
+┊  ┊14┊    double _y;
+┊  ┊15┊    double _r;
+┊  ┊16┊    double _rad1;
+┊  ┊17┊    double _rad2;
+┊  ┊18┊
+┊  ┊19┊    Circle(double x, double y, double r, double rad1, double rad2);
+┊  ┊20┊
+┊  ┊21┊    Nullable<double> getMatchingX(double rad);
+┊  ┊22┊
+┊  ┊23┊    Nullable<double> getMatchingY(double rad);
+┊  ┊24┊
+┊  ┊25┊    Nullable<Point> getMatchingPoint(double rad);
+┊  ┊26┊
+┊  ┊27┊    Nullable<double> getMatchingRad(double x, double y);
+┊  ┊28┊
+┊  ┊29┊    bool hasPoint(double x, double y);
+┊  ┊30┊
+┊  ┊31┊    Nullable<std::vector<Point>> getIntersection(Circle circle);
+┊  ┊32┊
+┊  ┊33┊    Nullable<std::vector<Point>> getIntersection(Line line);
+┊  ┊34┊  };
+┊  ┊35┊}🚫↵
```

##### Changed resources/cpp/src/index.cpp
```diff
@@ -1,3 +1,4 @@
 ┊1┊1┊#include "nullable.cpp"
 ┊2┊2┊#include "utils.cpp"
-┊3┊ ┊#include "geometry/line.cpp"🚫↵
+┊ ┊3┊#include "geometry/line.cpp"
+┊ ┊4┊#include "geometry/circle.cpp"🚫↵
```
[}]: #

Second, we need to wrap our code using EMBind:

[{]: <helper> (diff_step 7.20)
#### Step 7.20: EMBind CPP circle

##### Changed resources/cpp/post.js
```diff
@@ -7,7 +7,8 @@
 ┊ 7┊ 7┊  },
 ┊ 8┊ 8┊
 ┊ 9┊ 9┊  Geometry: {
-┊10┊  ┊    Line: Module.geometry_line
+┊  ┊10┊    Line: Module.geometry_line,
+┊  ┊11┊    Circle: Module.geometry_circle
 ┊11┊12┊  }
 ┊12┊13┊};
 ┊13┊14┊
```

##### Changed resources/cpp/src/geometry/circle.cpp
```diff
@@ -1,7 +1,8 @@
-┊1┊ ┊
 ┊2┊1┊#include <algorithm>
 ┊3┊2┊#include <cmath>
 ┊4┊3┊#include <vector>
+┊ ┊4┊#include <emscripten/bind.h>
+┊ ┊5┊#include <emscripten/val.h>
 ┊5┊6┊#include "../nullable.h"
 ┊6┊7┊#include "../utils.h"
 ┊7┊8┊#include "point.h"
```
```diff
@@ -199,4 +200,107 @@
 ┊199┊200┊
 ┊200┊201┊    return Nullable<std::vector<Point>>();
 ┊201┊202┊  }
+┊   ┊203┊
+┊   ┊204┊  emscripten::val EMCircle::getMatchingX(double y) {
+┊   ┊205┊    Nullable<double> nullableX = Circle::getMatchingX(y);
+┊   ┊206┊    return nullableX.hasValue() ?
+┊   ┊207┊      emscripten::val(nullableX.getValue()) :
+┊   ┊208┊      emscripten::val::undefined();
+┊   ┊209┊  }
+┊   ┊210┊
+┊   ┊211┊  emscripten::val EMCircle::getMatchingY(double x) {
+┊   ┊212┊    Nullable<double> nullableY = Circle::getMatchingY(x);
+┊   ┊213┊    return nullableY.hasValue() ?
+┊   ┊214┊      emscripten::val(nullableY.getValue()) :
+┊   ┊215┊      emscripten::val::undefined();
+┊   ┊216┊  }
+┊   ┊217┊
+┊   ┊218┊  emscripten::val EMCircle::getMatchingPoint(double rad) {
+┊   ┊219┊    Nullable<Point> nullablePoint = Circle::getMatchingPoint(rad);
+┊   ┊220┊
+┊   ┊221┊    if (nullablePoint.isNull()) return emscripten::val::undefined();
+┊   ┊222┊
+┊   ┊223┊    Point point = nullablePoint.getValue();
+┊   ┊224┊    emscripten::val emPoint = emscripten::val::object();
+┊   ┊225┊    emPoint.set("x", emscripten::val(point.x));
+┊   ┊226┊    emPoint.set("y", emscripten::val(point.y));
+┊   ┊227┊    return emPoint;
+┊   ┊228┊  }
+┊   ┊229┊
+┊   ┊230┊  emscripten::val EMCircle::getMatchingRad(double x, double y) {
+┊   ┊231┊    Nullable<double> nullableRad = Circle::getMatchingRad(x, y);
+┊   ┊232┊    return nullableRad.hasValue() ?
+┊   ┊233┊      emscripten::val(nullableRad.getValue()) :
+┊   ┊234┊      emscripten::val::undefined();
+┊   ┊235┊  }
+┊   ┊236┊
+┊   ┊237┊  emscripten::val EMCircle::getIntersection(EMLine emLine) {
+┊   ┊238┊    Line line = Line(emLine._x1, emLine._y1, emLine._x2, emLine._y2);
+┊   ┊239┊    Nullable<std::vector<Point>> nullablePoints = Circle::getIntersection(line);
+┊   ┊240┊
+┊   ┊241┊    if (nullablePoints.isNull()) return emscripten::val::undefined();
+┊   ┊242┊
+┊   ┊243┊    std::vector<Point> points = nullablePoints.getValue();
+┊   ┊244┊    emscripten::val emPoints = emscripten::val::array();
+┊   ┊245┊
+┊   ┊246┊    for (unsigned i = 0; i < points.size(); i++) {
+┊   ┊247┊      Point point = points.at(i);
+┊   ┊248┊      emscripten::val emPoint = emscripten::val::object();
+┊   ┊249┊      emPoint.set("x", emscripten::val(point.x));
+┊   ┊250┊      emPoint.set("y", emscripten::val(point.y));
+┊   ┊251┊      emPoints.set(i, emPoint);
+┊   ┊252┊    }
+┊   ┊253┊
+┊   ┊254┊    return emPoints;
+┊   ┊255┊  }
+┊   ┊256┊
+┊   ┊257┊  emscripten::val EMCircle::getIntersection(EMCircle emCircle) {
+┊   ┊258┊    Circle circle = Circle(
+┊   ┊259┊      emCircle._x, emCircle._y, emCircle._r, emCircle._rad1, emCircle._rad2
+┊   ┊260┊    );
+┊   ┊261┊    Nullable<std::vector<Point>> nullablePoints = Circle::getIntersection(circle);
+┊   ┊262┊
+┊   ┊263┊    if (nullablePoints.isNull()) return emscripten::val::undefined();
+┊   ┊264┊
+┊   ┊265┊    std::vector<Point> points = nullablePoints.getValue();
+┊   ┊266┊    emscripten::val emPoints = emscripten::val::array();
+┊   ┊267┊
+┊   ┊268┊    for (unsigned i = 0; i < points.size(); i++) {
+┊   ┊269┊      Point point = points.at(i);
+┊   ┊270┊      emscripten::val emPoint = emscripten::val::object();
+┊   ┊271┊      emPoint.set("x", emscripten::val(point.x));
+┊   ┊272┊      emPoint.set("y", emscripten::val(point.y));
+┊   ┊273┊      emPoints.set(i, emPoint);
+┊   ┊274┊    }
+┊   ┊275┊
+┊   ┊276┊    return emPoints;
+┊   ┊277┊  }
+┊   ┊278┊}
+┊   ┊279┊
+┊   ┊280┊EMSCRIPTEN_BINDINGS(geometry_circle_module) {
+┊   ┊281┊  emscripten::class_<geometry::Circle>("geometry_circle_base")
+┊   ┊282┊    .constructor<double, double, double, double, double>()
+┊   ┊283┊    .property<double>("x", &geometry::Circle::_x)
+┊   ┊284┊    .property<double>("y", &geometry::Circle::_y)
+┊   ┊285┊    .property<double>("r", &geometry::Circle::_r)
+┊   ┊286┊    .property<double>("rad1", &geometry::Circle::_rad1)
+┊   ┊287┊    .property<double>("rad2", &geometry::Circle::_rad2)
+┊   ┊288┊    .function("hasPoint", &geometry::Circle::hasPoint);
+┊   ┊289┊
+┊   ┊290┊  emscripten::class_<geometry::EMCircle, emscripten::base<geometry::Circle>>("geometry_circle")
+┊   ┊291┊    .constructor<double, double, double, double, double>()
+┊   ┊292┊    .function("getX", &geometry::EMCircle::getMatchingX)
+┊   ┊293┊    .function("getY", &geometry::EMCircle::getMatchingY)
+┊   ┊294┊    .function("getPoint", &geometry::EMCircle::getMatchingPoint)
+┊   ┊295┊    .function("getRad", &geometry::EMCircle::getMatchingRad)
+┊   ┊296┊    .function("getLineIntersection",
+┊   ┊297┊      emscripten::select_overload<emscripten::val(geometry::EMLine)>(
+┊   ┊298┊        &geometry::EMCircle::getIntersection
+┊   ┊299┊      )
+┊   ┊300┊    )
+┊   ┊301┊    .function("getCircleIntersection",
+┊   ┊302┊      emscripten::select_overload<emscripten::val(geometry::EMCircle)>(
+┊   ┊303┊        &geometry::EMCircle::getIntersection
+┊   ┊304┊      )
+┊   ┊305┊    );
 ┊202┊306┊}🚫↵
```

##### Changed resources/cpp/src/geometry/circle.h
```diff
@@ -1,12 +1,14 @@
 ┊ 1┊ 1┊#pragma once
 ┊ 2┊ 2┊
 ┊ 3┊ 3┊#include <vector>
+┊  ┊ 4┊#include <emscripten/val.h>
 ┊ 4┊ 5┊#include "../nullable.h"
 ┊ 5┊ 6┊#include "point.h"
 ┊ 6┊ 7┊#include "line.h"
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊namespace geometry {
 ┊ 9┊10┊  class Line;
+┊  ┊11┊  class EMLine;
 ┊10┊12┊
 ┊11┊13┊  class Circle {
 ┊12┊14┊  public:
```
```diff
@@ -32,4 +34,21 @@
 ┊32┊34┊
 ┊33┊35┊    Nullable<std::vector<Point>> getIntersection(Line line);
 ┊34┊36┊  };
+┊  ┊37┊
+┊  ┊38┊  class EMCircle : public Circle {
+┊  ┊39┊  public:
+┊  ┊40┊    using Circle::Circle;
+┊  ┊41┊
+┊  ┊42┊    emscripten::val getMatchingX(double y);
+┊  ┊43┊
+┊  ┊44┊    emscripten::val getMatchingY(double x);
+┊  ┊45┊
+┊  ┊46┊    emscripten::val getMatchingPoint(double rad);
+┊  ┊47┊
+┊  ┊48┊    emscripten::val getMatchingRad(double x, double y);
+┊  ┊49┊
+┊  ┊50┊    emscripten::val getIntersection(EMLine line);
+┊  ┊51┊
+┊  ┊52┊    emscripten::val getIntersection(EMCircle circle);
+┊  ┊53┊  };
 ┊35┊54┊}🚫↵
```
[}]: #

And finally, we will extend the C++ in our JavaScript circle:

[{]: <helper> (diff_step 7.21)
#### Step 7.21: Extend CPP circle class

##### Changed resources/scripts/engine/geometry/circle.js
```diff
@@ -1,83 +1,9 @@
-┊ 1┊  ┊Engine.Geometry.Circle = class Circle {
-┊ 2┊  ┊  // x - The x value of the circle's center
-┊ 3┊  ┊  // y - The y value of the circle's center
-┊ 4┊  ┊  // r - The radius of the center
-┊ 5┊  ┊  // rad1 - The first radian of the circle, not necessarily its beginning
-┊ 6┊  ┊  // rad2 - The second radian of the circle, not necessarily its beginning
-┊ 7┊  ┊  constructor(x, y, r, rad1, rad2) {
-┊ 8┊  ┊    this.x = Utils.trim(x, 9);
-┊ 9┊  ┊    this.y = Utils.trim(y, 9);
-┊10┊  ┊    this.r = Utils.trim(r, 9);
-┊11┊  ┊
-┊12┊  ┊    // Trimming mode is done based on which radian represents the ending and which radian
-┊13┊  ┊    // represents the ending
-┊14┊  ┊    if (rad1 > rad2) {
-┊15┊  ┊      this.rad1 = Utils.trim(rad1, 9, "floor");
-┊16┊  ┊      this.rad2 = Utils.trim(rad2, 9, "ceil");
-┊17┊  ┊    }
-┊18┊  ┊    else {
-┊19┊  ┊      this.rad1 = Utils.trim(rad1, 9, "ceil");
-┊20┊  ┊      this.rad2 = Utils.trim(rad2, 9, "floor");
-┊21┊  ┊    }
-┊22┊  ┊  }
-┊23┊  ┊
+┊  ┊ 1┊Engine.Geometry.Circle = class Circle extends Utils.proxy(CPP.Geometry.Circle) {
 ┊24┊ 2┊  // Draws the circle on the given context
 ┊25┊ 3┊  draw(context) {
 ┊26┊ 4┊    context.arc(this.x, this.y, this.r, this.rad1, this.rad2);
 ┊27┊ 5┊  }
 ┊28┊ 6┊
-┊29┊  ┊  // Gets the matching x value for the given radian
-┊30┊  ┊  getX(rad) {
-┊31┊  ┊    if (!Utils(rad).trim(9).isBetween(this.rad1, this.rad2).value()) return;
-┊32┊  ┊    return Utils.trim((this.r * Math.cos(rad)) + this.x, 9);
-┊33┊  ┊  }
-┊34┊  ┊
-┊35┊  ┊  // Gets the matching y value for the given radian
-┊36┊  ┊  getY(rad) {
-┊37┊  ┊    if (!Utils(rad).trim(9).isBetween(this.rad1, this.rad2).value()) return;
-┊38┊  ┊    return Utils.trim((this.r * Math.sin(rad)) + this.y, 9);
-┊39┊  ┊  }
-┊40┊  ┊
-┊41┊  ┊  // Gets the matching point for the given radian
-┊42┊  ┊  getPoint(rad) {
-┊43┊  ┊    if (!Utils.isBetween(rad, this.rad1, this.rad2)) return;
-┊44┊  ┊
-┊45┊  ┊    return {
-┊46┊  ┊      x: Utils.trim((this.r * Math.cos(rad)) + this.x, 9),
-┊47┊  ┊      y: Utils.trim((this.r * Math.sin(rad)) + this.y, 9)
-┊48┊  ┊    };
-┊49┊  ┊  }
-┊50┊  ┊
-┊51┊  ┊  // Gets the matching radian for the given point
-┊52┊  ┊  getRad(x, y) {
-┊53┊  ┊    let rad = Math.atan2(y - this.y, x - this.x);
-┊54┊  ┊
-┊55┊  ┊    // If calculated radian is in circle's radian range, return it
-┊56┊  ┊    if (rad != null && Utils.isBetween(rad, this.rad1, this.rad2)) {
-┊57┊  ┊      return rad;
-┊58┊  ┊    }
-┊59┊  ┊
-┊60┊  ┊    // The calculated radian can still be in the circle's radian range in case one
-┊61┊  ┊    // of the radians is greater than 2 PIEs
-┊62┊  ┊    if (Math.abs(this.rad1) > Math.abs(this.rad2)) {
-┊63┊  ┊      var greatestRad = this.rad1;
-┊64┊  ┊    }
-┊65┊  ┊    else {
-┊66┊  ┊      var greatestRad = this.rad2;
-┊67┊  ┊    }
-┊68┊  ┊
-┊69┊  ┊    // Check if the absolute radian is in the circle's radian range
-┊70┊  ┊    if (Utils(rad + (2 * Math.PI * Math.floor(greatestRad / (2 * Math.PI)))).trim(9).isBetween(this.rad1, this.rad2).value() ||
-┊71┊  ┊        Utils(rad + (2 * Math.PI * Math.ceil(greatestRad / (2 * Math.PI)))).trim(9).isBetween(this.rad1, this.rad2).value()) {
-┊72┊  ┊      return rad;
-┊73┊  ┊    }
-┊74┊  ┊  }
-┊75┊  ┊
-┊76┊  ┊  // Returns if circle has given points
-┊77┊  ┊  hasPoint(x, y) {
-┊78┊  ┊    return this.getRad(x, y) != null;
-┊79┊  ┊  }
-┊80┊  ┊
 ┊81┊ 7┊  getIntersection(shape) {
 ┊82┊ 8┊    if (shape instanceof Engine.Geometry.Line)
 ┊83┊ 9┊      return this.getLineIntersection(shape);
```
```diff
@@ -87,86 +13,6 @@
 ┊ 87┊ 13┊      return this.getPolygonIntersection(shape);
 ┊ 88┊ 14┊  }
 ┊ 89┊ 15┊
-┊ 90┊   ┊  // circle - circle intersection method
-┊ 91┊   ┊  getCircleIntersection(circle) {
-┊ 92┊   ┊    let dx = circle.x - this.x;
-┊ 93┊   ┊    let dy = circle.y - this.y;
-┊ 94┊   ┊    let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
-┊ 95┊   ┊
-┊ 96┊   ┊    if (d > this.r + circle.r ||
-┊ 97┊   ┊       d < Math.abs(this.r - circle.r)) {
-┊ 98┊   ┊      return;
-┊ 99┊   ┊    }
-┊100┊   ┊
-┊101┊   ┊    let a = ((Math.pow(this.r, 2) - Math.pow(circle.r, 2)) + Math.pow(d, 2)) / (2 * d);
-┊102┊   ┊    let x = this.x + ((dx * a) / d);
-┊103┊   ┊    let y = this.y + ((dy * a) / d);
-┊104┊   ┊    let h = Math.sqrt(Math.pow(this.r, 2) - Math.pow(a, 2));
-┊105┊   ┊    let rx = (- dy * h) / d;
-┊106┊   ┊    let ry = (dx * h) / d;
-┊107┊   ┊
-┊108┊   ┊    let interPoints = [
-┊109┊   ┊      {
-┊110┊   ┊        x: x + rx,
-┊111┊   ┊        y: y + ry
-┊112┊   ┊      },
-┊113┊   ┊      {
-┊114┊   ┊        x: x - rx,
-┊115┊   ┊        y: y - ry
-┊116┊   ┊      }
-┊117┊   ┊    ]
-┊118┊   ┊    .map(point => ({
-┊119┊   ┊        x: Utils.trim(point.x, 9),
-┊120┊   ┊        y: Utils.trim(point.y, 9)
-┊121┊   ┊     }));
-┊122┊   ┊
-┊123┊   ┊    interPoints = _.uniq(interPoints, point => `(${point.x}, ${point.y})`);
-┊124┊   ┊
-┊125┊   ┊    [this, circle].forEach(function(circle) {
-┊126┊   ┊      interPoints = interPoints.filter(point => circle.hasPoint(point.x, point.y));
-┊127┊   ┊    });
-┊128┊   ┊
-┊129┊   ┊    if (interPoints.length > 0) return interPoints;
-┊130┊   ┊  }
-┊131┊   ┊
-┊132┊   ┊  // circle - line intersection method
-┊133┊   ┊  getLineIntersection(line) {
-┊134┊   ┊    let x1 = line.x1 - this.x;
-┊135┊   ┊    let x2 = line.x2 - this.x;
-┊136┊   ┊    let y1 = line.y1 - this.y;
-┊137┊   ┊    let y2 = line.y2 - this.y;
-┊138┊   ┊    let dx = x2 - x1;
-┊139┊   ┊    let dy = y2 - y1;
-┊140┊   ┊    let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
-┊141┊   ┊    let h = (x1 * y2) - (x2 * y1);
-┊142┊   ┊    let delta = (Math.pow(this.r, 2) * Math.pow(d, 2)) - Math.pow(h, 2);
-┊143┊   ┊
-┊144┊   ┊    if (delta < 0) return;
-┊145┊   ┊
-┊146┊   ┊    let interPoints = [
-┊147┊   ┊      {
-┊148┊   ┊        x: (((h * dy) + (((dy / Math.abs(dy)) || 1) * dx * Math.sqrt(delta))) / Math.pow(d, 2)) + this.x,
-┊149┊   ┊        y: (((-h * dx) + (Math.abs(dy) * Math.sqrt(delta))) / Math.pow(d, 2)) + this.y
-┊150┊   ┊      },
-┊151┊   ┊      {
-┊152┊   ┊        x: (((h * dy) - (((dy / Math.abs(dy)) || 1) * dx * Math.sqrt(delta))) / Math.pow(d, 2)) + this.x,
-┊153┊   ┊        y: (((-h * dx) - (Math.abs(dy) * Math.sqrt(delta))) / Math.pow(d, 2)) + this.y
-┊154┊   ┊      }
-┊155┊   ┊    ]
-┊156┊   ┊    .map(point => ({
-┊157┊   ┊        x: Utils.trim(point.x, 9),
-┊158┊   ┊        y: Utils.trim(point.y, 9)
-┊159┊   ┊    }))
-┊160┊   ┊    .filter(point => {
-┊161┊   ┊      return this.hasPoint(point.x, point.y) &&
-┊162┊   ┊        line.boundsHavePoint(point.x, point.y);
-┊163┊   ┊    });
-┊164┊   ┊
-┊165┊   ┊    interPoints = _.uniq(interPoints, point => `(${point.x}, ${point.y})`);
-┊166┊   ┊
-┊167┊   ┊    if (interPoints.length > 0) return interPoints;
-┊168┊   ┊  }
-┊169┊   ┊
 ┊170┊ 16┊  // circle - polygon intersection method
 ┊171┊ 17┊  getPolygonIntersection(polygon) {
 ┊172┊ 18┊    return polygon.getCircleIntersection(this);
```
[}]: #

We also need to update the line class to contain a reference to the newly created line-intersection method, so it can be invoked from both a line or a circle bi-directionally:

[{]: <helper> (diff_step 7.22)
#### Step 7.22: Add line-circle intersection method

##### Changed resources/cpp/src/geometry/line.cpp
```diff
@@ -4,6 +4,7 @@
 ┊ 4┊ 4┊#include "../nullable.h"
 ┊ 5┊ 5┊#include "../utils.h"
 ┊ 6┊ 6┊#include "point.h"
+┊  ┊ 7┊#include "circle.h"
 ┊ 7┊ 8┊#include "line.h"
 ┊ 8┊ 9┊
 ┊ 9┊10┊namespace geometry {
```
```diff
@@ -100,6 +101,11 @@
 ┊100┊101┊    return Nullable<Point>();
 ┊101┊102┊  }
 ┊102┊103┊
+┊   ┊104┊  // circle - circle intersection method
+┊   ┊105┊  Nullable<std::vector<Point>> Line::getIntersection(Circle circle) {
+┊   ┊106┊    return circle.getIntersection(*this);
+┊   ┊107┊  }
+┊   ┊108┊
 ┊103┊109┊  emscripten::val EMLine::getMatchingX(double y) {
 ┊104┊110┊    Nullable<double> nullableX = Line::getMatchingX(y);
 ┊105┊111┊    return nullableX.hasValue() ?
```
```diff
@@ -126,6 +132,10 @@
 ┊126┊132┊    emPoint.set("y", emscripten::val(point.y));
 ┊127┊133┊    return emPoint;
 ┊128┊134┊  }
+┊   ┊135┊
+┊   ┊136┊  emscripten::val EMLine::getIntersection(EMCircle emCircle) {
+┊   ┊137┊    return emCircle.getIntersection(*this);
+┊   ┊138┊  }
 ┊129┊139┊}
 ┊130┊140┊
 ┊131┊141┊EMSCRIPTEN_BINDINGS(geometry_line_module) {
```
```diff
@@ -146,5 +156,10 @@
 ┊146┊156┊      emscripten::select_overload<emscripten::val(geometry::EMLine)>(
 ┊147┊157┊        &geometry::EMLine::getIntersection
 ┊148┊158┊      )
+┊   ┊159┊    )
+┊   ┊160┊    .function("getCircleIntersection",
+┊   ┊161┊      emscripten::select_overload<emscripten::val(geometry::EMCircle)>(
+┊   ┊162┊        &geometry::EMLine::getIntersection
+┊   ┊163┊      )
 ┊149┊164┊    );
 ┊150┊165┊}🚫↵
```

##### Changed resources/cpp/src/geometry/line.h
```diff
@@ -4,6 +4,7 @@
 ┊ 4┊ 4┊#include <emscripten/val.h>
 ┊ 5┊ 5┊#include "../nullable.h"
 ┊ 6┊ 6┊#include "point.h"
+┊  ┊ 7┊#include "circle.h"
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊namespace geometry {
 ┊ 9┊10┊  class Circle;
```
```diff
@@ -27,6 +28,8 @@
 ┊27┊28┊    bool boundsHavePoint(double x, double y);
 ┊28┊29┊
 ┊29┊30┊    Nullable<Point> getIntersection(Line line);
+┊  ┊31┊
+┊  ┊32┊    Nullable<std::vector<Point>> getIntersection(Circle circle);
 ┊30┊33┊  };
 ┊31┊34┊
 ┊32┊35┊  class EMLine : public Line {
```
```diff
@@ -38,5 +41,7 @@
 ┊38┊41┊    emscripten::val getMatchingY(double x);
 ┊39┊42┊
 ┊40┊43┊    emscripten::val getIntersection(EMLine line);
+┊  ┊44┊
+┊  ┊45┊    emscripten::val getIntersection(EMCircle circle);
 ┊41┊46┊  };
 ┊42┊47┊}🚫↵
```

##### Changed resources/scripts/engine/geometry/line.js
```diff
@@ -14,11 +14,6 @@
 ┊14┊14┊      return this.getPolygonIntersection(shape);
 ┊15┊15┊  }
 ┊16┊16┊
-┊17┊  ┊  // line - circle intersection method
-┊18┊  ┊  getCircleIntersection(circle) {
-┊19┊  ┊    return circle.getLineIntersection(this);
-┊20┊  ┊  }
-┊21┊  ┊
 ┊22┊17┊  // line - polygon intersection method
 ┊23┊18┊  getPolygonIntersection(polygon) {
 ┊24┊19┊    return polygon.getLineIntersection(this);
```
[}]: #

Now, before running the tests, be sure to disposed unused circle test-data:

[{]: <helper> (diff_step 7.23)
#### Step 7.23: Delete circle instances in tests

##### Changed resources/scripts/specs/engine/geometry/circle.js
```diff
@@ -3,6 +3,10 @@
 ┊ 3┊ 3┊    this.circle = new Engine.Geometry.Circle(1, 1, 5, 0, 1.5 * Math.PI);
 ┊ 4┊ 4┊  });
 ┊ 5┊ 5┊
+┊  ┊ 6┊  afterEach(function () {
+┊  ┊ 7┊    this.circle.delete();
+┊  ┊ 8┊  });
+┊  ┊ 9┊
 ┊ 6┊10┊  describe("getX method", function() {
 ┊ 7┊11┊    describe("given inranged rad", function() {
 ┊ 8┊12┊      it("returns x", function() {
```
```diff
@@ -64,6 +68,8 @@
 ┊64┊68┊          { x: -2, y: -3 },
 ┊65┊69┊          { x: -2, y: 5 }
 ┊66┊70┊        ]);
+┊  ┊71┊
+┊  ┊72┊        circle.delete();
 ┊67┊73┊      });
 ┊68┊74┊    });
 ┊69┊75┊
```
```diff
@@ -74,6 +80,8 @@
 ┊74┊80┊        expect(this.circle.getCircleIntersection(circle)).toEqual([
 ┊75┊81┊          { x: -2, y: 5 }
 ┊76┊82┊        ]);
+┊  ┊83┊
+┊  ┊84┊        circle.delete();
 ┊77┊85┊      });
 ┊78┊86┊    });
 ┊79┊87┊
```
```diff
@@ -84,6 +92,8 @@
 ┊84┊92┊        expect(this.circle.getCircleIntersection(circle)).toEqual([
 ┊85┊93┊          { x: -4, y: 1 }
 ┊86┊94┊        ]);
+┊  ┊95┊
+┊  ┊96┊        circle.delete();
 ┊87┊97┊      });
 ┊88┊98┊    });
 ┊89┊99┊
```
```diff
@@ -91,6 +101,7 @@
 ┊ 91┊101┊      it("returns nothing", function() {
 ┊ 92┊102┊        let circle = new Engine.Geometry.Circle(10, 10, 2, 0, 2 * Math.PI);
 ┊ 93┊103┊        expect(this.circle.getCircleIntersection(circle)).toBeUndefined();
+┊   ┊104┊        circle.delete();
 ┊ 94┊105┊      });
 ┊ 95┊106┊    });
 ┊ 96┊107┊
```
```diff
@@ -98,6 +109,7 @@
 ┊ 98┊109┊      it("nothing", function() {
 ┊ 99┊110┊        let circle = new Engine.Geometry.Circle(1, 1, 2, 0, 2 * Math.PI);
 ┊100┊111┊        expect(this.circle.getCircleIntersection(circle)).toBeUndefined();
+┊   ┊112┊        circle.delete();
 ┊101┊113┊      });
 ┊102┊114┊    });
 ┊103┊115┊  });
```

##### Changed resources/scripts/specs/engine/geometry/polygon.js
```diff
@@ -64,6 +64,8 @@
 ┊64┊64┊          { x: 2, y: 0 },
 ┊65┊65┊          { x: 0, y: 2 }
 ┊66┊66┊        ]);
+┊  ┊67┊
+┊  ┊68┊        circle.delete();
 ┊67┊69┊      });
 ┊68┊70┊    });
 ┊69┊71┊
```
```diff
@@ -74,6 +76,8 @@
 ┊74┊76┊        expect(this.polygon.getCircleIntersection(circle)).toEqual([
 ┊75┊77┊          { x: 2, y: 0 }
 ┊76┊78┊        ]);
+┊  ┊79┊
+┊  ┊80┊        circle.delete();
 ┊77┊81┊      });
 ┊78┊82┊    });
 ┊79┊83┊
```
```diff
@@ -84,6 +88,8 @@
 ┊84┊88┊        expect(this.polygon.getCircleIntersection(circle)).toEqual([
 ┊85┊89┊          { x: 0, y: 3 }
 ┊86┊90┊        ]);
+┊  ┊91┊
+┊  ┊92┊        circle.delete();
 ┊87┊93┊      });
 ┊88┊94┊    });
 ┊89┊95┊
```
```diff
@@ -91,6 +97,7 @@
 ┊ 91┊ 97┊      it("returns nothing", function() {
 ┊ 92┊ 98┊        let circle = new Engine.Geometry.Circle(10, 10, 2, 0, 2 * Math.PI);
 ┊ 93┊ 99┊        expect(this.polygon.getCircleIntersection(circle)).toBeUndefined();
+┊   ┊100┊        circle.delete();
 ┊ 94┊101┊      });
 ┊ 95┊102┊    });
 ┊ 96┊103┊
```
```diff
@@ -98,6 +105,7 @@
 ┊ 98┊105┊      it("nothing", function() {
 ┊ 99┊106┊        let circle = new Engine.Geometry.Circle(2.5, 2.5, 2, 0, 2 * Math.PI);
 ┊100┊107┊        expect(this.polygon.getCircleIntersection(circle)).toBeUndefined();
+┊   ┊108┊        circle.delete();
 ┊101┊109┊      });
 ┊102┊110┊    });
 ┊103┊111┊  });
```
[}]: #

Our C++ code should be finished now, and all the tests should be passing. The only thing left to do would be applying it to our game. Like any other application, we first need to reference the script file so it can be loaded, in this case, the C++ bundle script:

[{]: <helper> (diff_step 7.24)
#### Step 7.24: Load CPP bundle in game

##### Changed views/game.html
```diff
@@ -8,6 +8,7 @@
 ┊ 8┊ 8┊    <script type="text/javascript" src="/libs/underscore.js"></script>
 ┊ 9┊ 9┊
 ┊10┊10┊    <!-- Scripts -->
+┊  ┊11┊    <script type="text/javascript" src="/scripts/cpp.bundle.js"></script>
 ┊11┊12┊    <script type="text/javascript" src="/scripts/utils.js"></script>
 ┊12┊13┊    <script type="text/javascript" src="/scripts/namespaces.js"></script>
 ┊13┊14┊    <script type="text/javascript" src="/scripts/engine/geometry/line.js"></script>
```
[}]: #

And now we need to make sure to dispose the geometry shapes correctly so we won't experience any unnecessary memory leaks. Most of our disposals should go to the snake entity, since it's made out of shapes; So we will add a `delete` method to the snake entity and we will dispose it whenever a match is finished:

[{]: <helper> (diff_step 7.25)
#### Step 7.25: Delete shape instances in game

##### Changed resources/scripts/engine/game.js
```diff
@@ -95,6 +95,7 @@
 ┊ 95┊ 95┊  changeScreen(Screen, ...screenArgs) {
 ┊ 96┊ 96┊    // If there is a screen defined, dispose it first
 ┊ 97┊ 97┊    if (this.screen) {
+┊   ┊ 98┊      this.screen.delete();
 ┊ 98┊ 99┊      this.unloadScreen();
 ┊ 99┊100┊      this.screen.disposeEventListeners();
 ┊100┊101┊    }
```

##### Changed resources/scripts/engine/layer.js
```diff
@@ -23,6 +23,9 @@
 ┊23┊23┊    this.canvas = screen.game.canvas;
 ┊24┊24┊  }
 ┊25┊25┊
+┊  ┊26┊  delete() {
+┊  ┊27┊  }
+┊  ┊28┊
 ┊26┊29┊  update(span) {
 ┊27┊30┊  }
 ┊28┊31┊
```

##### Changed resources/scripts/engine/screen.js
```diff
@@ -28,6 +28,13 @@
 ┊28┊28┊    return this;
 ┊29┊29┊  }
 ┊30┊30┊
+┊  ┊31┊   // Delete all layers. Same as 'unload', only it disposes memory rather than assets
+┊  ┊32┊  delete() {
+┊  ┊33┊    this.layers.forEach(layer => {
+┊  ┊34┊      layer.delete();
+┊  ┊35┊    });
+┊  ┊36┊  }
+┊  ┊37┊
 ┊31┊38┊  // Updates each layer
 ┊32┊39┊  update(span) {
 ┊33┊40┊    this.layers.forEach(layer => {
```
```diff
@@ -61,6 +68,7 @@
 ┊61┊68┊  removeLayer(layer) {
 ┊62┊69┊    this.layers = _.without(this.layers, layer);
 ┊63┊70┊    layer.disposeEventListeners();
+┊  ┊71┊    layer.delete();
 ┊64┊72┊  }
 ┊65┊73┊
 ┊66┊74┊  initEventListeners() {
```

##### Changed resources/scripts/game/entities/snake.js
```diff
@@ -31,6 +31,10 @@
 ┊31┊31┊    }
 ┊32┊32┊  }
 ┊33┊33┊
+┊  ┊34┊  delete() {
+┊  ┊35┊    this.shapes.forEach(shape => shape.delete());
+┊  ┊36┊  }
+┊  ┊37┊
 ┊34┊38┊  draw(context) {
 ┊35┊39┊    // Draw all shapes in the shapes array
 ┊36┊40┊    this.shapes.forEach(shape => {
```
```diff
@@ -229,6 +233,8 @@
 ┊229┊233┊      [0, height, 0, 0]
 ┊230┊234┊    );
 ┊231┊235┊
-┊232┊   ┊    return canvasPolygon.getIntersection(this.lastBit);
+┊   ┊236┊    let result = canvasPolygon.getIntersection(this.lastBit);
+┊   ┊237┊    canvasPolygon.delete();
+┊   ┊238┊    return result;
 ┊233┊239┊  }
 ┊234┊240┊};🚫↵
```

##### Changed resources/scripts/game/screens/play/snake.js
```diff
@@ -43,6 +43,10 @@
 ┊43┊43┊    screen.appendLayer(Game.Screens.Play.Score, this.snakes);
 ┊44┊44┊  }
 ┊45┊45┊
+┊  ┊46┊  unload() {
+┊  ┊47┊    this.snakes.forEach(snake => snake.delete());
+┊  ┊48┊  }
+┊  ┊49┊
 ┊46┊50┊  draw(context) {
 ┊47┊51┊    // Draw each snake in the snakes array
 ┊48┊52┊    this.snakes.forEach(snake => snake.draw(context));
```
[}]: #

Congratulations! You've created a C++ cross JavaScript game. There shouldn't be any significant difference between the C++ version of the game and the JavaScript version on most machines, since the game is very small and barely requires any processing power. You'll probably notice the difference when starting to extend the game by adding terrains or more snakes.

One might ask - "How much faster does my game actually run?". The short answer is - around 50%. Why did I run into this conclusion? Well, take a look at the following JavaScript code snippet, for calculating Fibonacci of 42:

```js
function fib(x) {
  if (x < 2) {
    return 1;
  }
  else {
    return fib(x - 1) + fib(x - 2);
  }
}
```

The same code snippet should look almost identical written in C++:

```cpp
int fib(int x) {
  if (x < 2) {
    return 1;
  }
  else {
    return fib(x - 1) + fib(x - 2);
  }
}
```

However, the run-times are completely different! I compared the average of 10 runs in 3 different environments, and I received the following results:

![chart](https://cloud.githubusercontent.com/assets/7648874/22802494/2591025e-eef8-11e6-9679-10b5bca0ef30.png)

As you can see, the generated C++ is much faster, and to be precise, 57% faster! Surprisingly, I didn't have any significant difference between Emscripten generated C++ and natively compiled executable.

C++ is more complex to write, but it certainly has its advantages over JavaScript. Remember, now that you know that you have the possibility to run C++ in the browser, make sure to use it, but never overdo it, always find the right balance between readability and performance.

> *Sources:*
> - *https://kripken.github.io/emscripten-site/docs/introducing_emscripten/index.html*
> - *http://www.crunchy.com/?q=content/emscripten-perfectly-cromulent-compiler*
> - *http://stackoverflow.com/questions/2354725/what-exactly-is-llvm*

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step6.md) | [Next Step >](step8.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #