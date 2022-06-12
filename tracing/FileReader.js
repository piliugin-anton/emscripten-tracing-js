const lineByLine = require("n-readlines");

class FileReader {
  constructor(file) {
    try {
      this.liner = new lineByLine(file);
      this.opened = true;
    } catch(ex) {}
    this.eof = false;
  }

  parseLine(string) {
    const entries = JSON.parse(string);
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
    if (!this.liner || this.eof) return null;

    const line = this.liner.next();
    if (line === false) {
      this.eof = true;
      return null;
    }

    return this.parseLine(line.toString("utf8"));
  }
}

module.exports = FileReader;
