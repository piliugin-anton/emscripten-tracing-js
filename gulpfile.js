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
var stripJS = require("gulp-strip-comments");
var cleanCSS = require("gulp-clean-css");
var path = require("path");
var resources = require("./templates/resources");

var workerFilePath = path.join(__dirname, "src", "worker.js");
var templatesGlob = path.join(__dirname, "templates", "**/*");
var style = path.join(__dirname, "www", "static", "style.css");

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
    .pipe(
      stripJS({
        safe: false,
        space: false,
        trim: true,
      })
    )
    .pipe(gulp.dest(__dirname));
});

gulp.task("templates", function () {
  return gulp
    .src(resources)
    .pipe(gif("**/*.js", concat("bundle.min.js")))
    .pipe(gif("**/*.css", concat("bundle.min.css")))
    .pipe(
      gif(
        "bundle.min.js",
        minify({
          ext: {
            min: ".js",
          },
          noSource: true,
          mangle: false,
        })
      )
    )
    .pipe(
      gif(
        "bundle.min.js",
        stripJS({
          safe: false,
          space: false,
          trim: true,
        })
      )
    )
    .pipe(
      gif(
        "bundle.min.css",
        cleanCSS({
          compatibility: "*",
          level: {
            1: {
              specialComments: 0
            }
          },
        })
      )
    )
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
    watch: ["./server.js", "./server/**/*", "./www/static/bundle.min.js", "./www/static/bundle.min.css"],
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
  gulp.watch([templatesGlob, style], gulp.series("templates"));
});

var defaultTasks = ["worker.js", "templates"];

var isDev = process.env.NODE_ENV === "development";
if (isDev) {
  defaultTasks.push("develop");
}

gulp.task("default", gulp.series(defaultTasks));
