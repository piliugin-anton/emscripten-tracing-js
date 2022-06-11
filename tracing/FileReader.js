const lineByLine = require("n-readlines");

class FileReader {
  constructor(file) {
    this.liner = new lineByLine(file);
    this.eof = false;
  }

  parseLine(string) {
    const entries = string.split(",");
    if (!entries || entries.length < 2) return null;

    return entries;
  }

  close() {
    if (!this.eof) this.liner.close();
  }

  reset() {
    if (!this.eof) this.liner.reset();
  }

  get next() {
    if (this.eof) return null;

    const line = this.liner.next();
    if (line === false) {
      this.eof = true;
      return null;
    }

    return this.parseLine(line.toString("utf8"));
  }
}

module.exports = FileReader;
