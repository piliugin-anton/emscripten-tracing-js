const fs = require("fs");
const path = require("path");

class WebSocketController {
  constructor(options = {}) {
    this.compression = options.compression || 0;
    this.wsBuffer = [];
    this.dataDir = options.dir || path.join(__dirname, "data");

    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir);
    }
  }

  isEmscriptenData(slice) {
    const array = new Uint8Array(slice);
    const emscripten = [33, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110];

    for (let i = 10; i > -1; i--) {
      if (emscripten[i] !== array[i]) return false;
    }

    return true;
  }

  handleUpgrade(res, req, context) {
    console.log("Upgrade", req);
    return res.upgrade(
      {
        url: `${req.getUrl()}?${req.getQuery()}`,
      },
      /* Spell these correctly */
      req.getHeader("sec-websocket-key"),
      req.getHeader("sec-websocket-protocol"),
      req.getHeader("sec-websocket-extensions"),
      context
    );
  }

  handleMessage(ws, message, isBinary) {
    const url = new URL(ws.url, "http://0.0.0.0");
    const params = url.searchParams;
    const version = params.get("version");
    const session = params.get("session");

    if (!version || !session) return;

    // Compress message?
    const compressed = true;

    // Emscripten probe
    const probe = message.slice(0, 11);

    if (this.isEmscriptenData(probe)) {
      console.log("Emscripten data!");
      const data = Buffer.from(message.slice(11, message.byteLength));

      const filename = path.join(
        this.dataDir,
        `${session}.${version}.emscripten`
      );

      return fs.promises
        .appendFile(filename, data)
        .then(() => {
          // Response
          if (ws.send("1", isBinary, compressed) !== 1)
            return this.wsBuffer.push({ msg, isBinary, compressed });
        })
        .catch((ex) => console.log(ex));
    }
  }

  handleDrain(ws) {
    if (this.wsBuffer.length) {
      const { msg, isBinary, compressed } = this.wsBuffer[0];

      if (ws.send(msg, isBinary, compressed) === 1) {
        this.wsBuffer.splice(0, 1);
      }
    }
  }

  attachTo(App) {
    App.ws("/", {
      /* There are many common helper features */
      idleTimeout: 24,
      maxBackpressure: 1024 * 1024,
      maxPayloadLength: 16 * 1024 * 1024,
      compression: this.compression,
      sendPingsAutomatically: true,
      closeOnBackpressureLimit: false,

      upgrade: this.handleUpgrade.bind(this),
      message: this.handleMessage.bind(this),
      drain: this.handleDrain.bind(this),
    });
  }
}

module.exports = WebSocketController;