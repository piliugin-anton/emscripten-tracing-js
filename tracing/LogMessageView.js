class LogMessageView {
  constructor() {
    this.entries = [];
  }

  update(entry, session) {
    const t = entry.slice(1);
    t.push(session.context);
    this.entries.push(t);
  }

  get messages() {
    return this.entries.map((entry, index) => ({
      id: index,
      timestamp: entry[0],
      channel: entry[1],
      event: entry[2].trim().replace('\\n', '<br>'),
      context: entry[3].full_name || entry[3].name,
    }))
  }
}

module.exports = LogMessageView;