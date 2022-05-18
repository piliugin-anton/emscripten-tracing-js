var gulp = require("gulp");
var gif = require("gulp-if");
var concat = require("gulp-concat");
var browserify = require("browserify");
var babelify = require("babelify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var resources = require("./templates/resources");

gulp.task("worker.js", function () {
  var browserified = browserify({
    entries: "./src/worker.js",
    debug: true,
    transform: [
      babelify.configure({
        presets: ["@babel/preset-env"],
      }),
    ],
  });

  return browserified
    .bundle()
    .pipe(source("./src/worker.js"))
    .pipe(buffer())
    .pipe(gulp.dest(__dirname));
});

gulp.task("templates resources (CSS/JS)", function () {
  return gulp
    .src(resources)
    .pipe(gif("**/*.js", concat("bundle.js")))
    .pipe(gif("**/*.css", concat("bundle.css")))
    .pipe(gulp.dest("static"));
});

gulp.task(
  "default",
  gulp.parallel("worker.js", "templates resources (CSS/JS)")
);
