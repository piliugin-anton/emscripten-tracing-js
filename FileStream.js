const fs = require("fs");
const mime = require("mime");

const onAbortedOrFinishedResponse = (res, readStream, promise) => {
  if (res.id !== -1) {
    readStream.destroy();
  }
  promise();
};

const writeHeaders = (res, headers) => {
  const headersLength = headers.length;
  for (let i = 0; i < headersLength; i++) {
    const { header, value } = headers[i];
    res.writeHeader(header, value);
  }
};

const FileStream = (req, res, file, stat) => {
  return new Promise((resolve, reject) => {
    const ifModifiedSince = req.getHeader("if-modified-since");
    let range = req.getHeader("range");
    const { mtime } = stat;
    let { size } = stat;
    const headers = [];

    if (ifModifiedSince && new Date(ifModifiedSince) >= mtime) {
      resolve("304 Not Modified");
      return;
    }

    mtime.setMilliseconds(0);
    const mtimeutc = mtime.toUTCString();
    headers.push({ header: "Last-Modified", value: mtimeutc });

    const mimeType = mime.getType(file) || "application/octet-stream";
    headers.push({ header: "Content-Type", value: mimeType });

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
      headers.push({ header: "Accept-Ranges", value: "bytes" });
      headers.push({
        header: "Content-Range",
        value: `bytes ${start}-${end}/${size}`,
      });
      headers.push({ header: "206 Partial Content" });
      size = end - start;
    }

    writeHeaders(res, headers);

    const readStream = fs.createReadStream(file, {
      start,
      end,
    });

    res.onAborted(() => {
      onAbortedOrFinishedResponse(res, readStream, () => resolve(null));
    });

    readStream.on("error", (err) => {
      console.log("readStream error", err);
      onAbortedOrFinishedResponse(res, readStream, () => reject(err));
    });

    readStream.on("data", (buffer) => {
      const chunk = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
      const lastOffset = res.getWriteOffset();

      // First try
      const [ok, done] = res.tryEnd(chunk, size);

      if (done) {
        onAbortedOrFinishedResponse(res, readStream, () => resolve(true));
      } else if (!ok) {
        // pause because backpressure
        readStream.pause();

        // Save unsent chunk for later
        res.ab = chunk;
        res.abOffset = lastOffset;

        // Register async handlers for drainage
        res.onWritable((offset) => {
          const [ok, done] = res.tryEnd(
            res.ab.slice(offset - res.abOffset),
            size
          );
          if (done) {
            onAbortedOrFinishedResponse(res, readStream, () => resolve(true));
          } else if (ok) {
            readStream.resume();
          }
          return ok;
        });
      }
    });
  });
};

module.exports = FileStream;
