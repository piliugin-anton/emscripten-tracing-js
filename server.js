const fs = require("fs");
const path = require("path");
const { Server, StaticFiles, CORS, CustomError } = require("uquik");
const pug = require('pug');
const SessionReader = require("./tracing/SessionReader");

const port = 5000;
const host = "127.0.0.1";

const dataDir = path.join(__dirname, "data");
const templatesDir = path.join(__dirname, "templates");

const getSessionFiles = (dir) => {
  return new Promise((resolve, reject) => {
    const emscriptenFiles = [];
    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
      if (err) reject(err);
      else {
        files.forEach((file, index) => {
          if (file.isFile() && file.name.endsWith(".emscripten")) {
            const fileName = path.join(dir, file.name);
            if (/([0-9]+_[0-9]+)\.([0-9]+)/.test(fileName))
              emscriptenFiles.push(fileName);
          }
        });
        resolve(emscriptenFiles);
      }
    });
  });
};

const cleanup = (dir) => {
  getSessionFiles(dir)
    .then((files) =>
      files.forEach((file) => {
        fs.unlink(file, (err) => {
          if (err) console.log(`Can't delete ${file.name}`);
          else {
            console.log(`File ${file.name} deleted successfully!`);
          }
        });
      })
    )
    .catch((error) => console.log("Error while reading files list", error));
};

process.on("SIGINT", () => cleanup(dataDir));

const uquik = new Server({
  json_errors: true,
});

const static = StaticFiles({ root: path.join(__dirname, "www") });

uquik.use(
  CORS({
    methods: ["GET", "HEAD", "POST"],
    allowedHeaders: [
      "content-type",
      "emscripten-tracing-js",
      "emscripten-data-length",
    ],
  })
);

uquik.get("/worker.js", static);
uquik.head("/worker.js", static);

uquik.post(
  "/trace/:version/:session",
  { max_body_length: 33554432 },
  (request, response) =>
    response.json({
      length: Number(request.headers.get("emscripten-data-length")),
    })
);
uquik.use("/trace/", (request, response, next) => {
  const contentType = request.headers.get("content-type");
  const isEmscripten = request.headers.get("emscripten-tracing-js");
  if (!isEmscripten || contentType !== "text/emscripten-data")
    return next(new CustomError("Incorrect input data", 400));

  const version = request.path_parameters.get("version");
  const session = request.path_parameters.get("session");
  const fileName = `${session}.${version}.emscripten`;
  const writeStream = fs.createWriteStream(path.join(dataDir, fileName), {
    flags: "a",
  });
  writeStream.once("error", (err) => response.throw(err));

  request.once("end", () => {
    writeStream.write("\r\n");
    if (!writeStream.destroyed) writeStream.destroy();
    next();
  });
  request.pipe(writeStream);
});

uquik.get("/static/*", static);
uquik.head("/static/*", static);

uquik.get("/", async (request, response) => {
  const data = {
    title: "Sessions",
    pageTitle: "Sessions",
    sessions: response.locals.sessions,
  };

  response.html(pug.renderFile(path.join(templatesDir, "index.pug"), data));
});
uquik.use("/", async (request, response, next) => {
  try {
    const sessionFiles = await getSessionFiles(dataDir);
    const sessionsLength = sessionFiles.length;
    const sessions = [];
    for (let i = 0; i < sessionsLength; i++) {
      const sessionReader = new SessionReader(sessionFiles[i]);
      sessionReader.read();
      if (sessionReader.session) sessions.push(sessionReader.session);
    }
    response.locals.sessions = sessions;
  } catch (ex) {
    console.log(ex);
    return ex;
  }
});

uquik.get("/session/:fileName", async (request, response) => {
  const data = {
    title: "Overview",
    pageTitle: "Overview",
    session: response.locals.session,
    activePage: "index"
  };

  response.html(pug.renderFile(path.join(templatesDir, "session", "index.pug"), data));
});
uquik.use("/session/", (request, response, next) => {
  const fileName = `${request.path_parameters.get("fileName")}.emscripten`;
  const sessionReader = new SessionReader(path.join(dataDir, fileName));
  sessionReader.read();
  console.log(sessionReader.session)
  if (!sessionReader.session) return next(new CustomError("Cannot load session", 404));

  response.locals.session = sessionReader.session;
  next();
})

uquik
  .listen(port, host)
  .then((socket) => console.log("[uQuik] Server started"))
  .catch((error) => console.log("[uQuik] Failed to start a server", error));
