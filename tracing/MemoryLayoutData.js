class MemoryLayoutData {
  static get(timestamp, data) {
    return {
      timestamp,
      static_base: data.hasOwnProperty('static_base') ? data.static_base : 0,
      static_top: data.hasOwnProperty('static_top') ? data.static_top : 0,
      stack_base: data.hasOwnProperty('stack_base') ? data.stack_base : 0,
      stack_top: data.hasOwnProperty('stack_top') ? data.stack_top : 0,
      stack_max: data.hasOwnProperty('stack_max') ? data.stack_max : 0,
      dynamic_base: data.hasOwnProperty('dynamic_base') ? data.dynamic_base : 0,
      dynamic_top: data.hasOwnProperty('dynamic_top') ? data.dynamic_top : 0,
      total_memory: data.hasOwnProperty('total_memory') ? data.total_memory : 0,
    };
  }
}

module.exports = MemoryLayoutData;