const EVENTS = require("./Events");

class LogMessageView {
  constructor() {
    this.entries = [];
  }

  update(entry, session) {
    const t = entry.slice(1);
    t.push(session.context);
    this.entries.push(t);
  }
}

module.exports = LogMessageView;