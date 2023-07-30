const Modernizr = require("modernizr");
const path = require("path");
const { Resolver } = require("@parcel/plugin");

module.exports = new Resolver({
  async loadConfig({ config }) {
    const configFileNames = ["modernizr-config.json", ".modernizrrc"];
    const { contents } = await config.getConfig(configFileNames);
    return contents;
  },

  async resolve({ specifier, config }) {
    if (specifier === "modernizr.js") {
      const promise = new Promise((resolve, _) => {
        Modernizr.build(config, resolve);
      });
      const code = await promise;
      return {
        filePath: path.join(__dirname, "modernizr.js"),
        code,
      };
    }

    return null;
  },
});
