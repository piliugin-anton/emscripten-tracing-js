const HeapView = require("./HeapView");
const MemoryLayoutView = require("./MemoryLayoutView");
const SummaryView = require("./SummaryView");
const LogMessageView = require("./LogMessageView");
const ContextNode = require("./ContextNode");
const SessionError = require("./SessionError");
const SessionFrame = require("./SessionFrame");
const EVENTS = require("./Events");

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
      this.context.enter(Number(entry[1]));
    } else if (entry[0] === EVENTS.EXIT_CONTEXT) {
      this.context.exit(Number(entry[1]));
      this.context = this.context.parent;
    } else {
      this.context.update(entry, this.heapView);
    }

    // Record errors
    if (entry[0] === EVENTS.REPORT_ERROR)
      return this.errors.push(
        new SessionError(Number(entry[1]), entry[2], entry[3])
      );

    // Update per-frame data
    if (entry[0] === EVENTS.FRAME_END) {
      this.current_frame.complete(Number(entry[1]));
      this.frames.push(this.current_frame);
      this.current_frame = null;
    } else if (entry[0] === EVENTS.FRAME_START) {
      if (this.current_frame !== null) {
        console.log("this.current_frame is not null!");
        this.current_frame.complete(Number(entry[1]));
        this.frames.push(this.current_frame);
      }
      this.current_frame = new SessionFrame(
        this.next_frame_id(),
        Number(entry[1])
      );
    } else if (this.current_frame !== null) {
      this.current_frame.update(entry, this.heapView);
    }

    /* Update views
      We have to update the heap before the others as they
      may query it. Unless it is a 'fr' event, in which case
      we need to do it after we update the other views. */
    if (entry[0] !== EVENTS.FREE) {
      this.heapView.update(entry, this);
    }
    this.views.memory_layout.update(entry);
    this.views.summary.update(entry);
    this.views.log_messages.update(entry);

    if (entry[0] === EVENTS.FREE) {
      this.heapView.update(entry, this);
    }
  }

  get_view(viewName) {
    if (viewName === "heap") return this.heapView;

    return this.views[viewName];
  }

  update_cached_data() {
    this.peak_allocated = this.get_view("summary").peak_allocated;
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

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  get peak_allocated_formatted() {
    return this.formatBytes(this.peak_allocated);
  }
}

module.exports = Sessions;
