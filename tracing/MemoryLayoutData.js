class MemoryLayoutData {
  static get(timestamp, data) {
    return {
      timestamp,
      static_base: data.static_base,
      static_top: data.static_top,
      stack_base: data.stack_base,
      stack_top: data.stack_top,
      stack_max: data.stack_max,
      dynamic_base: data.dynamic_base,
      dynamic_top: data.dynamic_top,
      total_memory: data.total_memory,
    };
  }
}

module.exports = MemoryLayoutData;