const HeapEntry = require("./HeapEntry");
const EVENTS = require("./Events");

class HeapView {
  constructor() {
    this.EVENT_ID = 0;
    this.entries = [];
    this.entries_by_address = {};
    this.memory_errors = [];
    this.allocated_memory = 0;
  }

  cmp(a, b) {
    return (a > b) - (a < b);
  }

  next_event_id() {
    this.EVENT_ID++;
    return this.EVENT_ID;
  }

  update(entry, session) {
    if (entry[0] === EVENTS.ALLOCATE) {
      const address = entry[2];
      const size = entry[3];

      const he = new HeapEntry(
        this.next_event_id(),
        session.FRAME_ID,
        HeapView.EVENT_ALLOCATE,
        entry[1],
        address,
        size,
        session.context
      );
      this.allocated_memory = this.allocated_memory + size;
      he.allocated_memory = this.allocated_memory;
      this.entries.push(he);
      this.entries_by_address[address] = he;
    } else if (entry[0] === EVENTS.REALLOCATE) {
      // XXX: IMPLEMENT
    } else if (entry[0] === EVENTS.FREE) {
      const timestamp = entry[1];
      const address = entry[2];

      const freeEntry = HeapEntry(
        this.next_event_id(),
        session.FRAME_ID,
        EVENTS.FREE,
        timestamp,
        address,
        0,
        session.context
      );
      this.entries.push(freeEntry);

      const oldEntry = this.entries_by_address[address];
      if (oldEntry) {
        freeEntry.size = oldEntry.size;
        oldEntry.lifetime = timestamp - oldEntry.timestamp;
        freeEntry.lifetime = oldEntry.lifetime;
        oldEntry.matching_event_id = freeEntry.id;
        freeEntry.matching_event_id = oldEntry.id;
        freeEntry.type = oldEntry.type;
        delete this.entries_by_address[address];
        this.allocated_memory = this.allocated_memory - freeEntry.size;
        freeEntry.allocated_memory = this.allocated_memory;
      } else {
        this.memory_errors.push(["Invalid free", timestamp, address]);
      }
    } else if (entry[0] === EVENTS.ANNOTATE_TYPE) {
      const he = this.entries_by_address[entry[1]];
      if (he) he.type = entry[2];
      else
        console.log(
          `NO ADDRESS MAPPING FOUND FOR ${entry[1]} TO ANNOTATE TYPE "${entry[2]}"`
        );
    } else if (entry[0] === EVENTS.ASSOCIATE_STORAGE_SIZE) {
      const he = this.entries_by_address[entry[1]];
      if (he) he.associated_storage_size = entry[2];
      else
        console.log(
          `NO ADDRESS MAPPING FOUND FOR ${entry[1]} TO ASSOCIATE STORAGE SIZE "${entry[2]}"`
        );
    }
  }
}

module.exports = HeapView;
