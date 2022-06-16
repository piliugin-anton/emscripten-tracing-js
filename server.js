const fs = require("fs");
const path = require("path");
const { Server, StaticFiles, CORS, CustomError } = require("uquik");
const pug = require("pug");
const Papa = require("papaparse");
const Sessions = require("./tracing/Sessions");

const port = 5000;
const host = "127.0.0.1";

const sessions = new Map();

const templatesDir = path.join(__dirname, "templates");

const uquik = new Server();

const static = StaticFiles({
  root: path.join(__dirname, "www"),
});

uquik.use(
  CORS({
    methods: ["GET", "HEAD", "POST"],
    allowedHeaders: [
      "content-type",
      "emscripten-tracing-js"
    ],
  })
);

uquik.get("/worker.js", static);
uquik.head("/worker.js", static);

uquik.get("/static/*", static);
uquik.head("/static/*", static);

uquik.post(
  "/trace/:version/:sessionId",
  { max_body_length: 33554432 },
  (request, response) =>
    response.json({
      length: request.locals.dataLength || 0,
    })
);
uquik.use("/trace/", async (request, response, next) => {
  if (!request.headers.has("emscripten-tracing-js"))
    return next(new CustomError("Incorrect input data", 400));

  const version = request.path_parameters.get("version");
  const sessionId = request.path_parameters.get("sessionId");
  const key = `${sessionId}.${version}`;
  const session = sessions.has(key) ? sessions.get(key) : sessions.set(key, new Sessions(sessionId)).get(key);
  if (!session.data_version) session.data_version = version;
  const sessionData = await request.json();
  if (Array.isArray(sessionData)) {
    const sessionDataLength = sessionData.length;
    request.locals.dataLength = sessionDataLength;
    for (let i = 0; i < sessionDataLength; i++) {
      session.update(sessionData[i]);
    }
    session.update_cached_data();
  }
});

uquik.get("/", (request, response) => {
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
uquik.use("/", (request, response, next) => {
  response.locals.sessions = [];
  sessions.forEach((session) => response.locals.sessions.push(session));
  next();
});

uquik.get("/session/:sessionKey/:infoType", (request, response) => {
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
    heap_size: {
      title: "Heap Objects by Size",
      pageTitle: "Heap Objects by Size",
      activePage: "heap-size",
      template: path.join("session", "heap", "size.pug"),
    }
  };

  const dataInfo = info[request.locals.infoType];

  if (!dataInfo)
    return response.status(404).html(
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
    session: response.locals.session
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
  request.locals.key = request.path_parameters.get("sessionKey");
  response.locals.session = sessions.get(request.locals.key);

  if (!response.locals.session)
    return response.status(404).html(
      pug.renderFile(path.join(templatesDir, "error.pug"), {
        title: "Error",
        pageTitle: "Error",
        message: "Cannot load session",
      })
    );

  next();
});

uquik.get("/api/session/:sessionKey/:method", (request, response) => {
  const data = {
    heap_type: response.locals.session.heapView.heap_allocation_data_by_type(),
    heap_size: response.locals.session.heapView.heap_allocation_data_by_size(),
  };
  const reply = data[request.locals.method];
  if (!reply) return response.status(400).json({ error: "Bad request" });
  response.json(reply);
});
uquik.use("/api/session/", (request, response, next) => {
  request.locals.key = request.path_parameters.get("sessionKey");
  request.locals.method = request.path_parameters.get("method");
  response.locals.session = sessions.get(request.locals.key);

  if (!response.locals.session)
    return response.status(404).json({ error: "Can't load session" });

  next();
});

uquik.get("/csv/:sessionKey/:infoType", (request, response) => {
  if (request.locals.infoType === "heap_type") {
    response.attachment(`${request.locals.key}_heap_type.csv`).send(Papa.unparse(response.locals.session.heapView.heap_allocation_data_by_type()));
  }
});
uquik.use("/csv/", (request, response, next) => {
  request.locals.key = request.path_parameters.get("sessionKey");
  request.locals.infoType = request.path_parameters.get("infoType");
  response.locals.session = sessions.get(request.locals.key);

  if (!response.locals.session)
    return response.status(404).json({ error: "Can't load session" });

  next();
});

uquik
  .listen(port, host)
  .then((socket) => console.log("[uQuik] Server started"))
  .catch((error) => console.log("[uQuik] Failed to start a server", error));
