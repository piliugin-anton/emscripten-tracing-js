const EVENTS = require("./Events");

class LogMessageView {
  constructor() {
    this.entries = [];
  }

  update(entry, session) {
    if (entry[0] == EVENTS.LOG_MESSAGE) {
      const t = entry.slice(1);
      t.push(session.context);
      this.entries.push(t);
    }
  }
}

module.exports = LogMessageView;