const path = require("path");
const fs = require("fs");
const mime = require("mime");
const { match } = require("path-to-regexp");
const { autoBind } = require("./utils.js");

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

    if (options.hasOwnProperty("cors") && typeof options.cors !== "string") {
      throw new Error("CORS must be a string type, ex: '*'");
    }

    this.rootDir = options.rootDir || path.join(__dirname, "..");
    this.cors = options.cors;
    this.errorHandler =
      typeof options.errorHandler === "function" ? options.errorHandler : null;
    this.template = options.templateEngine;
    this.routes = [];
    this.routesCount = 0;

    autoBind(this);

    return this;
  }

  hasRoute(pattern) {
    return this.routes.findIndex((r) => r.pattern === pattern) !== -1;
  }

  addRoute(route = {}) {
    if (
      typeof route.pattern !== "string" ||
      (!route.static && !route.redirect && typeof route.template !== "string")
    ) {
      throw new Error(
        "Route must have a pattern. Non-static route must have a template."
      );
    }

    if (
      !route.static &&
      !route.redirect &&
      typeof route.handler !== "function"
    ) {
      throw new Error("Non-static routes must have a handler.");
    }

    if (!route.static && !route.hasOwnProperty("method")) {
      route.method = [
        HTTPController.METHODS.GET,
        HTTPController.METHODS.HEAD,
        HTTPController.METHODS.OPTIONS,
      ];
    }

    if (
      !route.static &&
      route.hasOwnProperty("method") &&
      typeof route.method !== "string" &&
      !Array.isArray(route.method)
    ) {
      throw new Error("Route methods can be a type of string or array.");
    }

    if (!route.static && route.hasOwnProperty("method")) {
      const methods = HTTPController.AVAILABLE_METHODS.map((method) =>
        method.toLowerCase()
      );

      if (
        typeof route.method === "string" &&
        methods.indexOf(route.method) === -1
      ) {
        throw new Error(`Method ${route.method} not found.`);
      }

      if (Array.isArray(route.method)) {
        const methodsLength = route.method.length;
        if (methodsLength === 0) {
          route.method = [
            HTTPController.METHODS.GET,
            HTTPController.METHODS.HEAD,
            HTTPController.METHODS.OPTIONS,
          ];
        } else {
          for (let i = 0; i < methodsLength; i++) {
            if (methods.indexOf(route.method[i]) === -1) {
              throw new Error(`Method ${route.method} not found.`);
            }
          }

          if (route.method.indexOf(HTTPController.METHODS.HEAD) === -1) {
            route.method.push(HTTPController.METHODS.HEAD);
          }

          if (route.method.indexOf(HTTPController.METHODS.OPTIONS) === -1) {
            route.method.push(HTTPController.METHODS.OPTIONS);
          }
        }
      }
    }

    if (
      route.static &&
      route.hasOwnProperty("method") &&
      route.method !== HTTPController.METHODS.GET
    ) {
      throw new Error("Static routes can only have a GET method.");
    }

    if (route.static) {
      route.method = [
        HTTPController.METHODS.GET,
        HTTPController.METHODS.HEAD,
        HTTPController.METHODS.OPTIONS,
      ];
    }

    if (route.hasOwnProperty("cors") && typeof route.cors !== "string") {
      throw new Error("CORS must be a string type, ex: '*'");
    }

    if (this.hasRoute(route.pattern)) {
      throw new Error(`Route with pattern ${route.pattern} already exists!`);
    }

    route.match = match(route.pattern, {
      decode: decodeURIComponent,
    });

    if (route.static && !route.dir) {
      route.dir = this.rootDir;
    }

    this.routes.push(route);
    this.routesCount++;

    if (route.redirect) {
      const newRedirectRoute = {
        pattern: route.redirect,
        method: route.method,
        static: route.static,
      };

      if (route.static) {
        newRedirectRoute.dir = route.dir;
      }

      if (typeof route.cors === "string") {
        newRedirectRoute.cors = route.cors;
      }

      this.addRoute(newRedirectRoute);
    }

    return this;
  }

  addRoutes(routes = []) {
    if (!Array.isArray(routes)) {
      throw new Error("Routes must be an array!");
    }

    const routesLength = routes.length;
    for (let i = 0; i < routesLength; i++) {
      this.addRoute(routes[i]);
    }

    return this;
  }

  attachTo(App) {
    App.any("/*", this.handleRequest);
  }

  writeHeaders(res, headers) {
    const headersLength = headers.length;
    for (let i = 0; i < headersLength; i++) {
      res.writeHeader(...headers[i]);
    }
  }

  handleRequest(res, req) {
    // Request method
    req.__METHOD = req.getMethod();

    // Request URL
    req.__URL = req.getUrl();
    // Request query
    req.__QUERY = req.getQuery();

    // Trying to find a route
    for (let i = 0; i < this.routesCount; i++) {
      const match = this.routes[i].match(req.__URL);
      if (
        match &&
        ((typeof this.routes[i].method === "string" &&
          this.routes[i].method === req.__METHOD) ||
          (Array.isArray(this.routes[i].method) &&
            this.routes[i].method.indexOf(req.__METHOD) !== -1))
      ) {
        req.__ROUTE = this.routes[i];
        req.__PARAMS = { ...match.params };
        break;
      }
    }

    // Generate request object
    const requestObject = this.generateRequestObject(
      req.__URL,
      req.__METHOD,
      req.__QUERY,
      req.__PARAMS
    );

    // Route not found
    if (!req.__ROUTE) return this.handleError(404, res, requestObject);

    // CORS
    const cors = req.__ROUTE.cors || this.cors;

    // OPTIONS request
    if (req.__METHOD === HTTPController.METHODS.OPTIONS) {
      return this.handleOptionsRequest(res, req, cors);
    }

    // Handle redirect (301)
    if (req.__ROUTE.redirect) return this.handleRedirect(res, req, cors);

    // Static route
    if (req.__ROUTE.static) {
      const filePath = req.__URL.split("/").join(path.sep);
      const absoluteFilePath = path.join(req.__ROUTE.dir, filePath);

      // File not found
      if (!fs.existsSync(absoluteFilePath))
        return this.handleError(404, res, requestObject, cors, true);

      const stat = fs.statSync(absoluteFilePath, {
        bigint: true,
      });

      // Damn! It's not a file (it's a directory)
      if (!stat.isFile())
        return this.handleError(404, res, requestObject, cors, true);

      const mimeType =
        mime.getType(absoluteFilePath) || "application/octet-stream";

      // Head request
      if (req.__METHOD === HTTPController.METHODS.HEAD)
        return this.handleHeadRequest(
          res,
          req,
          stat.size.toString(),
          mimeType,
          cors
        );

      // Stream a file
      // TODO: Bundle CSS + JS
      return this.streamFile(req, res, absoluteFilePath, stat, mimeType, cors)
        .then(
          (status) =>
            typeof status === "string" &&
            res.writeStatus(status).endWithoutBody()
        )
        .catch((err) => {
          console.log("streamFile() exception", err);
          return res.endWithoutBody();
        });
    }

    // POST request
    if (req.__METHOD === HTTPController.METHODS.POST)
      return handlePostRequest(res, req);

    // Non-static route

    // Get data from route handler
    const data = req.__ROUTE.handler(requestObject);

    // Render template (HTML)
    const HTML = this.template.render(req.__ROUTE.template, data || {});

    // Cannot render HTML, return 500
    if (!HTML) return this.handleError(500, res, requestObject);

    // HEAD request
    if (req.__METHOD === HTTPController.METHODS.HEAD)
      return this.handleHeadRequest(
        res,
        Buffer.byteLength(HTML).toString(),
        "text/html",
        cors
      );

    // Woohoo! Return HTML
    return this.handleResponse(res, req, HTML, cors);
  }

  handleOptionsRequest(res, req, cors) {
    res
      .writeStatus(HTTPController.STATUSES[200])
      .writeHeader("Allow", this.getMethodsString(req.__METHOD));

    this.addCORS(res, req, cors);

    return res.endWithoutBody();
  }

  handleHeadRequest(res, req, size, mimeType, cors) {
    res
      .writeStatus(HTTPController.STATUSES[200])
      .writeHeader("Content-Type", mimeType)
      .writeHeader("Content-Length", size);

    this.addCORS(res, req, cors);

    return res.endWithoutBody();
  }

  handleRedirect(res, req, cors) {
    res.writeStatus(HTTPController.STATUSES[301]);

    this.addCORS(res, req, cors);

    return res.writeHeader("Location", req.__ROUTE.redirect).endWithoutBody();
  }

  handlePostRequest(res, req) {
    const contentType = req.getHeader("content-type");
    console.log("Content-Type", contentType);
    res.endWithoutBody();
  }

  addCORS(res, req, cors) {
    if (cors) {
      res.writeHeader("Access-Control-Allow-Origin", cors);
      res.writeHeader(`Access-Control-Allow-Methods: ${this.getMethodsString(req.__METHOD)}`);
    }
  }

  generateRequestObject(url, method, query, params) {
    return {
      url,
      method,
      get params() {
        return params || {};
      },
      get query() {
        return query ? new URLSearchParams(query) : new URLSearchParams();
      },
    };
  }

  handleResponse(res, HTML, cors) {
    res.writeStatus("200 OK").writeHeader("Content-Type", "text/html");

    this.addCORS(res, cors);

    return res.end(HTML);
  }

  handleError(code, res, requestObject, cors, isStatic) {
    let HTML = null;

    if (this.errorHandler && !isStatic) {
      const { template, data } = this.errorHandler(requestObject, code);
      HTML = this.template.render(template, data || {});
    }

    if (!HTML) HTML = HTTPController.STATUSES[code];

    res
      .writeStatus(HTTPController.STATUSES[code])
      .writeHeader("Content-Type", "text/html");

    this.addCORS(res, cors);

    return res.end(HTML);
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

  streamFile(req, res, file, stat, mimeType, cors) {
    return new Promise((resolve, reject) => {
      const ifModifiedSince = req.getHeader("if-modified-since");
      const { mtime } = stat;

      if (ifModifiedSince && new Date(ifModifiedSince) >= mtime) {
        // TODO: test it
        return resolve(HTTPController.STATUSES[304]);
      }

      const headers = [];

      headers.push(["Content-Type", mimeType]);

      mtime.setMilliseconds(0);
      const mtimeutc = mtime.toUTCString();
      headers.push(["Last-Modified", mtimeutc]);

      const range = req.getHeader("range");
      let { size } = stat;
      let start = 0;
      let end = size;
      if (req.__METHOD === HTTPController.METHODS.GET && range) {
        const match = range.match(/bytes=([0-9]+)-([0-9]+)/);
        const startNumber = Number(match[1]);
        const endNumber = Number(match[2]);
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
        res.writeStatus(HTTPController.STATUSES[206]);
        size = end - start;
      }

      if (cors) headers.push(["Access-Control-Allow-Origin", cors]);

      this.writeHeaders(res, headers);

      const readStream = fs.createReadStream(file, {
        start,
        end,
      });

      res.onAborted(() =>
        this.onAbortedOrFinishedStream(res, readStream, () => resolve())
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
          this.onAbortedOrFinishedStream(res, readStream, () => resolve());
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
              this.onAbortedOrFinishedStream(res, readStream, () => resolve());
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

  static get METHODS() {
    return {
      HEAD: "head",
      GET: "get",
      POST: "post",
      OPTIONS: "options",
    };
  }

  static get AVAILABLE_METHODS() {
    return Object.keys(HTTPController.METHODS);
  }

  static get STATUSES() {
    return {
      200: "200 OK",
      206: "206 Partial Content",
      301: "301 Moved Permanently",
      304: "304 Not Modified",
      403: "403 Forbidden",
      404: "404 Not Found",
      500: "500 Internal Server Error",
    };
  }
}

module.exports = HTTPController;
