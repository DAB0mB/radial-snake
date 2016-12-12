const Hapi = require("hapi");
const IpGrabber = require("./helpers/ip_grabber");

let localIp = IpGrabber.local();
let port = 8000;

// Initialize a new server
let server = new Hapi.Server();

server.connection({ port: process.env.PORT || port });

// Report each response made
server.ext("onPreResponse", (req, rep) => {
  let res = req.response;

  console.log("Outcoming response:");
  console.log(`in: ${new Date}`);
  console.log(`to: ${req.info.remoteAddress}`);
  console.log(`method: ${req.method}`);
  console.log(`url: ${req.url.path}`);
  console.log(`status: ${res.statusCode || res.output.statusCode}`);
  console.log();

  rep.continue();
});

// Print message once started
server.start((err) => {
  if (err) throw err;

  console.log();
  console.log("---------- -------- ------ ---- --");
  console.log("----- ---- --- -- -");
  console.log(`Server running at ${localIp}:${port}`);
  console.log("----- ---- --- -- -");
  console.log("---------- -------- ------ ---- --");
  console.log();
});