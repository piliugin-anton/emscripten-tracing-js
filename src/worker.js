import axios from "axios";

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