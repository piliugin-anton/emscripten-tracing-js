import ReconnectingWebSocket from "reconnecting-websocket";

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

    this.ws = new ReconnectingWebSocket(this.wsURL, "emscripten-trace", {
      maxRetries: Infinity,
      connectionTimeout: 10000,
      minUptime: 1000,
      maxReconnectInterval: 1000,
      reconnectionDelayGrowFactor: 1,
      debug: true
    });

    this.ws.onmessage = (e) => this._onMessage(e.data);
  }

  disconnect() {
    console.log("disconnect!!!");
    if (this.queue.length > 0) {
      this._scheduleSend(1);
      return setTimeout(this.disconnect, this.DISCONNECT_TIMEOUT);
    }

    if (isConnected) return this.ws.close();
  }

  send(message) {
    this.queue.push({ id: this._generateID(), message });
    this._scheduleSend();
  }

  _onMessage(data) {
    console.log("Got response");
    try {
      const ids = JSON.parse(data);
      if (ids.length) this.queue = this.queue.filter((msg) => !ids.includes(msg.id));
    } catch(ex) {
      console.error("Receieved message is not a JSON string");
    }
  }

  _scheduleSend(timeout) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this._sendQueue.bind(this), timeout || this.SEND_TIMEOUT);
  }

  _sendQueue() {
    if (this.queue.length === 0) return;

    if (!this.isConnected) return this._scheduleSend();

    console.log("Sending queue...");
    this.ws.send(JSON.stringify(this.queue));
  }

  _generateID() {
    return Math.random().toString(36).slice(2);
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
