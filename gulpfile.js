const gulp = require("gulp");
const browserify = require("browserify");
const babelify = require("babelify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const babelMinify = require("gulp-babel-minify");
const nodemon = require("./helpers/gulp-nodemon");
const stripJS = require("gulp-strip-comments");
const path = require("path");

const workerFilePath = path.join(__dirname, "src", "worker.js");
const tracingGlob = path.join(__dirname, "tracing", "**/*");
const webDir = path.join(__dirname, "www");
const serverFile = path.join(__dirname, "server.js");

gulp.task("worker.js", () => {
  const browserified = browserify({
    entries: workerFilePath,
    debug: false,
    sourceMaps: false,
    transform: [
      babelify.configure({
        presets: ["@babel/preset-env"],
      }),
    ],
  });

  return browserified
    .bundle()
    .pipe(source("worker.js"))
    .pipe(buffer())
    .pipe(
      babelMinify({
        mangle: {
          keepClassName: true,
        },
      })
    )
    .pipe(
      stripJS({
        safe: false,
        space: false,
        trim: true,
      })
    )
    .pipe(gulp.dest(webDir));
});

if (process.env.NODE_ENV === "development") {
  gulp.watch(workerFilePath, gulp.series("worker.js"));
}

gulp.task("server", (done) => {
  const server = nodemon({
    script: "server.js",
    env: {
      NODE_ENV: "development",
    },
    ext: "js",
    watch: [serverFile, tracingGlob],
    delay: 2500,
    done: done,
  });

  server
    .on("restart", () => {
      console.log("Server restarted!");
    })
    .on("crash", () => {
      console.error("Server has crashed! Restarting in 3 sec");
      server.emit("restart", 3000);
    });
});

const defaultTasks = ["worker.js"];

if (process.env.NODE_ENV === "development") {
  defaultTasks.push("server");
}

gulp.task("default", gulp.series(defaultTasks));
