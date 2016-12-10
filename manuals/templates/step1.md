The first thing we will learn to do would be creating a server so we can serve our assets. We will be using [HapiJS](https://hapijs.com/) to build a REST API, although this step can be implemented with any library you'd want, like [ExpressJS](http://expressjs.com/) or [Connect](https://www.senchalabs.github.com/connect) etc. Let's install it then:

    $ npm install hapi --save

We will start by setting up a basis for our server, and we will expand it as we go further in this step. A general boiler plate should look like so:

{{{diff_step 1.2}}}

We simply initialize a new server which will connect to port `8000` by default, unless we defined an environment variable called `PORT`. Once the server is started, and whenever there is an outcoming response, a message will be printed to the console.

> More information and configuration options regards HapiJS's API can be found in this [here](https://hapijs.com/).

Now that the basis is ready, we want a convenient way to launch it. Repetitive scripts are usually defined in the `package.json` file under the `scripts` field. To start the server, we gonna create a simple script called `serve`:

{{{diff_step 1.3}}}

To run this script, we will simply need to type the following:

    $ npm run serve

This will run our server, and you should see the following message printed to the console:

```
---------- -------- ------ ---- --
----- ---- --- -- -
Server running at 8000
----- ---- --- -- -
---------- -------- ------ ---- --
```

> As for now, nothing happens, because we didn't define any handlers for HTTP requests. I will get to it in a bit, stay with me.

The main disadvantage of starting a server directly with node is that we have no listeners for changes in our files, so if we want the served files to be updated, we will have to restart our server anytime we make a change. To avoid that, we gonna use [nodemon](https://nodemon.io/), which is a simple utility that can monitor changes is source files and automatically restart our server. To install it, type the following:

    $ sudo npm install nodemon -g

Now that we have it, we will need to update our `serve` npm script to use `nodemon` instead of `node`:

{{{diff_step 1.4}}}

The basis for our server is pretty much complete. From now on we gonna build stuff on top of it and extend our server. I'd like to add a small attachment to our server. I want that the IP address of the current computer will be printed to the console once the server is started. For this, we first gonna create a helper which we gonna call `ip_grabber`:

{{{diff_step 1.5}}}

This module simply goes through the available network interfaces and grabs the IP address of the default gateway using the `os` module. Now that we have it, let's import it in the server's entry file and use the `local` method to grab the IP address and report it once the server is started:

{{{diff_step 1.6}}}

By now you should have the following message printed to the console once you start the server:

```
---------- -------- ------ ---- --
----- ---- --- -- -
Server running at 95.221.122.30:8000
----- ---- --- -- -
---------- -------- ------ ---- --
```

> Instead of `95.221.122.30` you should have the IP address which is right for you.

Now comes the most important part - handling HTTP requests! Because what does a server worth if it doesn't know how to handle anything? When using `HapiJS`, we can separate extensions to our server in different modules, and eventually register them as plug-ins. So the first plug-in is gonna be the routes batch for the endpoints - it will take care of serving file requests as is, and basically turning local directories into public ones. This is useful because our game is going to be dependent on many assets like textures, images, fonts, and so on... But before I go into the implementation part we first need to install a couple of libraries which will help us with the task. The first one is going to be `async`, which will take care of managing the control flow of asynchronous code:

    $ npm install async --save

And the second library is going to be `inert`, which is a `HapiJS` plug-in which will give us the ability to serve files from local directories:

    $ npm install inert --save

Now that we're set, let's implement the `endpoints` routes batch:

{{{diff_step 1.8}}}

This module actually represents a classic structure of a `HapiJS` plug-in. It should export a `name` for debugging proposes, a `version`, and a `register` function, which will take care of registering extensions to our server; in this case, these are the endpoints routes. To make this plug-in (Or any other plug-in) work, we need to register it. The registration is an asynchronous operation, thus we gonna handle it using `async`:

{{{diff_step 1.9}}}

Once all the plug-ins have been registered, we gonna start our server as we previously did. Note that we also registered the `inert` plug-in, because as I said earlier, that's what gives us the ability to handle files requests.

Lastly, I want to create the `pages` routes batch, which will be responsible for serving pages in our application as listed above:

- The `/` route will serve us the `game.html` file.
- The `/test` route will serve us the `spec_runner.html` file.

By the name of each route and file you can probably what each one should do. The thing is, we don't want everyone to be able to access the `spec_runner.html` file, or the `game.html` file if in the middle of development. For this, we're going to create a new helper which will be responsible for handling permissions. So first we gonna install an npm package called `boom` which has the ability to format `permission denied` HTTP errors:

    $ npm install boom --save

And now we gonna implement the module itself:

{{{diff_step 1.11}}}

The default permitted IP address would be the current computer's IP address. Extra IP permissions can be provided with the invocation of the `file` method. If the requesting IP is not listed in the permissions list, an error is gonna be replied instead of the requested file. Now that we have our "permitter" ready, let's implement the `pages` routes batch, only we're gonna pass the requests through the black-list, for the reason mentioned above:

{{{diff_step 1.12}}}

Now the only thing left to do would be registering the plug-in we've just created:

{{{diff_step 1.13}}}

And that's it for the current step! In the next steps we will start storing files and assets in our public directories and implement all the necessary scripts, so our server is not running in vain.