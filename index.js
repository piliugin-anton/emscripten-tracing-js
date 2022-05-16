const uWS = require("uWebSockets.js");
const HTTPController = require("./HTTPController.js");
const TemplateEngine = require("./TemplateEngine.js");

const port = 5000;
let serverToken = null;

process.on("SIGINT", () => {
  if (serverToken) {
    console.log("Shutting down the server...");
    uWS.us_listen_socket_close(serverToken);
  }
  console.log("Removing files...");
});

const Templates = new TemplateEngine();
const HTTP = new HTTPController({
  templateEngine: Templates
});
// TODO: Test if method name is compared as it should
HTTP.addRoutes([
  {
    pattern: "/:foo",
    method: HTTPController.METHODS.GET,
    template: "index.eta",
    handler: (data) => { console.log("query params", data.query, data.params); }
  }
]);

uWS
  .App()
  .ws("/*", {
    /* There are many common helper features */
    idleTimeout: 32,
    maxBackpressure: 1024,
    maxPayloadLength: 512,
    compression: uWS.DEDICATED_COMPRESSOR_3KB,

    /* For brevity we skip the other events (upgrade, open, ping, pong, close) */
    message: (ws, message, isBinary) => {
      /* You can do app.publish('sensors/home/temperature', '22C') kind of pub/sub as well */

      /* Here we echo the message back, using compression if available */
      let ok = ws.send(message, isBinary, true);
    },
  })
  .any(...HTTP.attach())
  .listen(port, (token) => {
    if (token) {
      console.log("Listening to port " + port);
      serverToken = token;
    } else {
      console.log("Failed to listen to port " + port);
    }
  });
