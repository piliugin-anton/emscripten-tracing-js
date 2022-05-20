const uWS = require("uWebSockets.js");
const WebSocketController = require("./WebSocketController");
const HTTPController = require("./HTTPController.js");
const TemplateEngine = require("./TemplateEngine.js");

const port = 5000;
let serverToken = null;

const shutdown = (event) => {
  if (serverToken) {
    console.log("Shutting down the server...");
    uWS.us_listen_socket_close(serverToken);
  }
  console.log(`[${event}] Removing files...`);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGUSR2", () => shutdown("SIGUSR2"));

const WS = new WebSocketController({ compression: uWS.SHARED_COMPRESSOR });

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
    static: true,
    cors: "*",
  },
  {
    pattern: "/static/(.+)",
    static: true,
    dir: __dirname,
  },
]);

const App = uWS.App();

WS.attachTo(App);
HTTP.attachTo(App);

App.listen(port, (token) => {
  if (token) {
    console.log("Listening to port " + port);
    serverToken = token;
  } else {
    console.log("Failed to listen to port " + port);
  }
});
