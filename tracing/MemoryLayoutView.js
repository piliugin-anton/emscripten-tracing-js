const MemoryLayoutData = require("./MemoryLayoutData");
const EVENTS = require("./Events");
const { formatBytes } = require("./utils")

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

  get static() {
    return formatBytes(this.current.static_top - this.current.static_base);
  }

  get stack() {
    return formatBytes(this.current.stack_top - this.current.stack_base);
  }

  get available_stack() {
    return formatBytes(this.current.stack_max - this.current.stack_top);
  }

  get dynamic() {
    return formatBytes(this.current.dynamic_top - this.current.dynamic_base);
  }

  get available_dynamic() {
    return formatBytes(this.current.total_memory - this.current.dynamic_top);
  }

  get total() {
    return formatBytes(this.current.total_memory);
  }
}

module.exports = MemoryLayoutView;
