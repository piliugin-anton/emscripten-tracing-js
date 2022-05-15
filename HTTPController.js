const path = require("path");
const fs = require("fs");
const mime = require("mime");
const { pathToRegexp } = require("path-to-regexp");

const printObject = (object) => console.log(JSON.stringify(object, null, 2));

class HTTPController {
  constructor(options = {}) {
    if (
      typeof options.templateEngine !== "object" ||
      typeof options.templateEngine.render !== "function"
    ) {
      throw new Error(
        "Provide a template engine object (or class instance), this object must have a 'render()' method."
      );
    }

    this.template = options.templateEngine;
    this.routes = [];
    this.routesCount = 0;
  }

  hasRoute(pattern) {
    return this.routes.findIndex((r) => r.pattern === pattern) !== -1;
  }

  addRoute(route = {}) {
    if (
      typeof route.pattern !== "string" ||
      (route.static && typeof route.template !== "string")
    ) {
      throw new Error(
        "Route must have a pattern. Non-static route must have a template."
      );
    }

    if (!route.static && typeof route.handler !== "function") {
      throw new Error("Non-static routes must have a handler.");
    }

    if (!route.static && typeof route.method !== "string") {
      throw new Error("Non-static routes must have a method (GET, POST, etc.)");
    }

    if (this.hasRoute(route.pattern)) {
      throw new Error(`Route with pattern ${route.pattern} already exists!`);
    }

    route.regexp = pathToRegexp(route.pattern);

    if (route.static && !route.dir) {
      route.dir = __dirname;
    }

    this.routes.push(route);
    this.routesCount++;
  }

  addRoutes(routes = []) {
    if (!Array.isArray(routes)) {
      throw new Error("Routes must be an array!");
    }

    const routesLength = routes.length;
    for (let i = 0; i < routesLength; i++) {
      this.addRoute(routes[i]);
    }
  }

  attach() {
    return ["/*", this.handleRequest];
  }

  handleRequest(res, req) {
    const route = req.getUrl();

    let routeFound = false;
    for (let i = 0; i < this.routesCount; i++) {
      if (this.routes[i].regexp.exec(route)) {
        routeFound = this.routes[i];
        break;
      }
    }

    if (!routeFound) return handleError(404, res, req);

    if (routeFound.static) {
      const filePath = route.split("/").join(path.sep);
      const absoluteFilePath = path.join(routeFound.dir, filePath);

      // File not found
      if (!fs.existsSync(absoluteFilePath))
        return handleError(404, res, req, route);

      const stat = fs.statSync(absoluteFilePath);
      // Damn! It's not a file (it's a directory)
      if (!stat.isFile()) return handleError(404, res, req, route);

      // Stream a file
      // TODO: Bundle CSS + JS
      return this.streamFile(req, res, absoluteFilePath, stat)
        .then((status) => {
          if (typeof status === "string") return res.writeStatus(status).end();
        })
        .catch((err) => {
          console.log("fileStream exception", err);
          return res.end();
        });
    }

    // Non-static route (dynamic)
    // Page (HTML)
    const HTML = Templates.render(view.template, {});

    // Cannot render HTML, return 500
    if (!HTML.length) return handleError(500, res, req, route);

    // Woohoo! Return HTML
    return this.render(HTML);
  }

  handleResponse(res, HTML) {
    return res
      .writeStatus("200 OK")
      .writeHeader("Content-Type", "text/html")
      .end(HTML);
  }

  writeHeaders(res, headers) {
    const headersLength = headers.length;
    for (let i = 0; i < headersLength; i++) {
      const header = headers[i];

      if (header.length !== 2) {
        continue;
      }

      res.writeHeader(header[0], header[1]);
    }
  }

  onAbortedOrFinishedStream(res, readStream, promise) {
    if (res.id !== -1) {
      readStream.destroy();
      promise();
    }
    res.id = -1;
  }

  /* Helper function converting Node.js buffer to ArrayBuffer */
  toArrayBuffer(buffer) {
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
  }

  streamFile(req, res, file, stat) {
    return new Promise((resolve, reject) => {
      const ifModifiedSince = req.getHeader("if-modified-since");
      let range = req.getHeader("range");
      const { mtime } = stat;
      let { size } = stat;
      const headers = [];

      if (ifModifiedSince && new Date(ifModifiedSince) >= mtime) {
        // TODO: test it
        return resolve(HTTPController.STATUS_CODES[304]);
      }

      mtime.setMilliseconds(0);
      const mtimeutc = mtime.toUTCString();
      headers.push(["Last-Modified", mtimeutc]);

      const mimeType = mime.getType(file) || "application/octet-stream";
      headers.push(["Content-Type", mimeType]);

      let start = 0;
      let end = size;
      if (range) {
        const parts = range.replace("bytes=", "").split("-");
        const startNumber = Number(parts[0]);
        const endNumber = Number(parts[1]);
        if (startNumber < endNumber) {
          if (startNumber > 0 && startNumber < end) {
            start = startNumber;
          }
          if (endNumber > 0 && endNumber < end) {
            end = endNumber;
          }
        }

        headers.push(["Accept-Ranges", "bytes"]);
        headers.push(["Content-Range", `bytes ${start}-${end}/${size}`]);
        // TODO: test it
        res.writeStatus(HTTPController.STATUS_CODES[206]);
        size = end - start;
      }

      this.writeHeaders(res, headers);

      const readStream = fs.createReadStream(file, {
        start,
        end,
      });

      res.onAborted(() =>
        this.onAbortedOrFinishedStream(res, readStream, () => resolve(null))
      );

      readStream.on("error", (err) => {
        console.log("readStream error", err);
        this.onAbortedOrFinishedStream(res, readStream, () => reject(err));
      });

      readStream.on("data", (buffer) => {
        /* We only take standard V8 units of data */
        const chunk = this.toArrayBuffer(buffer);

        /* Store where we are, globally, in our response */
        const lastOffset = res.getWriteOffset();

        /* Streaming a chunk returns whether that chunk was sent, and if that chunk was last */
        const [ok, done] = res.tryEnd(chunk, size);

        /* Did we successfully send last chunk? */
        if (done) {
          this.onAbortedOrFinishedStream(res, readStream, () => resolve(true));
        } else if (!ok) {
          /* If we could not send this chunk (backpressure), pause */
          readStream.pause();

          /* Save unsent chunk for when we can send it */
          res.ab = chunk;
          res.abOffset = lastOffset;

          /* Register async handlers for drainage */
          res.onWritable((offset) => {
            /* Here the timeout is off, we can spend as much time before calling tryEnd we want to */

            /* On failure the timeout will start */
            const [ok, done] = res.tryEnd(
              res.ab.slice(offset - res.abOffset),
              size
            );

            if (done) {
              this.onAbortedOrFinishedStream(res, readStream, () =>
                resolve(true)
              );
            } else if (ok) {
              readStream.resume();
            }

            /* We always have to return true/false in onWritable.
             * If you did not send anything, return true for success. */
            return ok;
          });
        }
      });
    });
  }

  static get REQUEST_METHOD() {
    return {
      GET: "GET",
      POST: "POST",
    };
  }

  static get STATUS_CODES() {
    return {
      200: "200 OK",
      206: "206 Partial Content",
      304: "304 Not Modified",
      403: "403 Forbidden",
      404: "404 Not Found",
      500: "500 Internal Server Error",
    };
  }
}

module.exports = HTTPController;
