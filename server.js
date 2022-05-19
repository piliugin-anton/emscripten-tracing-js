const uWS = require("uWebSockets.js");
const HTTPController = require("./HTTPController.js");
const TemplateEngine = require("./TemplateEngine.js");

const port = 5000;
let serverToken = null;
const wsBuffer = [];

const shutdown = (event) => {
  if (serverToken) {
    console.log("Shutting down the server...");
    uWS.us_listen_socket_close(serverToken);
  }
  console.log(`[${event}] Removing files...`);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGUSR2", () => shutdown("SIGUSR2"));

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

uWS
  .App()
  //.addServerName("localhost")
  .ws("/", {
    /* There are many common helper features */
    idleTimeout: 24,
    maxBackpressure: 1024 * 1024,
    maxPayloadLength: 16 * 1024 * 1024,
    compression: uWS.SHARED_COMPRESSOR,
    sendPingsAutomatically: false,

    upgrade: (res, req, context) => {
      res.upgrade({
        url: `${req.getUrl()}?${req.getQuery()}`
      },
      /* Spell these correctly */
      req.getHeader('sec-websocket-key'),
      req.getHeader('sec-websocket-protocol'),
      req.getHeader('sec-websocket-extensions'),
      context);
    },

    /* For brevity we skip the other events (upgrade, open, ping, pong, close) */
    message: (ws, message, isBinary) => {
      const url = new URL(ws.url, "http://0.0.0.0");
      const params = url.searchParams;
      const version = params.get("version");
      const session = params.get("session");
      
      if (!version || !session) return;

      // Compress message?
      const compressed = true;
      // Get JSON from message
      const json = JSON.parse(Buffer.from(message));

      const messages = Object.keys(json)
        .map((key) => json[key]);

      

      const ids = messages.map((msg) => msg.id);
      const msg = JSON.stringify(ids);

      if (ws.getBufferedAmount() === 0) {
        return ws.send(msg, isBinary, compressed);
      } else {
        return wsBuffer.push({ msg, isBinary, compressed });
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
