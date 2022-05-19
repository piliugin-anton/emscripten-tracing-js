const CSVFile = require("./CSVFile");

class WSController {
  constructor(options = {}) {
    this.compression = options.compression || 0;
    this.wsBuffer = [];
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
          // Get JSON from message
          const { traces, length } = JSON.parse(Buffer.from(message));
          if (traces && length) {
            // Do the work with traces

            const msg = length.toString();
            if (ws.send(msg, isBinary, compressed) !== 1) {
              return this.wsBuffer.push({ msg, isBinary, compressed });
            }
          }
        } catch (ex) {}
      },
      drain: (ws) => {
        if (ws.getBufferedAmount() === 0 && this.wsBuffer.length) {
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
