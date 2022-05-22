import axios from "axios";
import WebsocketReconnect from "websocket-reconnect-pro";

class Tracing {
  constructor() {
    this.session = null;
    this.version = null;
    this.timeout = null;
    this.client = null;
    this.queue = [];
    this.SEND_TIMEOUT = 500;
    this.DESTROY_TIMEOUT = 1000;
  }

  configure(url, session, version) {
    this.session = session;
    this.version = version;
    this.url = url;
    this.client = axios.create({
      baseURL: url,
      timeout: 3000,
      headers: {
        "Emscripten-Tracing-JS": this.version,
        "Content-Type": "text/emscripten-data",
      },
    });
  }

  destroy() {
    if (this.queue.length > 0) {
      this._scheduleSend(0);
      return setTimeout(this.destroy.bind(this), this.DESTROY_TIMEOUT);
    }

    this.session = null;
    this.version = null;
    this.client = null;
    this.queue = [];
    clearTimeout(this.timeout);
    this.timeout = null;
  }

  send(message) {
    this.queue.push(message);
    this._scheduleSend();
  }

  _arrayJoin(array, separator) {
    let string = "";
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      const added = i === arrayLength - 1 ? array[i] : array[i] + separator;
      string += added;
    }

    return string;
  }

  _scheduleSend(timeout) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(
      this._sendQueue.bind(this),
      timeout !== undefined ? timeout : this.SEND_TIMEOUT
    );
  }

  _sendQueue() {
    if (this.queue.length === 0 || !this.session || !this.version) return;

    /*this.client.post(
      `/trace?session=${this.session}&version=${this.version}`,
      this._arrayJoin(this.queue, "\n")
    ).then((res) => console.log("Success", res))
    .catch((error) => console.log(error));*/
    fetch(
      `${this.url}trace?session=${this.session}&version=${this.version}`,
      {
        method: "POST",
        headers: {
          "Emscripten-Tracing-JS": this.version,
          "Content-Type": "text/emscripten-data",
        },
        body: this._arrayJoin(this.queue, "\n"),
        mode: "*cors"
      }
    );
  }
}

class Tracing2 {
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
      debug: true,
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

  _arrayJoin(array, separator) {
    let string = "";
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      const added = i === arrayLength - 1 ? array[i] : array[i] + separator;
      string += added;
    }

    return string;
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

    this.ws.send("!emscripten" + this._arrayJoin(this.queue, "\n"));
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
      console.log("Configure me!");
      //const url = message.url.replace(/^http/, "ws");
      Tracer.configure(message.url, message.session_id, message.data_version);
      /*Tracer.connect(
        `${url}?version=${message.data_version}&session=${message.session_id}`
      );*/
    } else if (cmd === "close") {
      console.log("WANT TO CLOSE");
      //Tracer.disconnect();
      Tracer.destroy();
    }
  },
  false
);
