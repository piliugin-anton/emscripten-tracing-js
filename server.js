const fs = require("fs");
const path = require("path");
const { Server, StaticFiles, CORS, CustomError } = require("uquik");
const pug = require("pug");
const Papa = require("papaparse");
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
          const fileName = path.basename(file);
          if (err) console.log(`Can't delete ${fileName}`);
          else {
            console.log(`File ${fileName} deleted successfully!`);
          }
        });
      })
    )
    .catch((error) =>
      console.log("Error while reading session files list", error)
    );
};

process.on("SIGINT", () => cleanup(dataDir));

const uquik = new Server();

const static = StaticFiles({
  root: path.join(__dirname, "www"),
});

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

  try {
    const rendered = pug.renderFile(path.join(templatesDir, "index.pug"), data);
    response.html(rendered);
  } catch (ex) {
    response.throw(ex);
  }
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
    return ex;
  }
});

uquik.get("/session/:fileName/:infoType", (request, response) => {
  const info = {
    overview: {
      title: "Overview",
      pageTitle: "Overview",
      activePage: "index",
      template: path.join("session", "index.pug"),
    },
    heap_type: {
      title: "Heap Objects by Type",
      pageTitle: "Heap Objects by Type",
      activePage: "heap-type",
      template: path.join("session", "heap", "type.pug"),
    },
  };

  const dataInfo = info[request.locals.infoType];

  if (!dataInfo)
    return response.html(
      pug.renderFile(path.join(templatesDir, "error.pug"), {
        title: "Error",
        pageTitle: "Error",
        message: "Page not found",
      })
    );

  const data = {
    title: dataInfo.title,
    pageTitle: dataInfo.pageTitle,
    activePage: dataInfo.activePage,
    pageSubTitle: `${response.locals.session.name} &mdash; ${response.locals.session.application} &mdash; ${response.locals.session.username}`,
    session: response.locals.session,
    fileName: request.locals.fileName,
  };

  try {
    const rendered = pug.renderFile(
      path.join(templatesDir, dataInfo.template),
      data
    );
    response.html(rendered);
  } catch (ex) {
    response.throw(ex);
  }
});
uquik.use("/session/", (request, response, next) => {
  request.locals.infoType = request.path_parameters.get("infoType");
  request.locals.fileName = request.path_parameters.get("fileName");
  const fileName = `${request.locals.fileName}.emscripten`;
  const sessionReader = new SessionReader(path.join(dataDir, fileName));
  sessionReader.read();

  if (!sessionReader.session)
    return response.status(404).html(
      pug.renderFile(path.join(templatesDir, "error.pug"), {
        title: "Error",
        pageTitle: "Error",
        message: "Cannot load session",
      })
    );

  response.locals.session = sessionReader.session;

  next();
});

uquik.get("/api/session/:fileName/:method", (request, response) => {
  const data = {
    heap_type: response.locals.session.heapView.heap_allocation_data_by_type(),
  };
  const reply = data[request.locals.method];
  if (!reply) return response.status(400).json({ error: "Bad request" });
  console.log(reply);
  response.json(reply);
});
uquik.use("/api/session/", (request, response, next) => {
  request.locals.fileName = request.path_parameters.get("fileName");
  request.locals.method = request.path_parameters.get("method");
  const fileName = `${request.locals.fileName}.emscripten`;
  const sessionReader = new SessionReader(path.join(dataDir, fileName));
  sessionReader.read();

  if (!sessionReader.session)
    return response.status(404).json({ error: "Can't load session" });

  response.locals.session = sessionReader.session;

  next();
});

uquik.get("/csv/:fileName/:infoType", (request, response) => {
  if (request.locals.infoType === "heap_type") {
    response.attachment(`${request.locals.fileName}_heap_type.csv`).send(Papa.unparse(response.locals.session.heapView.heap_allocation_data_by_type()));
  }
});
uquik.use("/csv/", (request, response, next) => {
  request.locals.fileName = request.path_parameters.get("fileName");
  request.locals.infoType = request.path_parameters.get("infoType");
  const fileName = `${request.locals.fileName}.emscripten`;
  const sessionReader = new SessionReader(path.join(dataDir, fileName));
  sessionReader.read();

  if (!sessionReader.session)
    return response.status(404).json({ error: "Can't load session" });

  response.locals.session = sessionReader.session;

  next();
});

uquik
  .listen(port, host)
  .then((socket) => console.log("[uQuik] Server started"))
  .catch((error) => console.log("[uQuik] Failed to start a server", error));
