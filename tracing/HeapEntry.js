class HeapEntry {
  constructor(id, frame_id, event, timestamp, address, size, context) {
    this.id = id;
    this.frame_id = frame_id;
    this.event = event;
    this.timestamp = timestamp;
    this.address = address;
    this.size = size;
    // TODO: Add type?
    this.type = null;
    this.context = context;
    // TODO: Add lifetime?
    this.lifetime = null;
    // TODO: Add matching event id?
    this.matching_event_id = null;
    this.allocated_memory = 0;
    this.associated_storage_size = 0;
  }

  get serialize() {
    return {
      id: this.id,
      frame_id: this.frame_id,
      event: this.event,
      timestamp: this.timestamp,
      address: this.address,
      size: this.size,
      type: this.type,
      context: this.context.full_name,
      lifetime: this.lifetime,
      matching_event_id: this.matching_event_id,
      allocated_memory: this.allocated_memory,
      associated_storage_size: this.associated_storage_size
    };
  }
}

module.exports = HeapEntry;
