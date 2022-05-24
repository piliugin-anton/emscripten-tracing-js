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
    const existsPatternIndex = this.routes.findIndex((r, i, a) =>
      a.some((_, i2) => r.pattern === pattern && i !== i2)
    );
    if (existsPatternIndex === -1) return false;

    const existingNumber = existsPatternIndex + 1;
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
        number: existingNumber,
      };
    } else if (
      methodIsAString &&
      existingMethodIsAString &&
      existingRoute.method !== method
    ) {
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
      number: existingNumber,
    };
  }

  addRoute(route = {}) {
    const isTemplatedRoute =
      typeof route.template === "string" && route.template.length !== 0;
    const isStaticRoute = route.static;
    const isRedirectRoute =
      typeof route.redirect === "string" && route.redirect.length !== 0;
    const isMethodSet =
      (typeof route.method === "string" || Array.isArray(route.method)) &&
      route.method.length !== 0;
    const isMethodString = typeof route.method === "string";
    const hasRequestSchema =
      typeof route.requestSchema === "object" && route.requestSchema !== null;
    const hasResponseSchema =
      typeof route.responseSchema === "object" && route.responseSchema !== null;
    const isJSONRoute = hasRequestSchema || hasResponseSchema;
    const hasPattern =
      typeof route.pattern === "string" && route.pattern.length !== 0;
    const hasHandler = typeof route.handler === "function";
    const hasCORS = typeof route.cors === "string" && route.cors.length !== 0;
    const globalCORS = typeof this.cors === "string" && this.cors.length !== 0;

    const errors = [];

    if (!hasPattern) {
      errors.push("Route must have a pattern.");
    }

    console.log("isRedirect", isRedirectRoute)

    if (
      !isStaticRoute &&
      !isRedirectRoute &&
      !isJSONRoute &&
      !isTemplatedRoute
    ) {
      errors.push(
        "Non-static and non-redirect routes must have a template or should have a 'requestSchema' and/or 'responseSchema'."
      );
    }

    if (!isStaticRoute && !isMethodSet) {
      errors.push("Route methods can be a type of string or array.");
    }

    if (!isStaticRoute) {
      const methods = HTTPController.AVAILABLE_METHODS.map((method) =>
        method.toLowerCase()
      );

      const addHead =
        route.method.indexOf(HTTPController.METHODS.HEAD) === -1 &&
        route.method.indexOf(HTTPController.METHODS.GET) !== -1;
      const addOptions =
        route.method.indexOf(HTTPController.METHODS.OPTIONS) === -1;

      if (isMethodString) {
        if (methods.indexOf(route.method) === -1) {
          errors.push(`Method ${route.method} not found.`);
        }

        if (addHead) {
          route.method = [route.method, HTTPController.METHODS.HEAD];
        }

        if (addOptions) {
          if (addHead) {
            route.method.push(HTTPController.METHODS.OPTIONS);
          } else {
            route.method = [route.method, HTTPController.METHODS.OPTIONS];
          }
        }
      } else {
        const methodsLength = route.method.length;
        for (let i = 0; i < methodsLength; i++) {
          if (methods.indexOf(route.method[i]) === -1) {
            errors.push(`Method ${route.method[i]} not found.`);
          }
        }

        if (addHead) {
          route.method.push(HTTPController.METHODS.HEAD);
        }

        if (addOptions) {
          route.method.push(HTTPController.METHODS.OPTIONS);
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
        `Route with pattern ${route.pattern} and method ${
          routeExists.method
        } already exists! Look at route #${routeExists.number} at index ${
          routeExists.number - 1
        }.`
      );
    }

    if (!isStaticRoute && !isRedirectRoute && !hasHandler) {
      errors.push("Non-static routes must have a handler.");
    }

    if (errors.length) throw new Error(errors.join("\n"));

    if (hasRequestSchema) {
      route.parseJSON = this.ajv.compileParser(route.requestSchema);
    }

    if (hasResponseSchema) {
      route.stringifyJSON = this.ajv.compileSerializer(route.responseSchema);
    }

    if (!hasCORS && globalCORS) {
      route.cors = this.cors;
    }

    if (!isStaticRoute && !isRedirectRoute) {
      route.contentType = isTemplatedRoute
      ? HTTPController.CONTENT_TYPES.HTML
      : HTTPController.CONTENT_TYPES.JSON;
    } 

    route.match = match(route.pattern, {
      decode: decodeURIComponent,
    });

    if (isStaticRoute && !route.dir) {
      route.dir = this.rootDir;
    }

    this.routes.push(route);
    this.routesCount++;

    /*if (isRedirectRoute) {
      const newRedirectRoute = {
        pattern: route.redirect,
        method: route.method,
        static: isStaticRoute,
      };

      if (isStaticRoute) {
        newRedirectRoute.dir = route.dir;
      }

      if (hasCORS) {
        newRedirectRoute.cors = route.cors;
      } else if (globalCORS) {
        newRedirectRoute.cors = this.cors;
      }

      this.addRoute(newRedirectRoute);
    }*/

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
    console.log(this.routes);
    App.any("/*", this.handleRequest);
  }

  getController(self, res, req) {
    const object = {
      op: {
        aborted: false,
        readStream: {
          stream: null,
          promise: null,
        },
      },
      onAborted() {
        this.op.aborted = true;

        if (this.op.readStream.stream) this.op.readStream.stream.destroy();

        if (this.op.readStream.promise) this.op.readStream.promise.resolve();
      },
      status(code) {
        if (this.op.aborted) return;

        res.writeStatus(HTTPController.STATUSES[code]);

        return this;
      },
      setHeader(header, value) {
        if (this.op.aborted) return;

        res.writeHeader(header, value);

        return this;
      },
      setHeaders(headers) {
        if (this.op.aborted) return;

        const headersLength = headers.length;
        for (let i = 0; i < headersLength; i++) {
          this.setHeader(...headers[i]);
        }

        return this;
      },
      getHeader(header) {
        return req.getHeader(header);
      },
      end(data) {
        if (this.op.aborted) return;

        if (req.__ROUTE && typeof req.__ROUTE.cors === "string") {
          this.setHeader("Access-Control-Allow-Origin", req.__ROUTE.cors);
          this.setHeader("Access-Control-Allow-Methods", req.__ALLOWED_METHODS);
        }

        if (data !== undefined) res.end(data);
        else res.endWithoutBody();
      },
      head(mimeType, size) {
        if (this.op.aborted) return;

        this.status(200);

        this.setHeader("Content-Type", mimeType);
        this.setHeader("Content-Length", size);

        this.end();
      },
      options(server) {
        if (this.op.aborted) return;

        this.status(200);

        this.setHeader(
          "Allow",
          server
            ? this.getMethodsString(HTTPController.AVAILABLE_METHODS)
            : req.__ALLOWED_METHODS
        );
        this.setHeader("Content-Length", "0");

        this.end();
      },
      redirect() {
        if (this.op.aborted) return;

        this.status(301);

        this.setHeader("Location", req.__ROUTE.redirect);
        this.setHeader("Content-Length", "0");

        this.end();
      },
      renderHTML(template, data) {
        if (this.op.aborted) return;

        return self.template.render(template, data);
      },
      error(code) {
        if (this.op.aborted) return;

        // Remove static routes?
        if (self.errorHandler) {
          self.errorHandler(
            req.__REQUEST_OBJECT,
            code,
            ({ template, data }) => {
              let responseData = null;

              if (template) {
                responseData = this.renderHTML(template, data);
              }

              if (!responseData) responseData = HTTPController.STATUSES[code];

              this.status(code);

              this.setHeader("Content-Type", HTTPController.CONTENT_TYPES.HTML);

              this.end(responseData);
            }
          );
        } else {
          this.status(code);

          this.setHeader(
            "Content-Type",
            HTTPController.CONTENT_TYPES.PLAIN_TEXT
          );

          this.end(responseData);
        }
      },
      reply(data) {
        if (this.op.aborted) return;

        if (typeof req.__ROUTE.template === "string") {
          const HTML = this.renderHTML(req.__ROUTE.template, data);
          if (!HTML) return this.error(500);

          data = HTML;
        } else {
          if (typeof req.__ROUTE.stringifyJSON === "function") {
            data = req.__ROUTE.stringifyJSON(data);
          } else {
            try {
              data = JSON.stringify(data);
            } catch (ex) {
              return this.error(500);
            }
          }
        }

        if (req.__METHOD === HTTPController.METHODS.HEAD)
          return this.head(
            this.responseContentType,
            Buffer.byteLength(data).toString()
          );

        this.status(200);

        this.setHeader("Content-Type", this.responseContentType);

        this.end(data);
      },
      streamFile(file, stat, mimeType) {
        if (this.op.aborted) return;

        this.op.readStream.promise = new Promise((resolve) => {
          const ifModifiedSince = this.getHeader("if-modified-since");
          const { mtime } = stat;

          if (ifModifiedSince && new Date(ifModifiedSince) >= mtime)
            resolve(304);

          const headers = [];

          headers.push(["Content-Type", mimeType]);

          mtime.setMilliseconds(0);
          const mtimeutc = mtime.toUTCString();
          headers.push(["Last-Modified", mtimeutc]);

          const range = this.getHeader("range");
          let { size } = stat;
          let start = 0;
          let end = size;
          if (range) {
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
            this.status(206);
            size = end - start;
          }

          this.setHeaders(headers);

          this.op.readStream.stream = fs.createReadStream(file, {
            start,
            end,
          });

          this.op.readStream.stream.on("error", () => this.onAbortedOrFinishedStream(false));

          this.op.readStream.stream.on("data", (buffer) => {
            /* We only take standard V8 units of data */
            const chunk = this.toArrayBuffer(buffer);

            /* Store where we are, globally, in our response */
            const lastOffset = res.getWriteOffset();

            /* Streaming a chunk returns whether that chunk was sent, and if that chunk was last */
            const [ok, done] = res.tryEnd(chunk, size);

            /* Did we successfully send last chunk? */
            if (done) {
              this.onAbortedOrFinishedStream(true);
            } else if (!ok) {
              /* If we could not send this chunk (backpressure), pause */
              this.op.readStream.stream.pause();

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
                  this.onAbortedOrFinishedStream(true);
                } else if (ok) {
                  this.op.readStream.stream.resume();
                }

                /* We always have to return true/false in onWritable.
                 * If you did not send anything, return true for success. */
                return ok;
              });
            }
          });
        });

        return this.op.readStream.promise;
      },
      /* Helper function converting Node.js buffer to ArrayBuffer */
      toArrayBuffer(buffer) {
        return buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        );
      },
      onAbortedOrFinishedStream(trueOrFalse) {
        if (res.__ID !== -1) {
          if (this.op.readStream.stream) this.op.readStream.stream.destroy();

          if (this.op.readStream.promise) {
            if (trueOrFalse === true) {
              this.op.readStream.promise.resolve();
            } else {
              this.op.readStream.promise.reject();
            }
          }
        }
        res.__ID = -1;
      },
      get() {
        if (this.op.aborted) return;

        req.__ROUTE.handler(req.__REQUEST_OBJECT, {});
      },
      post() {
        if (this.op.aborted) return;

        const expectedContentLength = Number(req.getHeader("content-length"));

        if (!expectedContentLength) return this.error(411);

        if (expectedContentLength > this.maxBufferSize) return this.error(413);

        const contentType = this.getHeader("content-type");

        if (
          contentType !== HTTPController.CONTENT_TYPES.JSON &&
          contentType !== HTTPController.CONTENT_TYPES.URLENCODED &&
          contentType !== HTTPController.CONTENT_TYPES.FORM_DATA &&
          contentType !== HTTPController.CONTENT_TYPES.OCTET_STREAM &&
          contentType !== HTTPController.CONTENT_TYPES.PLAIN_TEXT
        )
          return this.error(400);

        return this.readData(res, (data) => {
          // Improve condition, think about templated routes
          if (contentType === HTTPController.CONTENT_TYPES.JSON) {
            // JSON will be parsed by AJV
            if (typeof req.__ROUTE.parseJSON === "function") {
              data = req.__ROUTE.parseJSON(data.toString());
              if (data === undefined) return this.error(400);
            }
            // Parse with JSON.parse
            else {
              try {
                data = JSON.parse(data);
              } catch (ex) {
                return this.error(400);
              }
            }
          } else if (contentType === HTTPController.CONTENT_TYPES.URLENCODED) {
            //
          }

          return req.__ROUTE.handler(
            { ...requestObject, body: data },
            this.getResponseObject(
              res,
              req,
              requestObject,
              responseContentType,
              cors
            )
          );
        });
      },
      handleDynamicRequest() {
        res.__RESPONSE_OBJECT = {
          status: this.status,
          setHeader: this.setHeader,
          setHeaders: this.setHeaders,
          getHeader: this.getHeader,
          reply: this.reply,
        };

        return req.__ROUTE.handler(req.__REQUEST_OBJECT, req.__RESPONSE_OBJECT);
      },
      setRequestData() {
        req.__QUERY = req.getQuery();

        req.__REQUEST_OBJECT = {
          url: req.__URL,
          method: req.__METHOD,
          get params() {
            return req.__PARAMS || {};
          },
          get query() {
            return req.__QUERY
              ? new URLSearchParams(req.__QUERY)
              : new URLSearchParams();
          },
        };

        req.__ALLOWED_METHODS = this.getMethodsString(req.__ROUTE.method);
      },
      readData(cb) {
        if (this.op.aborted) return;

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
      },
      arrayJoin(array, separator = ", ", toUpper = false) {
        const arrayLength = array.length;
        const lastElement = arrayLength - 1;
        let string = "";
        for (let i = 0; i < arrayLength; i++) {
          const str = toUpper ? array[i].toUpperCase() : array[i];
          string += i === lastElement ? str : str + separator;
        }

        return string;
      },
      getMethodsString(variable) {
        if (typeof variable === "string") return variable.toUpperCase();

        return this.arrayJoin(variable, ", ", true);
      },
    };

    return Object.freeze(object);
  }

  handleRequest(res, req) {
    const controller = this.getController(this, res, req);
    res.onAborted(() => controller.onAborted());

    // Request method
    req.__METHOD = req.getMethod();

    // Request URL
    req.__URL = req.getUrl();

    if (req.__METHOD === HTTPController.METHODS.OPTIONS && req.__URL === "*")
      return controller.options(true);

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

    // Set request data
    controller.setRequestData();

    // Route not found
    if (!req.__ROUTE) return controller.error(404);

    // Handle redirect (301)
    if (req.__ROUTE.redirect) return controller.redirect();

    // OPTIONS request
    if (req.__METHOD === HTTPController.METHODS.OPTIONS)
      return controller.options();

    // Static route
    if (req.__ROUTE.static) {
      const filePath = req.__URL.split("/").join(path.sep);
      const absoluteFilePath = path.join(req.__ROUTE.dir, filePath);

      // File not found
      if (!fs.existsSync(absoluteFilePath)) return controller.error(404);

      const stat = fs.statSync(absoluteFilePath, {
        bigint: false,
      });

      // Damn! It's not a file (it's a directory)
      if (!stat.isFile()) return controller.error(404);

      const mimeType =
        mime.getType(absoluteFilePath) || "application/octet-stream";

      // Head request
      if (req.__METHOD === HTTPController.METHODS.HEAD)
        return controller.head(mimeType, stat.size.toString());

      // Stream a file
      return controller
        .streamFile(absoluteFilePath, stat, mimeType)
        .then(
          (status) =>
            typeof status === "number" && controller.status(status).end()
        )
        .catch(() => controller.end());
    }

    // Non-static route
    return controller.handleDynamicRequest();
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

  static get CONTENT_TYPES() {
    return {
      JSON: "application/json",
      HTML: "text/html",
      URLENCODED: "application/x-www-form-urlencoded",
      FORM_DATA: "multipart/form-data",
      OCTET_STREAM: "application/octet-stream",
      PLAIN_TEXT: "text/plain",
    };
  }
}

module.exports = HTTPController;
