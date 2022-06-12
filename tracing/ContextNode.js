const EVENTS = require("./Events");

class ContextNode {
  constructor(parent, name, session) {
    this.id = session.next_context_id();
    this.parent = parent;
    if (parent) parent.children.push(this);
    this.children = [];
    this.name = name;
    this.full_name = this.build_full_name();
    this.last_enter_timestamp = 0;
    this.times_entered = 0;
    this.this_time_elapsed = 0;
    this.total_time_elapsed = 0;
    this.alloc_count = 0;
    this.alloc_bytes = 0;
    this.free_count = 0;
    this.free_bytes = 0;
    this.delta_bytes = 0;
  }

  get_child(name, session) {
    const childrenLength = this.children.length;
    if (childrenLength) {
      for (let i = 0; i < childrenLength; i++) {
        if (this.children[i].name === name) return this.children[i];
      }
    }

    return new ContextNode(this, name, session);
  }

  enter(timestamp) {
    this.times_entered = this.times_entered + 1;
    this.last_enter_timestamp = timestamp;
  }

  exit(timestamp) {
    this.this_time_elapsed += timestamp - this.last_enter_timestamp;
    this.delta_bytes = this.alloc_bytes - this.free_bytes;
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
      const size = heapView.size_for_address(entry[2]);
      this.free_count = this.free_count + 1;
      this.free_bytes = this.free_bytes + size;
    }
  }

  build_context_stack() {
    let node = this;
    const stack = [];
    while (node.parent !== null) {
      stack.push(node);
      node = node.parent;
    }
    return stack;
  }

  build_full_name() {
    const stack = this.build_context_stack();
    return stack.map((node) => node.name).join(" << ");
  }

  get_flattened_data(indent) {
    return {
      id: this.id,
      indent: indent,
      parent_id: (this.parent && this.parent.id) || 0,
      has_children: this.children.length > 0,
      name: this.name,
      times_entered: this.times_entered,
      this_time_elapsed: this.this_time_elapsed,
      total_time_elapsed: this.total_time_elapsed,
      alloc_count: this.alloc_count,
      alloc_bytes: this.alloc_bytes,
      free_count: this.free_count,
      free_bytes: this.free_bytes,
      delta_bytes: this.delta_bytes,
    };
  }
}

module.exports = ContextNode;
