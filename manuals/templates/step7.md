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

{{{diff_step 7.1}}}

Following that, we will create the `utils.cpp` module included above, which is a direct translation from C++ to JavaScript for the `utils.js` we've created earlier in this tutorial.

{{{diff_step 7.2}}}

The module above should work by itself when interacting with it inside the C++ scope, but that's not what we're striving for. We want this module to be available for use in our JavaScript project. This requires us to wrap our code in such a way the the Emscripten compiler will know how to compile it. Apart from providing a compiler, Emscripten provides us with functions and macros that will help use bind our C++ code to the JavaScript environment. These functionalities are packed in a single library which can be imported in our C++ code, and it is called [Embind](https://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/embind.html) (probably stands for "Emscripten bind"). Using EMBind, let's wrap our utils module accordingly:

{{{diff_step 7.3}}}

After a while you'll get used for Embind's API. If you'll look at it, it's self explanatory and easy to understand. Bound objects will be available the JavaScript environment will be available under an object named `Module`, e.g. the C++ method `mod` will be available for use as `Module.utils_mod`. Bound functions should have supported return types and argument types, meaning that if we're using a custom structure as a return type or an argument type, we first need to wrap it using EMBind, otherwise the compiler won't know how to handle it. A list of natively supported data-types can be found [here](https://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/embind.html#built-in-type-conversions).

Even though we've wrapped our C++ code and hypothetically it can already be used in the browser, I'd go for a second wrapper, since the compiled code doesn't have the optimal architecture. Right now we will have to approach C++ utility functions using `Module.utils_foo`. Instead, I'd like it to be `CPP.Utils.foo`, since it's clearer this way. The output of the Emscripten compiler can be wrapped with JavaScript code, using a prefix and a suffix, defined in 2 separate files respectively, called `pre.js` and `post.js`:

{{{diff_step 7.4}}}

What we've done in the code snippet above, we've created an anonymous function which calls itself, and inside we've exported a new namespace called `CPP` (C++). This way we can keep the generated code encapsulated, without worrying about spamming the global object.

After creating a wrapper, I'd also recommend you to integrate the generated C++ code into existing namespaces, meaning that if for example we would like to approach the `CPP.Utils.foo` method, it could be done using `Utils.foo`. This way existing code won't have to be changed, and extra wrapping logic can be applied with ease, like the chaining logic implemented in the `Utils` namespace:

{{{diff_step 7.5}}}

Whenever launching the compiler, the generated code should be outputted somewhere. I've decided to go with the path `resources/scripts/cpp.bundle.js`, but it doesn't matter how the file is gonna be called, as long as it's defined under the `scripts` dir, otherwise we won't be able to load it. Also, we need to make sure that we set a git-ignore rule for the generated file, since there's no reason for us to upload it to the git-host if we're planning on compiling it:

{{{diff_step 7.5}}}

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

{{{diff_step 7.6}}}

Now if you'd like to compile the C++ code just run:

    $ npm run build:cpp

Moreover, the code should be compiled automatically any time you start the serer using the command:

    $ npm run serve

We always have to be on the alert and run our tests against modules we've just translated from JavaScript to C++. This will guarantee that once we run the game we won't stumble upon any defect whatsoever. Before running the tests, be sure to import the C++ bundle in the HTML file's header:

{{{diff_step 7.8}}}

Now we can run the tests by running the following command:

    $ npm run test

At this point **all our tests should pass**. If they don't, it means our newly created utility module is not working properly, and you will have to repeat the previous steps until you get it right.

Up next, we gonna translate the geometry line class to C++. Since it's gonna be translated almost identically, we will have to make sure that all the necessary assets are gonna be available for our class before proceeding. The first thing we will have to do would be making sure that the utility functions are chainable directly from C++ as well. To do that, we will create a chain class which should return a new instance of it whenever we're about to chain the upcoming utility method. Once calling `result()`, the accumulator should be returned:

{{{diff_step 7.9}}}

> Note that when coding in C++ we have to make sure that the objects are being disposed when not needed anymore, otherwise we will have some unnecessary memory leaks.

2D shapes are presented in space using points with 2 values - `x` (axis) and `y` axis, therefore, we will create the appropriate point structure:

{{{diff_step 7.10}}}

Returned values can either be `null` (`undefined`) or not. Since there's no built in nullable-values mechanism in C++ (up until C++17), we're gonna create one of our own:

{{{diff_step 7.11}}}

Now that all the necessary assets for the line class are ready, we can go ahead and create it:

{{{diff_step 7.12}}}

After creating our C++, we will also need to bind it using EMBind:

{{{diff_step 7.13}}}

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

{{{diff_step 7.14}}}

If you'll take a look at the following line:

```js
Object.setPrototypeOf(that, new.target.prototype);
```

This is where the magic actually happens! It enables inheritance for explicitly returned objects; This way we can safely extend C++ classes. Accordingly, our new JavaScript line class should look like so:

{{{diff_step 7.15}}}

By now, our tests should pass. Accept, there is memory leak we need to handle. But you probably ask yourself - "What memory leak? It's JavaScript man! Have you ever heard of something called garbage collector?!". Well, this is not the case when compiling C++ code with Emscripten. You see, Emscripten uses asm.js, which is a subset for JavaScript built exactly for these proposes, enabling C++ modules run on the browser. This is how the [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) project actually started, an almost complete conversion from the famous C++ [OpenGL](https://www.opengl.org/) to JavaScript. Part of what asm.js does, it disables the garbage collector, and instead, it holds raw pointers, just like in C++. Since returned class instances are pointers with unknown lifespans, they need to be disposed manually, using the `delete` method (identical to how we clear memory from the Heap in C++). Let's dispose unused test data by calling the `delete` method as just mentioned:

{{{diff_step 7.16}}}

Since our game also uses polygons, which is made of an abstract number of lines, its test-data needs to be disposed as well. First, we will add a `delete` method to the polygon class, which will simply go though all its bounds and delete each of its lines:

{{{diff_step 7.17}}}

Now we can conveniently delete unused polygons in the tests:

{{{diff_step 7.18}}}

Moving on, we have the circle class to transform. The process is almost the identical to how we transformed the line class, so it's gonna be way easier now. We first start by translating our code from JavaScript to C++:

{{{diff_step 7.19}}}

Second, we need to wrap our code using EMBind:

{{{diff_step 7.20}}}

And finally, we will extend the C++ in our JavaScript circle:

{{{diff_step 7.21}}}

We also need to update the line class to contain a reference to the newly created line-intersection method, so it can be invoked from both a line or a circle bi-directionally:

{{{diff_step 7.22}}}

Now, before running the tests, be sure to disposed unused circle test-data:

{{{diff_step 7.23}}}

Our C++ code should be finished now, and all the tests should be passing. The only thing left to do would be applying it to our game. Like any other application, we first need to reference the script file so it can be loaded, in this case, the C++ bundle script:

{{{diff_step 7.24}}}

And now we need to make sure to dispose the geometry shapes correctly so we won't experience any unnecessary memory leaks. Most of our disposals should go to the snake entity, since it's made out of shapes; So we will add a `delete` method to the snake entity and we will dispose it whenever a match is finished:

{{{diff_step 7.25}}}

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
