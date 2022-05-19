var fs = require("fs");
const csv = require("fast-csv");
const lockfile = require("proper-lockfile");

class CSVFile {
  static write(filestream, rows, options) {
    return new Promise((res, rej) => {
      csv
        .writeToStream(filestream, rows, options)
        .on("error", (err) => rej(err))
        .on("finish", () => res());
    });
  }

  constructor(opts) {
    this.headers = opts.headers;
    this.path = opts.path;
    this.writeOpts = { headers: this.headers, includeEndRowDelimiter: true };
  }

  create(rows) {
    return new Promise((resolve, reject) => {
      lockfile
        .lock(this.path)
        .then(async (release) => {
          CSVFile.write(fs.createWriteStream(this.path), rows, {
            ...this.writeOpts,
          }).then(() => {
            resolve(release());
          }).catch((err) => reject(err));
        })
        .catch((e) => reject(e));
    });
  }

  append(rows) {
    return new Promise((resolve, reject) => {
      lockfile
        .lock(this.path)
        .then(async (release) => {
          CSVFile.write(
            fs.createWriteStream(this.path, { flags: "a" }),
            rows,
            {
              ...this.writeOpts,
              // dont write the headers when appending
              writeHeaders: false,
            }
          ).then(() => {
            resolve(release());
          }).catch((err) => reject(err));
        })
        .catch((e) => reject(e));
    });
  }

  read() {
    return new Promise((res, rej) => {
      fs.readFile(this.path, (err, contents) => {
        if (err) {
          return rej(err);
        }
        return res(contents);
      });
    });
  }
}

module.exports = CSVFile;