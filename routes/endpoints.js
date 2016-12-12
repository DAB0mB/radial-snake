const Pack = require("../package.json");

register.attributes = {
  name: "endpoints",
  version: Pack.version
};

function register(server, options, next) {
  // Scripts endpoint
  server.route({
    method: "GET",
    path: "/scripts/{path*}",
    handler: {
      directory: {
        path: "./resources/scripts/"
      }
    }
  });

  // Style-sheets endpoint
  server.route({
    method: "GET",
    path: "/styles/{path*}",
    handler: {
      directory: {
        path: "./resources/styles/"
      }
    }
  });

  // Libraries endpoint
  server.route({
    method: "GET",
    path: "/libs/{path*}",
    handler: {
      directory: {
        path: "./resources/libs/"
      }
    }
  });

  // Images endpoint
  server.route({
    method: "GET",
    path: "/images/{path*}",
    handler: {
      directory: {
        path: "./resources/images/"
      }
    }
  });

  // Textures endpoint
  server.route({
    method: "GET",
    path: "/textures/{path*}",
    handler: {
      directory: {
        path: "./resources/assets/textures/"
      }
    }
  });

  // Fonts endpoint
  server.route({
    method: "GET",
    path: "/fonts/{path*}",
    handler: {
      directory: {
        path: "./resources/assets/fonts/"
      }
    }
  });

  next();
}

module.exports = {
  register
};