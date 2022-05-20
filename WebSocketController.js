const fs = require("fs");
const path = require("path");

class WebSocketController {
  constructor(options = {}) {
    this.compression = options.compression || 0;
    this.wsBuffer = [];
    this.dataDir = path.join(__dirname, "data");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }

  isEmscriptenData(slice) {
    const array = Uint8Array(slice);
    const emscripten = [33, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110];

    for (let i = 10; i > -1; i--) {
      if (emscripten[i] !== array[i]) return false;
    }

    return true;
  }

  attachTo(App) {
    App.ws("/", {
      /* There are many common helper features */
      idleTimeout: 24,
      maxBackpressure: 1024 * 1024,
      maxPayloadLength: 16 * 1024 * 1024,
      compression: this.compression,
      sendPingsAutomatically: true,

      upgrade: (res, req, context) => {
        res.upgrade(
          {
            url: `${req.getUrl()}?${req.getQuery()}`,
          },
          /* Spell these correctly */
          req.getHeader("sec-websocket-key"),
          req.getHeader("sec-websocket-protocol"),
          req.getHeader("sec-websocket-extensions"),
          context
        );
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

        // Emscripten probe
        const probe = message.slice(0, 11);

        if (this.isEmscriptenData(probe)) {
          const data = Buffer.from(message.slice(11, message.byteLength));

          const filename = path.join(this.dataDir, `${session}.${version}.emscripten`);

          fs.promises
            .appendFile(filename, data)
            .then(() => {
              // Response
              if (ws.send("1", isBinary, compressed) !== 1) {
                return this.wsBuffer.push({ msg, isBinary, compressed });
              }
            })
            .catch((ex) => console.log(ex));
        }
      },
      drain: (ws) => {
        if (this.wsBuffer.length) {
          const { msg, isBinary, compressed } = this.wsBuffer[0];

          if (ws.send(msg, isBinary, compressed) === 1) {
            this.wsBuffer.splice(0, 1);
          }
        }
      },
    });
  }
}

module.exports = WebSocketController;
