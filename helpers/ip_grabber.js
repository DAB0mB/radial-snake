const Os = require("os");

// Grab local IP address of which the NodeJS process runs on
function local() {
  let interfaces = Os.networkInterfaces();
  let addresses = [];

  for (let k in interfaces) {
    for (let k2 in interfaces[k]) {
      let address = interfaces[k][k2];

      if (address.family == "IPv4" && !address.internal) {
        addresses.push(address.address);
      }
    }
  }

  return addresses[0];
}

module.exports = {
  local
};