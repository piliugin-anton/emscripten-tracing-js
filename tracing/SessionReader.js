const path = require("path");
const FileReader = require("./FileReader");
const Sessions = require("./Sessions");

class SessionReader {
  constructor(file) {
    const fileName = path.basename(file, path.extname(file));

    const match = fileName.match(/([0-9]+_[0-9]+)\.([0-9]+)/);
    if (!match || match.length < 3) return;

    this.fileReader = new FileReader(file);

    this.session = new Sessions(match[1]);
    this.session.data_version = Number(match[2]);
  }

  read() {
    let data;
    while ((data = this.fileReader.next)) {
      this.session.update(data);
    }
    this.session.update_cached_data();
  }
}

module.exports = SessionReader