const Modernizr = require("modernizr");
const path = require("path");
const { Resolver } = require("@parcel/plugin");
const validSpecifiers = ["modernizr", "modernizr.js"];

// thanks peerigno for this snippet !!!
// extracted from https://github.com/peerigon/modernizr-loader/blob/master/index.js
function wrapOutput(output) {
  return `;(function(window){
        var hadGlobal = "Modernizr" in window;
        var oldGlobal = window.Modernizr;
        ${output}
        module.exports = window.Modernizr;
        if (hadGlobal) { window.Modernizr = oldGlobal; }
        else { delete window.Modernizr; }
      })(window);`;
}

module.exports = new Resolver({
  async loadConfig({ config }) {
    const configFileNames = ["modernizr-config.json", ".modernizrrc"];
    const { contents } = await config.getConfig(configFileNames);
    return contents;
  },

  async resolve({ specifier, dependency, config }) {
    if (!validSpecifiers.includes(specifier)) return null;
    const filePath = path.join(__dirname, "modernizr.js");
    try {
      const promise = new Promise((resolve, _) => {
        Modernizr.build(config, resolve);
      });
      const code = await promise;
      const processedCode =
        dependency.specifierType === "commonjs" ? code : wrapOutput(code);
      return {
        code: processedCode,
        filePath,
        bundleBehavior: "isolated",
        isSource: false,
        isBundleSplittable: false,
      };
    } catch (err) {
      return {
        diagnostics: [
          {
            message: "Could not build modernizr",
            hints: ["check config file"],
          },
        ],
      };
    }
  },
});
