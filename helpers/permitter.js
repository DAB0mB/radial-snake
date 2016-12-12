const Boom = require("boom");
const Hapi = require("hapi");
const IpGrabber = require("./ip_grabber");

// These addresses will be permitted by default
const defaultPermissions = [
  IpGrabber.local(), "127.0.0.1", "localhost"
];

// Manage file permissions
function file(path, permissions, req, rep) {
  // Apply default permissions
  permissions = permissions.concat(defaultPermissions);
  // Request address
  let remoteAddress = req.info.remoteAddress;

  // If not permitted, reply error
  if (permissions.indexOf(remoteAddress) == -1) {
    let err = new Boom.forbidden("Missing permissions");
    return rep(err);
  }

  // If permitted, reply file
  rep.file(path);
}

module.exports = {
  file
};