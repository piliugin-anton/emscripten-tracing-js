class SessionError {
  constructor(timestamp, error, callstack) {
    this.timestamp = timestamp;
    this.error = error;
    this.callstack = callstack;
  }
}

module.exports = SessionError