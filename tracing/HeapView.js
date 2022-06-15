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
        EVENTS.ALLOCATE,
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

      const freeEntry = new HeapEntry(
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

  size_for_address(address) {
    const entry = this.entries_by_address[address];
    if (entry) return entry.size;

    return 0;
  }

  avg(total, count) {
    if (count > 0) return (total / count).toFixed(0);
    else return 0;
  }

  heap_allocation_data_by_type(format = null) {
    const type_data = {};
    const allocation_entries = this.entries.filter(
      (e) => e.event === EVENTS.ALLOCATE
    );
    let id = 0;
    const allocation_entries_length = allocation_entries.length;
    for (let i = 0; i < allocation_entries_length; i++) {
      const e = allocation_entries[i];
      const exists = type_data[e.type];
      const d = exists || {
        id: 0,
        type: e.type,
        count_all: 0,
        count_live: 0,
        total_bytes_all: 0,
        total_bytes_live: 0,
        total_storage_size_all: 0,
        total_storage_size_live: 0,
      };

      if (!d.id) {
        d.id = id;
        id += 1;
      }

      d.count_all += 1;
      d.total_bytes_all += e.size;
      d.total_storage_size_all += e.associated_storage_size;

      if (!e.matching_event_id) {
        d.count_live += 1;
        d.total_bytes_live += e.size;
        d.total_storage_size_live += e.associated_storage_size;
      }

      if (!exists) type_data[e.type] = d;
    }

    for (const type in type_data) {
      type_data[type].average_bytes_all = this.avg(
        type_data[type].total_bytes_all,
        type_data[type].count_all
      );
      type_data[type].average_bytes_live = this.avg(
        type_data[type].total_bytes_live,
        type_data[type].count_live
      );
      type_data[type].average_storage_size_all = this.avg(
        type_data[type].total_storage_size_all,
        type_data[type].count_all
      );
      type_data[type].average_storage_size_live = this.avg(
        type_data[type].total_storage_size_live,
        type_data[type].count_live
      );
    }

    // TODO: finish this part
    //const types = type_data.values()
    // Use negation to reverse the sort
    //types.sort(lambda x,y: cmp(-x['count_all'], -y['count_all']))
    if (format === "csv") return console.log("Write CSV");
    return Object.values(type_data);
  }

  heap_allocation_data_by_size() {
    const size_data = {};
    const allocation_entries = this.entries.filter(
      (e) => e.event === EVENTS.ALLOCATE
    );
    const allocation_entries_length = allocation_entries.length;
    for (let i = 0; i < allocation_entries_length; i++) {
      const e = allocation_entries[i];
      const exists = size_data[e.size];
      const d = exists || {
        id: e.size,
        size: e.size,
        count_all: 0,
        count_live: 0,
        bytes_all: 0,
        bytes_live: 0,
      };
      d.count_all += 1;
      d.bytes_all += e.size;
      if (!e.matching_event_id) {
        d.count_live += 1;
        d.bytes_live += e.size;
      }

      if (!exists) size_data[e.size] = d;
    }
    sizes = size_data.values();
    // TODO: sort
    //sizes.sort(lambda x,y: cmp(x['size'], y['size']))
    return sizes;
  }

  heap_fragmentation_data() {
    const allocations = this.entries_by_address.values();
    const holes = [];
    let lastAllocationEnd = 0;
    if (allocations.length > 1) {
      // TODO: sort
      //allocations.sort(lambda x,y: cmp(x.address, y.address))
      lastAllocationEnd = allocations[0].address;
      const allocations_length = allocations.length;
      for (let i = 0; i < allocations_length; i++) {
        const allocation = allocations[i];
        allocationStart = allocation.address;
        if (lastAllocationEnd < allocationStart)
          holes.push([lastAllocationEnd, allocationStart - lastAllocationEnd]);
        lastAllocationEnd = allocationStart + allocation.size;
      }
    }

    const hole_data = {};
    let total_hole_size = 0;
    for (const h in holes) {
      const hole = holes[h];
      hole_size = hole[1];
      total_hole_size += hole_size;
      const exist = hole_data[hole_size];
      const d = exist || {
        id: hole_size,
        size: hole_size,
        count: 0,
        bytes: 0,
      };
      d.count += 1;
      d.bytes += hole_size;

      if (!exist) hole_data[hole_size] = d;
    }

    holes = hole_data.values();
    //holes.sort(lambda x,y: cmp(x['size'], y['size']))
    return {
      holes: holes,
      fragmentation_percentage:
        (total_hole_size / float(lastAllocationEnd)) * 100,
      total_hole_size: total_hole_size,
      last_allocation_top: lastAllocationEnd,
    };
  }
}

module.exports = HeapView;
