const fs = require("fs");
const path = require("path");
const { Server, StaticFiles, CORS, CustomError } = require("uquik");
const TemplateEngine = require("./server/TemplateEngine.js");
const FileReader = require("./tracing/FileReader");
const Sessions = require("./tracing/Sessions");

const port = 5000;
const host = "127.0.0.1";

const dataDir = path.join(__dirname, "data");

const getSessionFiles = (dir) => {
  return new Promise((resolve, reject) => {
    const emscriptenFiles = [];
    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
      if (err) reject(err);
      else {
        const lastIndex = files.length - 1;
        files.forEach((file, index) => {
          if (file.isFile() && file.name.endsWith(".emscripten")) {
            const fileName = path.join(dir, file.name);

            if (/([0-9]+_[0-9]+)\.([0-9]+)/.test(fileName)) emscriptenFiles.push(fileName);

            if (index === lastIndex) resolve(emscriptenFiles);
          }
        });
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

const Templates = new TemplateEngine({
  rootDir: __dirname,
});

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
  request.once("end", () => {
    if (!writeStream.destroyed) writeStream.destroy();
    next();
  });
  request.pipe(writeStream);
});

uquik.get("/static/*", static);
uquik.head("/static/*", static);

uquik.get("/", (request, response) => {
  console.log(response.sessions);
  response.html(
    Templates.render("index.eta", {
      title: "Sessions",
      pageTitle: "Sessions",
      //sessions: []
    })
  );
});
uquik.use("/", async (request, response, next) => {
  try {
    const sessionFiles = await getSessionFiles(dataDir);
    const sessionsLength = sessionFiles.length;
    const sessions = [];
    for (let i = 0; i < sessionsLength; i++) {
      const file = sessionFiles[i];
      const fileReader = new FileReader(file);
      const fileName = path.basename(file, path.extname(file));

      const match = fileName.match(/([0-9]+_[0-9]+)\.([0-9]+)/);
      if (!match || match.length < 3) continue;

      const sessionID = match[1];
      console.log("sessionID", sessionID);
      const session = new Sessions(sessionID);

      let data;
      while ((data = fileReader.next)) {
        session.update(data);
      }
      sessions.push(session);
    }
    console.log(sessions.length)
    return (response.sessions = sessions);
  } catch (ex) {
    console.log(ex)
    return next(ex);
  }
});

uquik
  .listen(port, host)
  .then((socket) => console.log("[uQuik] Server started"))
  .catch((error) => console.log("[uQuik] Failed to start a server", error));
