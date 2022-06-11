const EVENTS = require("./Events");

class SummaryView {
  constructor(heap_view) {
    this.heap_view = heap_view;
    this.total_allocated = 0;
    this.total_allocations = 0;
    this.current_allocated = 0;
    this.current_allocations = 0;
    this.peak_allocated = 0;
    this.peak_allocations = 0;
  }

  update(entry) {
    if (entry[0] === EVENTS.ALLOCATE) {
      const size = Number(entry[3]);
      this.total_allocated = this.total_allocated + size;
      this.total_allocations = this.total_allocations + 1;
      this.current_allocated = this.current_allocated + size;
      this.current_allocations = this.current_allocations + 1;
      this.peak_allocated = Math.max(
        this.peak_allocated,
        this.current_allocated
      );
      this.peak_allocations = Math.max(
        this.peak_allocations,
        this.current_allocations
      );
    } else if (entry[0] === EVENTS.REALLOCATE) {
      const oldSize = this.heap_view.size_for_address(entry[2]);
      const newSize = Number(entry[4]);
      const changedSize = newSize - oldSize;
      this.current_allocated = this.current_allocated + changedSize;
      this.peak_allocated = Math.max(
        this.peak_allocated,
        this.current_allocated
      );
    } else if (entry[0] === EVENTS.FREE) {
      const size = this.heap_view.size_for_address(entry[2]);
      this.current_allocated = this.current_allocated - size;
      this.current_allocations = this.current_allocations - 1;
    }
  }
}

module.exports = SummaryView;