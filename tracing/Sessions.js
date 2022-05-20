const HeapView = require("./HeapView");
const MemoryLayoutView = require("./MemoryLayoutView");
const SummaryView = require("./SummaryView");
const LogMessageView = require("./LogMessageView");
const EVENTS = require("./Events");

class Sessions {
  constructor(session_id) {
    this.frame_id = 0;
    this.context_id = 0;
    this.session_id = session_id;
    this.name = session_id;
    this.application = "unknown";
    this.username = "unknown";
    this.currentFrame = null;
    this.frames = [];
    this.entries = [];
    this.errors = [];
    this.heapView = new HeapView();
    this.views = {
      memory_layout: new MemoryLayoutView(),
      summary: new SummaryView(this.heapView),
      log_messages: new LogMessageView(),
    };
    this.context = this;
    // Cached data
    this.peak_allocated = 0;
  }

  update(entry) {
    // Some configuration options ...
    if (entry[0] === EVENTS.APPLICATION_NAME) {
      this.application = entry[1];
      return;
    }

    if (entry[0] === EVENTS.SESSION_NAME) {
      this.name = entry[1];
    }
    if (entry[0] === EVENTS.USER_NAME) {
      this.username = entry[1];
      return;
    }
    this.entries.push(entry);

    // Update context
    if (entry[0] === EVENTS.ENTER_CONTEXT) {
      this.context = this.context.get_child(entry[2], self);
      this.context.enter(entry[1]);
    } else if (entry[0] === EVENTS.EXIT_CONTEXT) {
      this.context.exit(entry[1]);
      this.context = this.context.parent;
    } else {
      this.context.push(entry, this.heapView);
    }

    // Record errors
    if (entry[0] === EVENTS.REPORT_ERROR) {
      this.errors.push(SessionError(entry[1], entry[2], entry[3]));
      return;
    }

    // Update per-frame data
    if (entry[0] === EVENTS.FRAME_END) {
      this.currentFrame.complete(entry[1]);
      this.frames.push(this.currentFrame);
      this.currentFrame = null;
    } else if (entry[0] === EVENTS.FRAME_START) {
      if (this.currentFrame !== null) {
        console.log("this.currentFrame is not null!");
        this.currentFrame.complete(entry[1]);
        this.frames.append(this.currentFrame);
      }
      this.currentFrame = SessionFrame(this.next_frame_id(), entry[1]);
    } else if (this.currentFrame !== null) {
      this.currentFrame.update(entry, this.heapView);
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
    if (viewName === "heap") {
      return this.heapView;
    }
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
}

module.exports = Sessions;