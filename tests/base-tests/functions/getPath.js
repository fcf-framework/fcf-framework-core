fcf.test("Function fcf.getPath", (a_unitest)=>{
  // {
  //   let result = fcf.getPath("fcf-framework-core:");
  //   console.log(result);
  // }
  // {
  //   let result = fcf.getPath("fcf-framework-core:fcf.js");
  //   console.log(result);
  // }
  // {
  //   let result = fcf.getPath("index.js");
  //   console.log(result);
  // }

  {
    a_unitest.equal(fcf.getPath("module.js", false), "/module.js");
    a_unitest.equal(fcf.getPath("./module.js", false), "/module.js");
    a_unitest.equal(fcf.getPath(":module.js", false), "/module.js");
    a_unitest.equal(fcf.getPath(":./module.js", false), "/module.js");
    a_unitest.equal(fcf.getPath(":/module.js", false), "/module.js");
    a_unitest.equal(fcf.getPath("directory/module.js", false), "/directory/module.js");
    a_unitest.equal(fcf.getPath(":directory/module.js", false), "/directory/module.js");
    a_unitest.equal(fcf.getPath(":/directory/module.js", false), "/directory/module.js");

    a_unitest.equal(fcf.getPath("test_module:module.js", false), "/node_modules/test_module/module.js");
    a_unitest.equal(fcf.getPath("test_module:/module.js", false), "/node_modules/test_module/module.js");
    a_unitest.equal(fcf.getPath("test_module:", false), "/node_modules/test_module");
    a_unitest.equal(fcf.getPath("test_module:directory/", false), "/node_modules/test_module/directory");
    a_unitest.equal(fcf.getPath("test_module", false), "/test_module");
    a_unitest.equal(fcf.getPath("test_module/", false), "/test_module");
    a_unitest.equal(fcf.getPath("test_module:/", false), "/node_modules/test_module");

    a_unitest.equal(fcf.getPath("", false), "/");
    a_unitest.equal(fcf.getPath("/////", false), "/");
    a_unitest.equal(fcf.getPath(":", false), "/");
    a_unitest.equal(fcf.getPath(":/", false), "/");
    a_unitest.equal(fcf.getPath(":test", false), "/test");
    a_unitest.equal(fcf.getPath(":test/", false), "/test");
    a_unitest.equal(fcf.getPath(":/test/", false), "/test");

    a_unitest.equal(fcf.getPath("test_module:test:1/test.js", false), "/node_modules/test_module/test:1/test.js");
    a_unitest.equal(fcf.getPath("/node_modules/test_module/test:1/test.js", false), "/node_modules/test_module/test:1/test.js");
  }
  if (fcf.isServer()) {
    let root    = fcf.normalizePath(require("path").dirname(require.main.filename));
    let fcfRoot = fcf.normalizePath(require("fcf-framework-core/NDetails/resolver.js").resolveModule("fcf-framework-core"));
    a_unitest.equal(fcf.getPath("module.js"), `${root}/module.js`);
    a_unitest.equal(fcf.getPath("./module.js"), `${root}/module.js`);
    a_unitest.equal(fcf.getPath(":module.js"), `${root}/module.js`);
    a_unitest.equal(fcf.getPath(":./module.js"), `${root}/module.js`);
    a_unitest.equal(fcf.getPath(":/module.js"), `${root}/module.js`);
    a_unitest.equal(fcf.getPath("directory/module.js"), `${root}/directory/module.js`);
    a_unitest.equal(fcf.getPath(":directory/module.js"), `${root}/directory/module.js`);
    a_unitest.equal(fcf.getPath(":/directory/module.js"), `${root}/directory/module.js`);
    a_unitest.equal(fcf.getPath(":/directory"), `${root}/directory`);
    a_unitest.equal(fcf.getPath(":/directory/"), `${root}/directory`);
    a_unitest.equal(fcf.getPath(":/"), `${root}`);
    a_unitest.equal(fcf.getPath(":"), `${root}`);

    a_unitest.equal(fcf.getPath("fcf-framework-core:"), `${fcfRoot}`);
    a_unitest.equal(fcf.getPath("fcf-framework-core:/"), `${fcfRoot}`);
    a_unitest.equal(fcf.getPath("fcf-framework-core:test:1.js"), `${fcfRoot}/test:1.js`);
    a_unitest.equal(fcf.getPath("fcf-framework-core:test:1/test.js"), `${fcfRoot}/test:1/test.js`);
    a_unitest.equal(fcf.getPath("fcf-framework-core"), `${root}/fcf-framework-core`);
    a_unitest.equal(fcf.getPath("fcf-framework-core/"), `${root}/fcf-framework-core`);
    a_unitest.equal(fcf.getPath("fcf-framework-core/some"), `${root}/fcf-framework-core/some`);

    a_unitest.equal(fcf.getPath("fcf-framework-core:some"), `${fcfRoot}/some`);
    a_unitest.equal(fcf.getPath("fcf-framework-core:some:test"), `${fcfRoot}/some:test`);
    a_unitest.equal(fcf.getPath(`${fcfRoot}/some:test`), `${fcfRoot}/some:test`);

    a_unitest.equal(fcf.getPath(`..`), `${root}`);
    a_unitest.equal(fcf.getPath(`.././../`), `${root}`);

    a_unitest.equal(fcf.getPath(`fcf-framework-core:some/.././../s`), `${fcfRoot}/s`);
    {
      {
        let error = false;
        try { fcf.getPath("..:.js"); } catch(e) { error = true; }
        a_unitest.equal(error, true);
      }
      {
        let error = false;
        try { fcf.getPath("pack:../js", true); } catch(e) { error = true; }
        a_unitest.equal(error, true);
      }
    }
  }
});
