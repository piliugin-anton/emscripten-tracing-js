import WebSocketAsPromised from "websocket-as-promised";
import ReconnectingWebSocket from "reconnecting-websocket";

class Tracing {
  constructor() {
    this.wsp = null;
    this.rws = null;
    this.queue = [];
    this.timeout = null;
    this.SEND_TIMEOUT = 500;
    this.DISCONNECT_TIMEOUT = 1000;
  }

  get isClosed() {
    return this.wsp.isClosed || this.rws.CLOSED;
  }

  connect(wsUrl) {
    this.wsp = new WebSocketAsPromised(wsUrl, {
      createWebSocket: (url) => {
        if (this.rws === null) {
          this.rws = new ReconnectingWebSocket(url);
          this.rws.debug = true;
          this.rws.maxReconnectInterval = 1000;
          this.rws.onopen = () => this._scheduleSend();
        }
        return this.rws;
      },
      packMessage: (data) => JSON.stringify(data),
      unpackMessage: (data) => JSON.parse(data),
      attachRequestId: (data, requestId) =>
        Object.assign({ id: requestId }, data), // attach requestId to message as `id` field
      extractRequestId: (data) => data && data.id,
    });

    return this.wsp.open();
  }

  disconnect() {
    if (this.queue.length > 0)
      return setTimeout(this.disconnect, this.DISCONNECT_TIMEOUT);

    if (this.wsp.isOpened) return this.wsp.close();

    return Promise.reject("WebSocket is not connected");
  }

  send(message) {
    this.queue.push({ id: this._generateID(), message });
    this._scheduleSend();
  }

  _scheduleSend() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this._sendQueue.bind(this), this.SEND_TIMEOUT);
  }

  _sendQueue() {
    if (this.queue.length === 0) return;
    console.log("Sending queue...");
    this.wsp
      .sendRequest(this.queue)
      .then((data) => {
        console.log("Queue sent, got response...");
        const { ids } = data;
        this.queue = this.queue.filter((msg) => !ids.includes(msg.id));
      })
      .catch((ex) => console.error(ex))
      .finally(() => {
        this.isSending = false;
      });
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
