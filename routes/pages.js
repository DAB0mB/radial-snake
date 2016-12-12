const Hapi = require("hapi");
const Pack = require("../package.json");
const Permitter = require("../helpers/permitter");

register.attributes = {
  name: "pages",
  version: Pack.version
};

function register(server, options, next) {
  server.route({ method: "GET", path: "/", handler: getGame });
  server.route({ method: "GET", path: "/test", handler: getSpecRunner });

  next();
}

// Serve game page
function getGame(req, rep) {
  let path = "./views/game.html";
  let permissions = [];

  Permitter.file(path, permissions, req, rep);
}

// Serve test page
function getSpecRunner(req, rep) {
  let path = "./views/spec_runner.html";
  let permissions = [];

  Permitter.file(path, permissions, req, rep);
}

module.exports = {
  register
};