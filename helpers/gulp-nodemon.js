const cp = require("child_process");
const path = require("path");
const colors = require("colors");
const bus = require("nodemon/lib/utils/bus");

module.exports = (options) => {
  options = options || {};

  // plug nodemon
  const nodemon =
    options.nodemon && typeof options.nodemon === "function"
      ? options.nodemon
      : require("nodemon");

  // Our script
  const script = nodemon(options),
    originalOn = script.on,
    originalListeners = bus.listeners("restart");

  // Allow for injection of tasks on file change
  if (options.tasks) {

    // Remove all 'restart' listeners
    bus.removeAllListeners("restart");

    // Place our listener in first position
    bus.on("restart", (files) => {
      if (!options.quiet) nodemonLog("Running tasks...");

      if (typeof options.tasks === "function") run(options.tasks(files));
      else run(options.tasks);
    });

    // Re-add all other listeners
    for (let i = 0; i < originalListeners.length; i++) {
      bus.on("restart", originalListeners[i]);
    }
  }

  // Capture ^C
  process.once("SIGINT", () => {
    script.emit("quit");
    script.quitEmitted = true;
  });

  script.on("exit", () => {
    // Ignore exit event during restart
    if (script.quitEmitted) {
      // Properly signal async completion by calling the callback provided by gulp
      if (typeof options.done === "function") {
        options.done();
      }

      process.exit(0);
    }
  });

  // Forward log messages and stdin
  script.on("log", (log) => {
    nodemonLog(log.colour);
  });

  // Shim 'on' for use with gulp tasks
  script.on = (_, ...tasks) => {
    const event = tasks.shift();

    if (event === "change") {
      script.changeTasks = tasks;
    } else {
      for (let i = 0; i < tasks.length; i++) {
        ((tasks) => {
          if (tasks instanceof Function) {
            originalOn(event, tasks);
          } else {
            originalOn(event, () => {
              if (Array.isArray(tasks)) {
                tasks.forEach((task) => {
                  run(task);
                });
              } else run(tasks);
            });
          }
        })(tasks[i]);
      }
    }

    return script;
  };

  const run = (task) => {
    if (typeof task === "string") task = [task];
    if (task.length === 0) return;
    if (!(task instanceof Array))
      throw new Error("Expected task name or array but found: " + task);

    const gulpPath = path.join(process.cwd(), "node_modules/.bin/");
    const gulpCmd = path.join(
      gulpPath,
      process.platform === "win32" ? "gulp.cmd" : "gulp"
    );

    const options = { stdio: [0, 1, 2] };
    if (process.platform === "win32") options.shell = true;

    cp.spawnSync(gulpCmd, task, options);
  };

  return script;
};

const nodemonLog = (message) => {
  console.log("[" + new Date().toString().split(" ")[4].gray + "] " + message);
};