const EVENTS = require("./Events");

class SessionFrame {
  constructor(frame_id, timestamp) {
    this.frame_id = frame_id;
    this.start = timestamp;
    this.end = 0;
    this.duration = 0;
    this.alloc_count = 0;
    this.alloc_bytes = 0;
    this.free_count = 0;
    this.free_bytes = 0;
    this.delta_bytes = 0;
  }

  update(entry, heapView) {
    if (entry[0] === EVENTS.ALLOCATE) {
      const size = entry[3];
      this.alloc_count = this.alloc_count + 1;
      this.alloc_bytes = this.alloc_bytes + size;
    } else if (entry[0] === EVENTS.REALLOCATE) {
      const oldSize = heapView.size_for_address(entry[2]);
      const newSize = entry[4];
      const changedSize = newSize - oldSize;
      if (changedSize > 0) {
        this.alloc_bytes = this.alloc_bytes + changedSize;
      } else {
        this.free_bytes = this.free_bytes + -changedSize;
      }
    } else if (entry[0] === EVENTS.FREE) {
      size = heapView.size_for_address(entry[2]);
      this.free_count = this.free_count + 1;
      this.free_bytes = this.free_bytes + size;
    }
  }

  complete(timestamp) {
    this.end = timestamp;
    this.duration = this.end - this.start;
    this.delta_bytes = this.alloc_bytes - this.free_bytes;
  }
}

module.exports = SessionFrame;
