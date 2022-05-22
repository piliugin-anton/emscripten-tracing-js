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

    this.rootDir = options.rootDir || path.join(__dirname, "..", "www");
    this.maxBufferSize = options.maxBufferSize || 16 * 1024 * 1024; // Default to 16Mb
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
      (!route.static &&
        !route.redirect &&
        !route.json &&
        typeof route.template !== "string")
    ) {
      throw new Error(
        "Route must have a pattern. Non-static route must have a template or should have an option 'json' set to 'true' (JSON API mode)"
      );
    }

    if (this.hasRoute(route.pattern)) {
      throw new Error(`Route with pattern ${route.pattern} already exists!`);
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

      if (typeof route.method === "string") {
        if (methods.indexOf(route.method) === -1) {
          throw new Error(`Method ${route.method} not found.`);
        }

        const notHead = route.method !== HTTPController.METHODS.HEAD;
        const notOptions = route.method !== HTTPController.METHODS.OPTIONS;

        if (notHead) {
          route.method = [route.method, HTTPController.METHODS.HEAD];
        }

        if (notOptions) {
          if (notHead) route.method.push(HTTPController.METHODS.OPTIONS);
          else route.method = [route.method, HTTPController.METHODS.OPTIONS];
        }
      } else {
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

    // Allowed methods
    req.__ALLOWED_METHODS = this.getMethodsString(req.__ROUTE.method);

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
        bigint: false,
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

    // Non-static route

    // POST request
    if (req.__METHOD === HTTPController.METHODS.POST)
      return this.handlePostRequest(res, req, requestObject, cors);

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
    return this.handleResponse(res, req, HTML, "text/html", cors);
  }

  handleOptionsRequest(res, req, cors) {
    res
      .writeStatus(HTTPController.STATUSES[200])
      .writeHeader("Allow", req.__ALLOWED_METHODS);

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
  // TODO: Add other data types
  handlePostRequest(res, req, requestObject, cors) {
    const expectedContentLength = Number(req.getHeader("content-length"));

    if (!expectedContentLength)
      return this.handleError(411, res, requestObject, cors, false);

    if (expectedContentLength > this.maxBufferSize)
      return this.handleError(413, res, requestObject, false);

    return this.readData(
      res,
      (data) => {
        try {
          const handlerData = req.__ROUTE.handler({
            ...requestObject,
            // TODO: Replace json parser with fastest version (library)?
            body: req.__ROUTE.json ? JSON.parse(data) : data,
          });

          return this.handleResponse(
            res,
            req,
            handlerData,
            req.__ROUTE.json ? "application/json" : "text/html",
            cors
          );
        } catch (ex) {
          // TODO: Add error meta to pass error message to a user?
          return this.handleError(500, res, requestObject, cors, false);
        }
      },
      requestObject
    );
  }

  addCORS(res, req, cors) {
    if (cors) {
      res.writeHeader("Access-Control-Allow-Origin", cors);
      res.writeHeader("Access-Control-Allow-Methods", req.__ALLOWED_METHODS);
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
  // TODO: add support for non-JSON
  handleResponse(res, req, data, dataType, cors) {
    res.writeStatus("200 OK").writeHeader("Content-Type", dataType);

    this.addCORS(res, req, cors);

    return res.end(data);
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

  readData(res, cb, requestObject) {
    let buffer;

    res.onData((ab, isLast) => {
      if (buffer > this.maxBufferSize)
        return this.handleError(413, res, requestObject, false);

      if (isLast) {
        if (buffer) {
          cb(this.concatArrayBuffers(buffer, ab));
        } else {
          cb(ab);
        }
      } else {
        if (buffer) {
          buffer = this.concatArrayBuffers(buffer, ab);
        } else {
          buffer = ab;
        }
      }
    });
  }

  arrayJoin(array, separator = ", ", toUpper = false) {
    const arrayLength = array.length;
    const lastElement = arrayLength - 1;
    let string = "";
    for (let i = 0; i < arrayLength; i++) {
      const str = toUpper ? array[i].toUpperCase() : array[i];
      string += i === lastElement ? str : str + separator;
    }

    return string;
  }

  getMethodsString(variable) {
    if (typeof variable === "string") return variable.toUpperCase();

    return this.arrayJoin(variable, ", ", true);
  }

  concatArrayBuffers(buffer1, buffer2) {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
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
      411: "411 Length Required",
      413: "413 Payload Too Large",
      500: "500 Internal Server Error",
    };
  }
}

module.exports = HTTPController;
