var queue = [];
var interval = null;
var pingInterval = null;
var SEND_INTERVAL = 500;
var PING_INTERVAL = 16000;
var CLOSE_TIMEOUT = 100;

function send(entry) {
  queue.push(entry);
}

function wsConnect(url, data_version, session_id) {
  WS = new WebSocket(
    url +
    "tracer?version=" +
    data_version +
    "&session=" +
    session_id
  );

  WS.onmessage = function (e) {
    var message = JSON.parse(e.data);
    console.log("message from WS", message);
  };

  WS.onopen = function (e) {
    pingInterval = setInterval(ping, PING_INTERVAL);
    interval = setInterval(sendQueue, SEND_INTERVAL);
  };

  WS.onclose = function (e) {
    clearInterval(pingInterval);
    clearInterval(interval);
    wsConnect(url, data_version, session_id);
  };
}

function wsSend(data) {
  if (WS.readyState === WebSocket.OPEN) {
    WS.send(JSON.stringify(data));
    return true;
  }

  return false;
}

function sendQueue() {
  if (queue.length !== 0) {
    if (wsSend(queue)) {
      queue = [];
    }
  }
}

function ping() {
  wsSend({ ping: 1 });
}

function attemptClose() {
  if (queue.length === 0) {
    self.close();
  } else {
    setTimeout(attemptClose, CLOSE_TIMEOUT);
  }
}

self.addEventListener(
  "message",
  function (e) {
    var message = e.data;
    var cmd = message.cmd;
    if (cmd === "post") {
      send(message.entry);
    } else if (cmd === "configure") {
      wsConnect(
        message.url.replace(/^http/, "ws"),
        message.data_version,
        message.session_id
      );
    } else if (cmd === "close") {
      attemptClose();
    }
  },
  false
);
