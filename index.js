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
  templateEngine: Templates,
  cors: "*",
  errorHandler: (request, code) => {
    // const { url, method, params, query } = request;
    const errorMessages = {
      403: "You tried to access a page you did not have prior authorization for.",
      404: "The page that you requested could not be found.",
      500: "It's always time for a tea break."
    };
    // TODO: test it
    return {
      template: "errors.eta",
      data: { code, pageTitle: HTTPController.STATUSES[code], message: errorMessages[code] },
    };
  },
}).addRoutes([
  {
    pattern: "/",
    method: HTTPController.METHODS.GET,
    template: "index.eta",
    handler: (request) => {
      return { title: "Sessions", pageTitle: "Sessions"/*, sessions: []*/ };
    },
  },
  {
    pattern: "/worker.js",
    method: HTTPController.METHODS.GET,
    redirect: "/static/worker.js"
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
