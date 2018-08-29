[{]: <region> (header)
# Step 1: Creating a server
[}]: #
[{]: <region> (body)
The first thing we will learn to do would be creating a server so we can serve our assets. We will be using [HapiJS](https://hapijs.com/) to build a REST API, although this step can be implemented with any library you'd want, like [ExpressJS](http://expressjs.com/) or [Connect](https://www.senchalabs.github.com/connect) etc. Let's install it then:

    $ npm install hapi --save

We will start by setting up a basis for our server, and we will expand it as we go further in this step. A general boiler plate should look like so:

[{]: <helper> (diff_step 1.2)
#### Step 1.2: Add server basis

##### Added server.js
```diff
@@ -0,0 +1,36 @@
+┊  ┊ 1┊const Hapi = require("hapi");
+┊  ┊ 2┊
+┊  ┊ 3┊let port = 8000;
+┊  ┊ 4┊
+┊  ┊ 5┊// Initialize a new server
+┊  ┊ 6┊let server = new Hapi.Server();
+┊  ┊ 7┊
+┊  ┊ 8┊server.connection({ port: process.env.PORT || port });
+┊  ┊ 9┊
+┊  ┊10┊// Report each response made
+┊  ┊11┊server.ext("onPreResponse", (req, rep) => {
+┊  ┊12┊  let res = req.response;
+┊  ┊13┊
+┊  ┊14┊  console.log("Outcoming response:");
+┊  ┊15┊  console.log(`in: ${new Date}`);
+┊  ┊16┊  console.log(`to: ${req.info.remoteAddress}`);
+┊  ┊17┊  console.log(`method: ${req.method}`);
+┊  ┊18┊  console.log(`url: ${req.url.path}`);
+┊  ┊19┊  console.log(`status: ${res.statusCode || res.output.statusCode}`);
+┊  ┊20┊  console.log();
+┊  ┊21┊
+┊  ┊22┊  rep.continue();
+┊  ┊23┊});
+┊  ┊24┊
+┊  ┊25┊// Print message once started
+┊  ┊26┊server.start((err) => {
+┊  ┊27┊  if (err) throw err;
+┊  ┊28┊
+┊  ┊29┊  console.log();
+┊  ┊30┊  console.log("---------- -------- ------ ---- --");
+┊  ┊31┊  console.log("----- ---- --- -- -");
+┊  ┊32┊  console.log(`Server running at ${port}`);
+┊  ┊33┊  console.log("----- ---- --- -- -");
+┊  ┊34┊  console.log("---------- -------- ------ ---- --");
+┊  ┊35┊  console.log();
+┊  ┊36┊});🚫↵
```
[}]: #

We simply initialize a new server which will connect to port `8000` by default, unless we defined an environment variable called `PORT`. Once the server is started, and whenever there is an outcoming response, a message will be printed to the console.

> More information and configuration options regards HapiJS's API can be found in this [here](https://hapijs.com/).

Now that the basis is ready, we want a convenient way to launch it. Repetitive scripts are usually defined in the `package.json` file under the `scripts` field. To start the server, we gonna create a simple script called `serve`:

[{]: <helper> (diff_step 1.3)
#### Step 1.3: Add serve npm script

##### Changed package.json
```diff
@@ -2,6 +2,9 @@
 ┊ 2┊ 2┊  "name": "radial-snake",
 ┊ 3┊ 3┊  "description": "A tutorial for creating a Tron-style game",
 ┊ 4┊ 4┊  "private": true,
+┊  ┊ 5┊  "scripts": {
+┊  ┊ 6┊    "serve": "node server.js"
+┊  ┊ 7┊  },
 ┊ 5┊ 8┊  "dependencies": {
 ┊ 6┊ 9┊    "hapi": "^16.0.1"
 ┊ 7┊10┊  }
```
[}]: #

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

[{]: <helper> (diff_step 1.4)
#### Step 1.4: Change serve npm script to use nodemon

##### Changed package.json
```diff
@@ -3,7 +3,7 @@
 ┊3┊3┊  "description": "A tutorial for creating a Tron-style game",
 ┊4┊4┊  "private": true,
 ┊5┊5┊  "scripts": {
-┊6┊ ┊    "serve": "node server.js"
+┊ ┊6┊    "serve": "nodemon server.js"
 ┊7┊7┊  },
 ┊8┊8┊  "dependencies": {
 ┊9┊9┊    "hapi": "^16.0.1"
```
[}]: #

The basis for our server is pretty much complete. From now on we gonna build stuff on top of it and extend our server. I'd like to add a small attachment to our server. I want that the IP address of the current computer will be printed to the console once the server is started. For this, we first gonna create a helper which we gonna call `ip_grabber`:

[{]: <helper> (diff_step 1.5)
#### Step 1.5: Add ip_grabber helper

##### Added helpers/ip_grabber.js
```diff
@@ -0,0 +1,23 @@
+┊  ┊ 1┊const Os = require("os");
+┊  ┊ 2┊
+┊  ┊ 3┊// Grab local IP address of which the NodeJS process runs on
+┊  ┊ 4┊function local() {
+┊  ┊ 5┊  let interfaces = Os.networkInterfaces();
+┊  ┊ 6┊  let addresses = [];
+┊  ┊ 7┊
+┊  ┊ 8┊  for (let k in interfaces) {
+┊  ┊ 9┊    for (let k2 in interfaces[k]) {
+┊  ┊10┊      let address = interfaces[k][k2];
+┊  ┊11┊
+┊  ┊12┊      if (address.family == "IPv4" && !address.internal) {
+┊  ┊13┊        addresses.push(address.address);
+┊  ┊14┊      }
+┊  ┊15┊    }
+┊  ┊16┊  }
+┊  ┊17┊
+┊  ┊18┊  return addresses[0];
+┊  ┊19┊}
+┊  ┊20┊
+┊  ┊21┊module.exports = {
+┊  ┊22┊  local
+┊  ┊23┊};🚫↵
```
[}]: #

This module simply goes through the available network interfaces and grabs the IP address of the default gateway using the `os` module. Now that we have it, let's import it in the server's entry file and use the `local` method to grab the IP address and report it once the server is started:

[{]: <helper> (diff_step 1.6)
#### Step 1.6: Print IP address once server is started

##### Changed server.js
```diff
@@ -1,5 +1,7 @@
 ┊1┊1┊const Hapi = require("hapi");
+┊ ┊2┊const IpGrabber = require("./helpers/ip_grabber");
 ┊2┊3┊
+┊ ┊4┊let localIp = IpGrabber.local();
 ┊3┊5┊let port = 8000;
 ┊4┊6┊
 ┊5┊7┊// Initialize a new server
```
```diff
@@ -29,7 +31,7 @@
 ┊29┊31┊  console.log();
 ┊30┊32┊  console.log("---------- -------- ------ ---- --");
 ┊31┊33┊  console.log("----- ---- --- -- -");
-┊32┊  ┊  console.log(`Server running at ${port}`);
+┊  ┊34┊  console.log(`Server running at ${localIp}:${port}`);
 ┊33┊35┊  console.log("----- ---- --- -- -");
 ┊34┊36┊  console.log("---------- -------- ------ ---- --");
 ┊35┊37┊  console.log();
```
[}]: #

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

[{]: <helper> (diff_step 1.8)
#### Step 1.8: Add endpoints routes

##### Added routes/endpoints.js
```diff
@@ -0,0 +1,80 @@
+┊  ┊ 1┊const Pack = require("../package.json");
+┊  ┊ 2┊
+┊  ┊ 3┊register.attributes = {
+┊  ┊ 4┊  name: "endpoints",
+┊  ┊ 5┊  version: Pack.version
+┊  ┊ 6┊};
+┊  ┊ 7┊
+┊  ┊ 8┊function register(server, options, next) {
+┊  ┊ 9┊  // Scripts endpoint
+┊  ┊10┊  server.route({
+┊  ┊11┊    method: "GET",
+┊  ┊12┊    path: "/scripts/{path*}",
+┊  ┊13┊    handler: {
+┊  ┊14┊      directory: {
+┊  ┊15┊        path: "./resources/scripts/"
+┊  ┊16┊      }
+┊  ┊17┊    }
+┊  ┊18┊  });
+┊  ┊19┊
+┊  ┊20┊  // Style-sheets endpoint
+┊  ┊21┊  server.route({
+┊  ┊22┊    method: "GET",
+┊  ┊23┊    path: "/styles/{path*}",
+┊  ┊24┊    handler: {
+┊  ┊25┊      directory: {
+┊  ┊26┊        path: "./resources/styles/"
+┊  ┊27┊      }
+┊  ┊28┊    }
+┊  ┊29┊  });
+┊  ┊30┊
+┊  ┊31┊  // Libraries endpoint
+┊  ┊32┊  server.route({
+┊  ┊33┊    method: "GET",
+┊  ┊34┊    path: "/libs/{path*}",
+┊  ┊35┊    handler: {
+┊  ┊36┊      directory: {
+┊  ┊37┊        path: "./resources/libs/"
+┊  ┊38┊      }
+┊  ┊39┊    }
+┊  ┊40┊  });
+┊  ┊41┊
+┊  ┊42┊  // Images endpoint
+┊  ┊43┊  server.route({
+┊  ┊44┊    method: "GET",
+┊  ┊45┊    path: "/images/{path*}",
+┊  ┊46┊    handler: {
+┊  ┊47┊      directory: {
+┊  ┊48┊        path: "./resources/images/"
+┊  ┊49┊      }
+┊  ┊50┊    }
+┊  ┊51┊  });
+┊  ┊52┊
+┊  ┊53┊  // Textures endpoint
+┊  ┊54┊  server.route({
+┊  ┊55┊    method: "GET",
+┊  ┊56┊    path: "/textures/{path*}",
+┊  ┊57┊    handler: {
+┊  ┊58┊      directory: {
+┊  ┊59┊        path: "./resources/assets/textures/"
+┊  ┊60┊      }
+┊  ┊61┊    }
+┊  ┊62┊  });
+┊  ┊63┊
+┊  ┊64┊  // Fonts endpoint
+┊  ┊65┊  server.route({
+┊  ┊66┊    method: "GET",
+┊  ┊67┊    path: "/fonts/{path*}",
+┊  ┊68┊    handler: {
+┊  ┊69┊      directory: {
+┊  ┊70┊        path: "./resources/assets/fonts/"
+┊  ┊71┊      }
+┊  ┊72┊    }
+┊  ┊73┊  });
+┊  ┊74┊
+┊  ┊75┊  next();
+┊  ┊76┊}
+┊  ┊77┊
+┊  ┊78┊module.exports = {
+┊  ┊79┊  register
+┊  ┊80┊};🚫↵
```
[}]: #

This module actually represents a classic structure of a `HapiJS` plug-in. It should export a `name` for debugging proposes, a `version`, and a `register` function, which will take care of registering extensions to our server; in this case, these are the endpoints routes. To make this plug-in (Or any other plug-in) work, we need to register it. The registration is an asynchronous operation, thus we gonna handle it using `async`:

[{]: <helper> (diff_step 1.9)
#### Step 1.9: Register ednpoints routes

##### Changed server.js
```diff
@@ -1,11 +1,23 @@
+┊  ┊ 1┊const Async = require("async");
 ┊ 1┊ 2┊const Hapi = require("hapi");
+┊  ┊ 3┊const Inert = require("inert");
+┊  ┊ 4┊const Endpoints = require("./routes/endpoints");
 ┊ 2┊ 5┊const IpGrabber = require("./helpers/ip_grabber");
 ┊ 3┊ 6┊
 ┊ 4┊ 7┊let localIp = IpGrabber.local();
 ┊ 5┊ 8┊let port = 8000;
 ┊ 6┊ 9┊
 ┊ 7┊10┊// Initialize a new server
-┊ 8┊  ┊let server = new Hapi.Server();
+┊  ┊11┊let server = new Hapi.Server({
+┊  ┊12┊  connections: {
+┊  ┊13┊    routes: {
+┊  ┊14┊      files: {
+┊  ┊15┊        // Served files will be relative to current directory
+┊  ┊16┊        relativeTo: __dirname
+┊  ┊17┊      }
+┊  ┊18┊    }
+┊  ┊19┊  }
+┊  ┊20┊});
 ┊ 9┊21┊
 ┊10┊22┊server.connection({ port: process.env.PORT || port });
 ┊11┊23┊
```
```diff
@@ -24,8 +36,14 @@
 ┊24┊36┊  rep.continue();
 ┊25┊37┊});
 ┊26┊38┊
+┊  ┊39┊// Register all routes and plug-ins
+┊  ┊40┊Async.series([
+┊  ┊41┊  next => server.register(Inert, next),
+┊  ┊42┊  next => server.register(Endpoints, next),
+┊  ┊43┊  // Once registrations are finished, start the server
+┊  ┊44┊  next => server.start(next)
 ┊27┊45┊// Print message once started
-┊28┊  ┊server.start((err) => {
+┊  ┊46┊], (err) => {
 ┊29┊47┊  if (err) throw err;
 ┊30┊48┊
 ┊31┊49┊  console.log();
```
[}]: #

Once all the plug-ins have been registered, we gonna start our server as we previously did. Note that we also registered the `inert` plug-in, because as I said earlier, that's what gives us the ability to handle files requests.

Lastly, I want to create the `pages` routes batch, which will be responsible for serving pages in our application as listed above:

- The `/` route will serve us the `game.html` file.
- The `/test` route will serve us the `spec_runner.html` file.

By the name of each route and file you can probably what each one should do. The thing is, we don't want everyone to be able to access the `spec_runner.html` file, or the `game.html` file if in the middle of development. For this, we're going to create a new helper which will be responsible for handling permissions. So first we gonna install an npm package called `boom` which has the ability to format `permission denied` HTTP errors:

    $ npm install boom --save

And now we gonna implement the module itself:

[{]: <helper> (diff_step 1.11)
#### Step 1.11: Add permitter helper

##### Added helpers/permitter.js
```diff
@@ -0,0 +1,29 @@
+┊  ┊ 1┊const Boom = require("boom");
+┊  ┊ 2┊const Hapi = require("hapi");
+┊  ┊ 3┊const IpGrabber = require("./ip_grabber");
+┊  ┊ 4┊
+┊  ┊ 5┊// These addresses will be permitted by default
+┊  ┊ 6┊const defaultPermissions = [
+┊  ┊ 7┊  IpGrabber.local(), "127.0.0.1", "localhost"
+┊  ┊ 8┊];
+┊  ┊ 9┊
+┊  ┊10┊// Manage file permissions
+┊  ┊11┊function file(path, permissions, req, rep) {
+┊  ┊12┊  // Apply default permissions
+┊  ┊13┊  permissions = permissions.concat(defaultPermissions);
+┊  ┊14┊  // Request address
+┊  ┊15┊  let remoteAddress = req.info.remoteAddress;
+┊  ┊16┊
+┊  ┊17┊  // If not permitted, reply error
+┊  ┊18┊  if (permissions.indexOf(remoteAddress) == -1) {
+┊  ┊19┊    let err = new Boom.forbidden("Missing permissions");
+┊  ┊20┊    return rep(err);
+┊  ┊21┊  }
+┊  ┊22┊
+┊  ┊23┊  // If permitted, reply file
+┊  ┊24┊  rep.file(path);
+┊  ┊25┊}
+┊  ┊26┊
+┊  ┊27┊module.exports = {
+┊  ┊28┊  file
+┊  ┊29┊};🚫↵
```
[}]: #

The default permitted IP address would be the current computer's IP address. Extra IP permissions can be provided with the invocation of the `file` method. If the requesting IP is not listed in the permissions list, an error is gonna be replied instead of the requested file. Now that we have our "permitter" ready, let's implement the `pages` routes batch, only we're gonna pass the requests through the black-list, for the reason mentioned above:

[{]: <helper> (diff_step 1.12)
#### Step 1.12: Add pages routes

##### Added routes/pages.js
```diff
@@ -0,0 +1,35 @@
+┊  ┊ 1┊const Hapi = require("hapi");
+┊  ┊ 2┊const Pack = require("../package.json");
+┊  ┊ 3┊const Permitter = require("../helpers/permitter");
+┊  ┊ 4┊
+┊  ┊ 5┊register.attributes = {
+┊  ┊ 6┊  name: "pages",
+┊  ┊ 7┊  version: Pack.version
+┊  ┊ 8┊};
+┊  ┊ 9┊
+┊  ┊10┊function register(server, options, next) {
+┊  ┊11┊  server.route({ method: "GET", path: "/", handler: getGame });
+┊  ┊12┊  server.route({ method: "GET", path: "/test", handler: getSpecRunner });
+┊  ┊13┊
+┊  ┊14┊  next();
+┊  ┊15┊}
+┊  ┊16┊
+┊  ┊17┊// Serve game page
+┊  ┊18┊function getGame(req, rep) {
+┊  ┊19┊  let path = "./views/game.html";
+┊  ┊20┊  let permissions = [];
+┊  ┊21┊
+┊  ┊22┊  Permitter.file(path, permissions, req, rep);
+┊  ┊23┊}
+┊  ┊24┊
+┊  ┊25┊// Serve test page
+┊  ┊26┊function getSpecRunner(req, rep) {
+┊  ┊27┊  let path = "./views/spec_runner.html";
+┊  ┊28┊  let permissions = [];
+┊  ┊29┊
+┊  ┊30┊  Permitter.file(path, permissions, req, rep);
+┊  ┊31┊}
+┊  ┊32┊
+┊  ┊33┊module.exports = {
+┊  ┊34┊  register
+┊  ┊35┊};🚫↵
```
[}]: #

Now the only thing left to do would be registering the plug-in we've just created:

[{]: <helper> (diff_step 1.13)
#### Step 1.13: Register pages routes

##### Changed server.js
```diff
@@ -2,6 +2,7 @@
 ┊2┊2┊const Hapi = require("hapi");
 ┊3┊3┊const Inert = require("inert");
 ┊4┊4┊const Endpoints = require("./routes/endpoints");
+┊ ┊5┊const Pages = require("./routes/pages");
 ┊5┊6┊const IpGrabber = require("./helpers/ip_grabber");
 ┊6┊7┊
 ┊7┊8┊let localIp = IpGrabber.local();
```
```diff
@@ -40,6 +41,7 @@
 ┊40┊41┊Async.series([
 ┊41┊42┊  next => server.register(Inert, next),
 ┊42┊43┊  next => server.register(Endpoints, next),
+┊  ┊44┊  next => server.register(Pages, next),
 ┊43┊45┊  // Once registrations are finished, start the server
 ┊44┊46┊  next => server.start(next)
 ┊45┊47┊// Print message once started
```
[}]: #

And that's it for the current step! In the next steps we will start storing files and assets in our public directories and implement all the necessary scripts, so our server is not running in vain.
[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Intro](../../README.md) | [Next Step >](step2.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #