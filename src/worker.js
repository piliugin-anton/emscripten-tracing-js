import WebsocketReconnect from "websocket-reconnect-pro";
class Tracing {
  constructor() {
    this.ws = null;
    this.queue = [];
    this.timeout = null;
    this.wsURL = null;
    this.SEND_TIMEOUT = 500;
    this.DISCONNECT_TIMEOUT = 1000;
  }

  get isConnected() {
    return this.ws && this.ws.readyState === this.ws.OPEN;
  }

  connect(wsUrl) {
    if (this.ws && this.wsURL !== wsUrl && this.isConnected) {
      this.ws.close();
    }

    this.wsURL = wsUrl;

    this.ws = new WebsocketReconnect(this.wsURL, "emscripten-trace", {
      minUptime: 1000,
      minReconnectionDelay: 1000,
      maxReconnectionDelay: 10000,
      connectionTimeout: 5000,
      reconnectionDelayGrowFactor: 1.1,
      maxRetries: Infinity,
      maxEnqueuedMessages: 0,
      startClosed: false,
      enableHeartbeat: false,
      debug: false,
    });

    this.ws.onmessage = (e) => this._onMessage(e.data);
    this.ws.onopen = () => this._scheduleSend();
  }

  disconnect() {
    if (this.queue.length > 0) {
      this._scheduleSend(0);
      return setTimeout(this.disconnect, this.DISCONNECT_TIMEOUT);
    }

    if (isConnected) return this.ws.close();
  }

  send(message) {
    this.queue.push(message);
    this._scheduleSend();
  }

  _onMessage(message) {
    if (message === "1") this.queue = [];
  }

  _scheduleSend(timeout) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(
      this._sendQueue.bind(this),
      timeout || this.SEND_TIMEOUT
    );
  }

  _sendQueue() {
    if (this.queue.length === 0) return;

    if (!this.isConnected) return this._scheduleSend();

    this.ws.send("!emscripten" + this.queue.join("\n"));
  }
}

const Tracer = new Tracing();

self.addEventListener(
  "message",
  (e) => {
    const message = e.data;
    const cmd = message.cmd;
    if (cmd === "post") {
      Tracer.send(message.entry);
    } else if (cmd === "configure") {
      const url = message.url.replace(/^http/, "ws");
      Tracer.connect(
        `${url}?version=${message.data_version}&session=${message.session_id}`
      );
    } else if (cmd === "close") {
      console.log("WANT TO CLOSE");
      Tracer.disconnect();
    }
  },
  false
);
