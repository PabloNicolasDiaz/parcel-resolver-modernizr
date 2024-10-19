"use strict";
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const assert = require("assert");
const esprima = require("esprima");
const estraverse = require("estraverse");

let pathStub = {};
let Modernizr = {};

const resolver = proxyquire("../lib/resolver-modernizr", {
  modernizr: Modernizr,
  path: pathStub,
});

describe("parcel-resolver-modernizr", function () {
  afterEach(function () {
    sinon.restore();
  });

  const plugin = resolver[Symbol.for("parcel-plugin-config")];

  describe("the resolver configure the plugin correctly ", function () {
    it("should open the configuration from modernizr files", async function () {
      let config = { getConfig: function () {} };
      sinon.stub(config, "getConfig").returns({ contents: "someContent" });
      const content = await plugin.loadConfig({ config });
      assert.equal(content, "someContent");
    });
  });

  describe("should resolve the correct resource name", function () {
    const theFilePath = "the/file/path/modernizr.js";
    const config = "someConfigValue";
    const modernizrOutput = "someModernizr();";

    // Function to normalize an AST by removing properties that are not needed for comparison
    function normalizeAST(ast) {
      estraverse.replace(ast, {
        enter(node) {
          // Remove properties that are not needed for comparison, such as location or comments
          delete node.loc;
          delete node.range;
          delete node.comments;
          return node;
        },
      });
      return ast;
    }
    // Function to parse JavaScript code into an AST
    function parseCodeToAST(code) {
      return esprima.parseScript(code, {
        loc: true,
        range: true,
        comment: true,
      });
    }
    // Function to compare two ASTs structurally
    function compareAST(ast1, ast2) {
      return assert.deepEqual(
        JSON.stringify(ast1),
        JSON.stringify(ast2),
        "the code is distinct in what is expected",
      );
    }

    // Function to compare two code fragments
    function compareCodeFragments(fragment1, fragment2) {
      const ast1 = normalizeAST(parseCodeToAST(fragment1));
      const ast2 = normalizeAST(parseCodeToAST(fragment2));
      return compareAST(ast1, ast2);
    }

    const expectedModernizrOutputModule = `;(function(window){
      var hadGlobal = "Modernizr" in window;
      var oldGlobal = window.Modernizr;
      someModernizr();
      module.exports = window.Modernizr;
      if (hadGlobal) {
        window.Modernizr = oldGlobal;
      } else {
        delete window.Modernizr;
      }
    })(window);`;

    beforeEach(function () {
      sinon
        .stub(Modernizr, "build")
        .yieldsAsync(modernizrOutput)
        .calledWith(config);
      sinon.stub(pathStub, "join").returns(theFilePath);
    });

    it("should resolve the modernizr module", async function () {
      const resource = {
        specifier: "modernizr",
        dependency: { specifierType: "esm" },
        config,
      };
      const resolvedResource = await plugin.resolve(resource);
      checkResolvedResource(resolvedResource, expectedModernizrOutputModule);
    });
    it("should resolve the modernizr.js resource", async function () {
      const resource = {
        specifier: "modernizr.js",
        dependency: { specifierType: "commonjs" },
        config,
      };
      const resolvedResource = await plugin.resolve(resource);
      checkResolvedResource(resolvedResource, modernizrOutput);
    });
    it("should resolve other resources to null", async function () {
      const resource = {
        specifier: "someResource.js",
        config,
      };
      const resolvedResource = await plugin.resolve(resource);
      assert.equal(resolvedResource, null);
    });

    function checkResolvedResource(resolvedResource, module) {
      const { code, ...rest } = resolvedResource;
      assert.deepEqual(rest, {
        filePath: theFilePath,
        bundleBehavior: "isolated",
        isSource: false,
        isBundleSplittable: false,
      });
      compareCodeFragments(code, module);
    }
  });

  describe("should show diagnostics", function () {
    const theFilePath = "the/file/path.js";
    const config = "someConfigValue";

    beforeEach(function () {
      sinon.stub(Modernizr, "build").throws();
      sinon.stub(pathStub, "join").returns(theFilePath);
    });

    it("should return diagnostics when modernizr.js resource fails to be builded", async function () {
      const resource = {
        specifier: "modernizr.js",
        config,
      };
      const resolvedResource = await plugin.resolve(resource);
      assert.deepEqual(resolvedResource, {
        diagnostics: [
          {
            message: "Could not build modernizr",
            hints: ["check config file"],
          },
        ],
      });
    });
  });
});
