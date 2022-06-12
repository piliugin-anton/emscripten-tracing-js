const gulp = require("gulp");
const gif = require("gulp-if");
const concat = require("gulp-concat");
const browserify = require("browserify");
const babelify = require("babelify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const babelMinify = require("gulp-babel-minify");
const minify = require("gulp-minify");
const nodemon = require("./helpers/gulp-nodemon");
const stripJS = require("gulp-strip-comments");
const cleanCSS = require("gulp-clean-css");
const path = require("path");

const workerFilePath = path.join(__dirname, "src", "worker.js");
const tracingGlob = path.join(__dirname, "tracing", "**/*");
const webDir = path.join(__dirname, "www");
const staticDir = path.join(webDir, "static");
const style = path.join(staticDir, "style.css");
const resourcesFile = path.join(__dirname, "templates", "resources.json");
const serverFile = path.join(__dirname, "server.js");

const getResources = () => {
  return require("./templates/resources.json").map((r) =>
    path.join(__dirname, "www", r)
  );
};

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

gulp.task("resources", () => {
  return gulp
    .src(getResources())
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
              specialComments: 0,
            },
          },
        })
      )
    )
    .pipe(gulp.dest(staticDir));
});

if (process.env.NODE_ENV === "development") {
  gulp.watch([style, resourcesFile], gulp.series("resources"));
}

gulp.task("server", (done) => {
  const server = nodemon({
    script: "server.js",
    env: {
      NODE_ENV: "development",
    },
    ext: "js json",
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

const defaultTasks = ["worker.js", "resources"];

if (process.env.NODE_ENV === "development") {
  defaultTasks.push("server");
}

gulp.task("default", gulp.series(defaultTasks));
