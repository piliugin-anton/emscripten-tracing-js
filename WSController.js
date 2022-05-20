const fs = require("fs");
const path = require("path");

class WSController {
  constructor(options = {}) {
    this.compression = options.compression || 0;
    this.wsBuffer = [];
    this.encoder = new TextEncoder();
    this.openSquareBrace = 91;
    this.closeSquareBrace = 93;
  }

  attach() {
    return ["/", {
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

        try {
          // Compress message?
          const compressed = true;
          // ArrayBuffer
          
          const firstSlice = new Uint8Array(message.slice(0, 1));
          const firstByte = firstSlice[0];
          const lastSlice = new Uint8Array(message.slice(message.byteLength - 1));
          const lastByte = lastSlice[0];

          if (firstByte === this.openSquareBrace && lastByte === this.closeSquareBrace) {
            // Do the work with traces
            const data = Buffer.from(message.slice(1, message.byteLength - 1));
            const filename = path.join(
              __dirname,
              "data",
              `${session}.${version}.rawson`
            );
            fs.promises
              .appendFile(filename, data)
              .then(() => {
                // Response
                if (ws.send("1", isBinary, compressed) !== 1) {
                  return this.wsBuffer.push({ msg, isBinary, compressed });
                }
              })
              .catch((ex) => console.log(ex));
          } else {
            return;
          }
        } catch (ex) {}
      },
      drain: (ws) => {
        if (this.wsBuffer.length) {
          const { msg, isBinary, compressed } = this.wsBuffer[0];

          if (ws.send(msg, isBinary, compressed) === 1) {
            this.wsBuffer.splice(0, 1);
          }
        }
      },
    }];
  }
}

module.exports = WSController;
