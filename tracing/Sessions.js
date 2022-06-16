const HeapView = require("./HeapView");
const MemoryLayoutView = require("./MemoryLayoutView");
const SummaryView = require("./SummaryView");
const LogMessageView = require("./LogMessageView");
const ContextNode = require("./ContextNode");
const SessionError = require("./SessionError");
const SessionFrame = require("./SessionFrame");
const EVENTS = require("./Events");
const { formatBytes } = require("./utils");

class Sessions {
  constructor(session_id) {
    this.frame_id = 0;
    this.context_id = 0;
    this.session_id = session_id;
    this.name = session_id;
    this.application = "unknown";
    this.username = "unknown";
    this.current_frame = null;
    this.frames = [];
    this.entries = [];
    this.errors = [];
    this.heapView = new HeapView();
    this.views = {
      memory_layout: new MemoryLayoutView(),
      summary: new SummaryView(this.heapView),
      log_messages: new LogMessageView(),
    };
    this.context = new ContextNode(null, "Root", this);
    // Cached data
    this.peak_allocated = 0;
  }

  next_frame_id() {
    return (this.frame_id = this.frame_id + 1);
  }

  next_context_id() {
    return (this.context_id = this.context_id + 1);
  }

  update(entry) {
    // Some configuration options ...
    if (entry[0] === EVENTS.APPLICATION_NAME)
      return (this.application = entry[1]);

    if (entry[0] === EVENTS.SESSION_NAME) this.name = entry[1];

    if (entry[0] === EVENTS.USER_NAME) return (this.username = entry[1]);

    this.entries.push(entry);

    // Update context
    if (entry[0] === EVENTS.ENTER_CONTEXT) {
      this.context = this.context.get_child(entry[2], this);
      this.context.enter(entry[1]);
    } else if (entry[0] === EVENTS.EXIT_CONTEXT) {
      this.context.exit(entry[1]);
      this.context = this.context.parent;
    } else {
      this.context.update(entry, this.heapView);
    }

    // Record errors
    if (entry[0] === EVENTS.REPORT_ERROR)
      return this.errors.push(
        new SessionError(entry[1], entry[2], entry[3])
      );

    // Update per-frame data
    if (entry[0] === EVENTS.FRAME_END) {
      this.current_frame.complete(entry[1]);
      this.frames.push(this.current_frame);
      this.current_frame = null;
    } else if (entry[0] === EVENTS.FRAME_START) {
      if (this.current_frame !== null) {
        console.log("this.current_frame is not null!");
        this.current_frame.complete(entry[1]);
        this.frames.push(this.current_frame);
      }
      this.current_frame = new SessionFrame(
        this.next_frame_id(),
        entry[1]
      );
    } else if (this.current_frame !== null) {
      this.current_frame.update(entry, this.heapView);
    }

    /* Update views
      We have to update the heap before the others as they
      may query it. Unless it is a 'free' event, in which case
      we need to do it after we update the other views. */
    if (entry[0] !== EVENTS.FREE) {
      this.heapView.update(entry, this);
    }

    if (entry[0] === EVENTS.MEMORY_LAYOUT) {
      this.views.memory_layout.update(entry);
    }

    this.views.summary.update(entry);

    if (entry[0] == EVENTS.LOG_MESSAGE) {
      this.views.log_messages.update(entry);
    }

    if (entry[0] === EVENTS.FREE) {
      this.heapView.update(entry, this);
    }
  }

  update_cached_data() {
    this.peak_allocated = this.views.summary.peak_allocated;
  }

  get_flattened_context_data() {
    const contexts = [];
    this.add_context_data(contexts, this.context, 0);
    return contexts;
  }

  add_context_data(contexts, context, indent) {
    contexts.push(context.get_flattened_data(indent));
    const childrenLength = context.children.length;
    if (childrenLength) {
      for (let i = 0; i < childrenLength; i++) {
        this.add_context_data(contexts, children[i], indent + 1);
      }
    }
  }

  get peak_allocated_formatted() {
    return formatBytes(this.peak_allocated);
  }

  get name_formatted() {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const date = new Date(this.name);
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    // TODO: add zero to h,m,s
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  }

  get key() {
    return `${this.session_id}.${this.data_version}`;
  }
}

module.exports = Sessions;
