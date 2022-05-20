const fs = require("fs");
const path = require("path");

class WSController {
  constructor(options = {}) {
    this.compression = options.compression || 0;
    this.wsBuffer = [];
    this.openSquareBrace = Buffer.from("[");
    this.closeSquareBrace = Buffer.from("]");
  }

  get WShandler() {
    return {
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
          // Buffer
          const buffer = Buffer.from(message);
          const openSquareBrace = Buffer.from("[");
          const closeSquareBrace = Buffer.from("]");
          const firstByte = buffer.slice(0, 1);
          const lastByte = buffer.slice(buffer.size - 1, 1);

          if (
            Buffer.compare(openSquareBrace, firstByte) === 0 &&
            Buffer.compare(closeSquareBrace, lastByte) === 0
          ) {
            // Do the work with traces
            const data = buffer.slice(1, buffer.size - 1);
            const filename = path.join(
              __dirname,
              "data",
              `${session}.${version}.json`
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
    };
  }

  attach() {
    return ["/", this.WShandler];
  }
}

module.exports = WSController;
