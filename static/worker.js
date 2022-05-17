var queue = [];
var CLOSE_TIMEOUT = 100;
var WS = null;

function send(entry) {
  queue.push(entry)
  if (WS !== null) {
    WS.send(JSON.stringify(queue));
    queue = [];
  }
}

function attemptClose() {
  if (queue.length === 0) {
    self.close();
  } else {
    setTimeout(attemptClose, CLOSE_TIMEOUT);
  }
}

self.addEventListener(
  'message',
  function (e) {
    var message = e.data
    var cmd = message.cmd
    if (cmd === 'post') {
      send(message.entry);
    } else if (cmd === 'configure') {
      WS = new WebSocket(message.url + "?version=" + message.data_version + "&session=" + message.session_id);
    } else if (cmd === 'close') {
      attemptClose();
    }
  },
  false
)
