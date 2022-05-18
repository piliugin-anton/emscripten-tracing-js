const uWS = require("uWebSockets.js");
const HTTPController = require("./HTTPController.js");
const TemplateEngine = require("./TemplateEngine.js");

const port = 5000;
let serverToken = null;
const wsBuffer = [];

/*process.on("SIGINT", () => {
  if (serverToken) {
    console.log("Shutting down the server...");
    uWS.us_listen_socket_close(serverToken);
  }
  console.log("Removing files...");
});*/

const Templates = new TemplateEngine();
const HTTP = new HTTPController({
  templateEngine: Templates,
  errorHandler: (request, code) => {
    // const { url, method, params, query } = request;
    const errorMessages = {
      403: "You tried to access a page you did not have prior authorization for.",
      404: "The page that you requested could not be found.",
      500: "It's always time for a tea break.",
    };
    // TODO: test it
    return {
      template: "errors.eta",
      data: {
        code,
        pageTitle: HTTPController.STATUSES[code],
        message: errorMessages[code],
      },
    };
  },
}).addRoutes([
  {
    pattern: "/",
    method: HTTPController.METHODS.GET,
    template: "index.eta",
    handler: (request) => {
      return {
        title: "Sessions",
        pageTitle: "Sessions" /*,
        sessions: []*/,
      };
    },
  },
  {
    pattern: "/worker.js",
    method: HTTPController.METHODS.GET,
    static: true,
    cors: "*",
  },
  {
    pattern: "/static/(.+)",
    method: HTTPController.METHODS.GET,
    dir: __dirname,
    static: true,
  },
]);

uWS
  .App()
  .ws("/", {
    /* There are many common helper features */
    idleTimeout: 32,
    maxBackpressure: 1024 * 1024,
    maxPayloadLength: 16 * 1024 * 1024,
    compression: uWS.SHARED_COMPRESSOR,
    sendPingsAutomatically: false,

    /* For brevity we skip the other events (upgrade, open, ping, pong, close) */
    message: (ws, message, isBinary) => {
      /* You can do app.publish('sensors/home/temperature', '22C') kind of pub/sub as well */
      /* Here we echo the message back, using compression if available */

      const json = JSON.parse(Buffer.from(message));

      const messages = Object.keys(json)
        .map((key) => json[key])
        .filter((msg) => typeof msg === "object");

      const ids = messages.map((msg) => msg.id);

      const response = {
        id: json.id,
        ids,
      };

      const msg = JSON.stringify(response);

      if (ws.getBufferedAmount() === 0) {
        ws.send(msg, isBinary, false);
      } else {
        wsBuffer.push({ msg, isBinary, compressed: false });
      }
    },
    drain: (ws) => {
      if (ws.getBufferedAmount() === 0 && wsBuffer.length) {
        const { msg, isBinary, compressed } = wsBuffer.splice(0, 1)[0];
        ws.send(msg, isBinary, compressed);
      }
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
