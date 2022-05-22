const path = require("path");
const fs = require("fs");
const mime = require("mime");
const { match } = require("path-to-regexp");
const AjvJTD = require("ajv/dist/jtd");
const fastUri = require("fast-uri");
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
    this.maxBufferSize = options.maxBufferSize || 450 * 1024 * 1024; // Default to 16Mb (16777216 bytes)

    const ajvDefaults = {
      coerceTypes: "array",
      useDefaults: true,
      removeAdditional: true,
      uriResolver: fastUri,
      // Explicitly set allErrors to `false`.
      // When set to `true`, a DoS attack is possible.
      allErrors: false,
    };

    this.ajv = new AjvJTD(ajvDefaults);

    this.cors = options.cors;
    this.errorHandler =
      typeof options.errorHandler === "function" ? options.errorHandler : null;
    this.template = options.templateEngine;
    this.routes = [];
    this.routesCount = 0;

    autoBind(this);

    return this;
  }

  hasRoute(pattern, method) {
    const existsPatternIndex = this.routes.findIndex(
      (r, i, a) => a.some((_, i2) => r.pattern === pattern && i !== i2)
    );
    if (existsPatternIndex === -1) return false;

    const eistingNumber = existsPatternIndex + 1;
    const existingRoute = this.routes[existsPatternIndex];
    const methodIsAString = typeof method === "string";
    const existingMethodIsAString = typeof existingRoute.method === "string";

    if (
      methodIsAString &&
      existingMethodIsAString &&
      existingRoute.method === method
    ) {
      return {
        method: existingRoute.method.toUpperCase(),
        number: eistingNumber,
      };
    } else if (methodIsAString && existingMethodIsAString && existingRoute.method !== method) {
      return false;
    }

    const duplicateMethods = [];
    if (!existingMethodIsAString) {
      const existingMethodLength = existingRoute.method.length;
      for (let i = 0; i < existingMethodLength; i++) {
        if (method.indexOf(existingRoute.method[i]) !== -1) {
          duplicateMethods.push(existingRoute.method[i].toUpperCase());
        }
      }
    } else {
      const methodLength = method.length;
      for (let i = 0; i < methodLength; i++) {
        if (existingRoute.method.indexOf(method[i]) !== -1) {
          duplicateMethods.push(method[i].toUpperCase());
        }
      }
    }

    if (!duplicateMethods.length) return false;

    return {
      method: duplicateMethods.join(", "),
      number: eistingNumber,
    };
  }

  addRoute(route = {}) {
    const isTemplatedRoute =
      typeof route.template === "string" && route.template.length;
    const isStaticRoute = route.static;
    const isRedirectRoute =
      typeof route.redirect === "string" && route.redirect.length;
    const isMethodSet = route.hasOwnProperty("method") && route.method.length;
    const isMethodString = typeof route.method === "string";
    const isJSONRoute = route.json;
    const hasPattern =
      typeof route.pattern === "string" && route.pattern.length;
    const hasHandler = typeof route.handler === "function";
    const hasRequestSchema =
      typeof route.requestSchema === "object" && route.requestSchema !== null;
    const hasResponseSchema =
      typeof route.responseSchema === "object" && route.responseSchema !== null;
    const isCORS =
      route.hasOwnProperty("cors") &&
      typeof route.cors === "string" &&
      route.cors.length;

    const errors = [];

    if (!hasPattern) {
      errors.push("Route must have a pattern.");
    }

    if (
      !isStaticRoute &&
      !isRedirectRoute &&
      !isJSONRoute &&
      !isTemplatedRoute
    ) {
      errors.push(
        "Non-static routes must have a template or should be configured like JSON API."
      );
    }

    if (!isStaticRoute && !isMethodSet) {
      errors.push("Route methods can be a type of string or array.");
    }

    if (!isStaticRoute) {
      const methods = HTTPController.AVAILABLE_METHODS.map((method) =>
        method.toLowerCase()
      );

      if (isMethodString) {
        if (methods.indexOf(route.method) === -1) {
          errors.push(`Method ${route.method} not found.`);
        }
      } else {
        const methodsLength = route.method.length;
        for (let i = 0; i < methodsLength; i++) {
          if (methods.indexOf(route.method[i]) === -1) {
            errors.push(`Method ${route.method[i]} not found.`);
          }
        }
      }
    }

    if (isStaticRoute) {
      route.method = [
        HTTPController.METHODS.GET,
        HTTPController.METHODS.HEAD,
        HTTPController.METHODS.OPTIONS,
      ];
    }

    const routeExists = this.hasRoute(route.pattern, route.method);

    if (routeExists) {
      errors.push(
        `Route with pattern ${route.pattern} and method ${routeExists.method} already exists! Look at route #${routeExists.number} at index ${routeExists.number - 1}`
      );
    }

    if (!isStaticRoute && !isRedirectRoute && !hasHandler) {
      errors.push("Non-static routes must have a handler.");
    }

    if (isJSONRoute && (!hasRequestSchema || !hasResponseSchema)) {
      errors.push(
        "Routes with 'json' option set to 'true' must have an options 'requestSchema' and 'responseSchema' in Ajv JSON type definition (JTD) format, read more on https://ajv.js.org/json-type-definition.html"
      );
    }

    if (errors.length) throw new Error(errors.join("\n"));

    if (isJSONRoute) {
      route.parseJSONRequest = this.ajv.compileParser(route.requestSchema);
      route.serializeJSONResponse = this.ajv.compileSerializer(
        route.responseSchema
      );
    }

    route.match = match(route.pattern, {
      decode: decodeURIComponent,
    });

    if (isStaticRoute && !route.dir) {
      route.dir = this.rootDir;
    }

    this.routes.push(route);
    this.routesCount++;

    if (isRedirectRoute) {
      const newRedirectRoute = {
        pattern: route.redirect,
        method: route.method,
        static: isStaticRoute,
      };

      if (isStaticRoute) {
        newRedirectRoute.dir = route.dir;
      }

      if (isCORS) {
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

    // CORS
    const cors = (req.__ROUTE && req.__ROUTE.cors) || this.cors;

    // Route not found
    if (!req.__ROUTE) return this.handleError(404, res, requestObject, cors);

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
      return this.handleError(413, res, requestObject, cors, false);

    const contentType = req.getHeader("content-type");
    const isJSONrequest = contentType.indexOf("json");

    return this.readData(res, (data) => {
      if (req.__ROUTE.json && isJSONrequest) {
        data = req.__ROUTE.parseJSONRequest(data.toString());
        if (data === undefined)
          return this.handleError(400, res, requestObject, cors, false);
      }
      // Get dataType for uploaded file if !json && ===multipart/form-data
      const handlerData = req.__ROUTE.handler({
        ...requestObject,
        body: data,
      });

      return this.handleResponse(
        res,
        req,
        req.__ROUTE.json
          ? req.__ROUTE.serializeJSONResponse(handlerData)
          : handlerData,
        req.__ROUTE.json ? "application/json" : "text/html",
        cors
      );
    });
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
    res.writeStatus("200 OK");

    this.addCORS(res, req, cors);

    if (!data) return res.writeHeader("Connection", "close").end();

    return res.writeHeader("Content-Type", dataType).end(data);
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

  readData(res, cb) {
    let buffer;

    res.onData((ab, isLast) => {
      const chunk = Buffer.from(ab);
      if (isLast) {
        if (buffer) {
          cb(Buffer.concat([buffer, chunk]));
        } else {
          cb(chunk);
        }
      } else {
        if (buffer) {
          buffer = Buffer.concat([buffer, chunk]);
        } else {
          buffer = Buffer.concat([chunk]);
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
      400: "400 Bad Request",
      403: "403 Forbidden",
      404: "404 Not Found",
      411: "411 Length Required",
      413: "413 Payload Too Large",
      500: "500 Internal Server Error",
    };
  }
}

module.exports = HTTPController;
