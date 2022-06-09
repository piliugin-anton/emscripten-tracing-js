const fs = require("fs");
const path = require("path");
const { Server, StaticFiles, CORS, CustomError } = require("uquik");
const TemplateEngine = require("./server/TemplateEngine.js");

const port = 5000;
const host = "127.0.0.1";

const dataDir = path.join(__dirname, "data");

const cleanup = (dir) => {
  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    if (err) console.log(err);
    else {
      files.forEach((file) => {
        if (file.isFile() && file.name.endsWith(".emscripten")) {
          fs.unlink(path.join(dir, file.name), (err) => {
            if (err) console.log(`Can't delete ${file.name}`);
            else {
              console.log(`File ${file.name} deleted successfully!`);
            }
          });
        }
      });
    }
  });
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
    allowedHeaders: ["content-type", "emscripten-tracing-js", "emscripten-data-length"],
  })
);

uquik.get("/worker.js", static);
uquik.head("/worker.js", static);

uquik.post(
  "/trace/:version/:session",
  { max_body_length: 33554432 },
  (request, response) => response.json({ length: Number(request.headers.get("emscripten-data-length")) })
);
uquik.use("/trace/", (request, response, next) => {
  const contentType = request.headers.get("content-type");
  const isEmscripten = request.headers.get("emscripten-tracing-js");
  if (!isEmscripten || contentType !== "text/emscripten-data") return next(new CustomError("Incorrect input data", 400));

  const version = request.path_parameters.get("version");
  const session = request.path_parameters.get("session");
  const fileName = `${session}.${version}.emscripten`;
  const writeStream = fs.createWriteStream(path.join(dataDir, fileName), { flags: "a" });
  request.once('end', () => {
    if (!writeStream.destroyed) writeStream.destroy();
    next();
  });
  request.pipe(writeStream);
});

uquik.get("/static/*", static);
uquik.head("/static/*", static);

uquik.get("/", (request, response) =>
  response.html(
    Templates.render("index.eta", {
      title: "Sessions",
      pageTitle: "Sessions",
      //sessions: []
    })
  )
);
uquik.use("/", (request, response, next) => next());

uquik
  .listen(port, host)
  .then((socket) => console.log("[uQuik] Server started"))
  .catch((error) => console.log("[uQuik] Failed to start a server", error));
