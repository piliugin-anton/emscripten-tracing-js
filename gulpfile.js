var gulp = require("gulp");
var gif = require("gulp-if");
var concat = require("gulp-concat");
var browserify = require("browserify");
var babelify = require("babelify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var babelMinify = require("gulp-babel-minify");
var minify = require("gulp-minify");
var nodemon = require("gulp-nodemon");
var path = require("path");
var resources = require("./templates/resources");

var workerFilePath = path.join(__dirname, "src", "worker.js");
var templatesGlob = path.join(__dirname, "templates", "**/*");

gulp.task("worker.js", function () {
  var browserified = browserify({
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
    .pipe(gulp.dest(__dirname));
});

gulp.task("templates", function () {
  return gulp
    .src(resources)
    .pipe(gif("**/*.js", concat("bundle.js")))
    .pipe(gif("**/*.css", concat("bundle.css")))
    .pipe(gulp.dest("static"));
});

gulp.task("develop", function (done) {
  var server = nodemon({
    script: "server.js",
    env: {
      NODE_ENV: "development",
    },
    ext: "js json eta",
    ignore: ["gulpfile.js", "package.json", "package-lock.json"],
    watch: ["./server.js", "./static/bundle.js", "./static/bundle.css"],
    done: done,
  });

  server
    .on("restart", function () {
      console.log("Server restarted!");
    })
    .on("crash", function () {
      console.error("Server has crashed! Restarting in 3 sec");
      server.emit("restart", 3);
    });

  gulp.watch(workerFilePath, gulp.series("worker.js"));
  gulp.watch(templatesGlob, gulp.series("templates"));
});

var defaultTasks = ["worker.js", "templates"];

var isDev = process.env.NODE_ENV === "development";
if (isDev) {
  defaultTasks.push("develop");
}

gulp.task("default", gulp.series(defaultTasks));
