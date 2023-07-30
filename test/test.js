"use strict";
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const assert = require("assert");

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
    const theFilePath = "the/file/path.js";
    const config = "someConfigValue";
    const modernizrOutput = "someModernizr";

    beforeEach(function () {
      sinon
        .stub(Modernizr, "build")
        .yieldsAsync(modernizrOutput)
        .calledWith(config);
      sinon.stub(pathStub, "join").returns(theFilePath);
    });

    it("should resolve the modernizr.js resource", async function () {
      const resource = {
        specifier: "modernizr.js",
        config,
      };
      const resolvedResource = await plugin.resolve(resource);
      assert.deepEqual(resolvedResource, {
        code: modernizrOutput,
        filePath: theFilePath,
      });
    });

    it("should resolve other resources to null", async function () {
      const resource = {
        specifier: "someResource.js",
        config,
      };
      const resolvedResource = await plugin.resolve(resource);
      assert.equal(resolvedResource, null);
    });
  });
});
