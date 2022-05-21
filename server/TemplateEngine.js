const path = require("path");
const fs = require("fs");
const Eta = require("eta");

class TemplateEngine {
  constructor(options = {}) {
    const defaults = {
      rootDir: path.join(__dirname, ".."),
      dir: "templates",
      ext: ".eta",
      cache: false,
      tags: ["<%", "%>"],
      removeWhitespace: true,
    };

    this.options = {
      ...defaults,
      ...options,
    };

    this.templatesDir = path.join(this.options.rootDir, this.options.dir);
    this.templatesExtension = this.options.ext;

    Eta.configure({
      cache: this.options.cache,
      tags: this.options.tags,
      rmWhitespace: this.options.removeWhitespace,
      views: this.templatesDir,
    });

    this.templates = this._loadTemplates(
      this.templatesDir,
      this.templatesExtension
    );
  }

  _loadTemplates(dir, extension) {
    return fs
      .readdirSync(dir, {
        encoding: "utf-8",
        withFileTypes: false,
      })
      .reduce((acc, item) => {
        const absolutePath = path.join(dir, item);
        const relativePath = absolutePath.replace(dir, "").substring(1);

        if (fs.statSync(absolutePath).isDirectory()) {
          acc[relativePath] = this._loadTemplates(absolutePath, extension);
          return acc;
        } else if (path.extname(item).toLowerCase() !== extension) {
          return acc;
        }

        acc[relativePath] = fs.readFileSync(absolutePath, {
          encoding: "utf-8",
          flag: "r",
        });
        return acc;
      }, {});
  }

  _getTemplate(template) {
    const templateKey = template.replace(/[\/\\]/g, ".");
    return this.templates[templateKey];
  }

  render(template, variables) {
    try {
        return Eta.render(this._getTemplate(template), variables);
    } catch (ex) {
        console.log(ex);
        return null;
    }
  }
}

module.exports = TemplateEngine;
