const MemoryLayoutData = require("./MemoryLayoutData");
const EVENTS = require("./Events");

class MemoryLayoutView {
  constructor() {
    this.snapshots = [];
    this.current = null;
  }

  update(entry) {
    if (entry[0] === EVENTS.MEMORY_LAYOUT) {
      this.current = MemoryLayoutData.get(Number(entry[1]), entry[2]);
      this.snapshots.push(current);
    }
  }
}

module.exports = MemoryLayoutView;
