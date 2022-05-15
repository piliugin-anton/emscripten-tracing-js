const path = require("path");
const fs = require("fs");
const { pathToRegexp } = require("path-to-regexp");
const TemplatesClass = require("./Templates");
const FileStream = require("./FileStream");

const printObject = (object) => console.log(JSON.stringify(object, null, 2));

const Templates = new TemplatesClass();

const routesToViews = [
  // Static files
  {
    // prettier-ignore
    regexp: pathToRegexp("/static\/(.+)"),
    static: true,
  },

  // Index page (home)
  {
    // prettier-ignore
    regexp: pathToRegexp("/"),
    template: "index.eta",
    public: true,
  },
];

const errorHandler = (code, variables = {}) => {
  const statuses = {
    403: "403 Forbidden",
    404: "404 Not Found",
    500: "500 Internal Server Error",
  };

  const HTML = Templates.render("errors.eta", variables);
  if (HTML === null) {
    return {
      status: statuses[500],
      html: statuses[500],
    };
  }

  return {
    status: statuses[code],
    html: HTML,
  };
};

const routesLength = routesToViews.length;

const HTTPController = (res, req) => {
  const sessionId = req.getParameter(0) || null;
  const route = req.getUrl();

  for (let i = 0; i < routesLength; i++) {
    const view = routesToViews[i];

    if (view.regexp.exec(route)) {
      // Static files
      if (view.static) {
        const filePath = route.split("/").join(path.sep);
        const absoluteFilePath = path.join(__dirname, filePath);
        if (fs.existsSync(absoluteFilePath)) {
          const stat = fs.statSync(absoluteFilePath);
          // Damn! It's not a file (it's a directory)
          if (!stat.isFile()) {
            const error = errorHandler(404, { message: `Route ${route}` });
            return res
              .writeStatus(error.status)
              .writeHeader("Content-Type", "text/html")
              .end(error.html);
          }

          // Stream a file
          // TODO: Bundle CSS + JS
          FileStream(req, res, absoluteFilePath, stat)
            .then((status) => {
              if (typeof status === "string") res.writeStatus(status).end();
            })
            .catch((err) => {
              console.log("fileStream exception", err);
              return res.end();
            });

          return;
        }

        // File not found
        const error = errorHandler(404, { message: `Route ${route}` });
        return res
          .writeStatus(error.status)
          .writeHeader("Content-Type", "text/html")
          .end(error.html);
      }

      // 403 Forbidden
      if (!view.public && sessionId === null) {
        const error = errorHandler(403, { message: `Route ${route}` });
        return res
          .writeStatus(error.status)
          .writeHeader("Content-Type", "text/html")
          .end(error.html);
      }

      // Page (HTML)
      const HTML = Templates.render(view.template, {});

      // Cannot render HTML, return 500
      if (HTML === null) {
        const error = errorHandler(500, { message: `Route ${route}` });
        return res
          .writeStatus(error.status)
          .writeHeader("Content-Type", "text/html")
          .end(error.html);
      }

      // Woohoo! Return HTML
      return res
        .code(200)
        .writeStatus("200 OK")
        .writeHeader("Content-Type", "text/html")
        .end(HTML);
    }
  }

  // 404 Not Found
  const error = errorHandler(404, { message: `Route ${route}` });
  return res
    .writeStatus(error.status)
    .writeHeader("Content-Type", "text/html")
    .end(error.html);
};

module.exports = HTTPController;
