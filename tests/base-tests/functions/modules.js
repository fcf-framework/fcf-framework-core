fcf.test("Functions fcf.module & fcf.require", async (a_unitest)=>{

  fcf.getConfiguration().append({
    moduleDirectories: [":base-tests/functions/modules/node_modules"],
    merge: {
      "sources": { function: "fcf.NDetails.mergeSourcesConfig", file: "fcf-framework-unitest:unitest.js" },
    },
    sources: {
      "modules_test1": {
        webPackagePath:  "/base-tests/functions/modules/node_modules/modules_test1",
      },
      "modules_test2": {
        webPackagePath:  "/base-tests/functions/modules/node_modules/modules_test2",
        webMain:         "main.js"
      },
      "": {
        files: {
          "base-tests/functions/modules/simple2.js":             { result: "SimpleTest2.value" },
          "base-tests/functions/modules/module1_sub1_simple.js": { result: "Module1Sub1.value" },
        },
        webFiles: {
          "base-tests/functions/modules/simple1.js":             { result: "SimpleTest1.value" },
          "base-tests/functions/modules/module1_sub2_export.js": { result: "Module1Sub2.value" },
          "base-tests/functions/modules/static_module.js":       { result: "staticModuleValue", loadState: "@{{typeof(staticModuleValue) !== \"undefined\"}}@" },
        }
      }
    }
  });

  // static module
  if (!fcf.isServer()) {
    let [res1] = await fcf.require(":base-tests/functions/modules/static_module.js");
    a_unitest.equal(res1, 1);
  }

  {
    let [res1] = await fcf.require("fcf-framework-core");
    a_unitest.equal(typeof res1.tokenize, "function");
  }

  {
    let [res1] = await fcf.require("fcf-framework-core:fcf.js");
    a_unitest.equal(typeof res1.tokenize, "function");
  }

  // loading simple js
  {
    let [res1] = await fcf.require(":base-tests/functions/modules/simple1.js");
    a_unitest.equal(res1, 1);
    let [res2] = await fcf.require("base-tests/functions/modules/simple2.js");
    a_unitest.equal(res2, 1);
  }

  // loading with dependencies
  {
    let [res1] = await fcf.require(":base-tests/functions/modules/module1.js");
    a_unitest.equal(res1, [1, 2, 3]);
  }

  // loading sync modules
  {
    let [res1] = fcf.require("modules_test1:syncmodule1.js", {async: false}).result();
    a_unitest.equal(res1, ["modules_test1", "modules_test2"]);
  }

  // check error
  {
    let error;
    try {
      let [res1] = await fcf.require(":base-tests/functions/modules/error123.js", {quiet: true});
    } catch (e){
      error = e;
    }
      if (!error) {
        a_unitest.error("When loading the wrong module in lazy mode, the fcf.module function did not throw an exception");
      }
  }
  {
    let error;
    try {
      let [res1] = await fcf.require("asdadafghfgh", {quiet: true});
    } catch (e){
      error = e;
    }
      if (!error) {
        a_unitest.error("When loading the wrong module in lazy mode, the fcf.module function did not throw an exception");
      }
  }
  {
    let error;
    try {
      let [res1] = await fcf.require("asdadafghfg:", {quiet: true});
    } catch (e){
      error = e;
    }
      if (!error) {
        a_unitest.error("When loading the wrong module in lazy mode, the fcf.module function did not throw an exception");
      }
  }

  // lazy loading testing
  {
    let [res1] = await fcf.require(":base-tests/functions/modules/loop_dep_mod1-1.js");
    a_unitest.equal(res1(), {loop_dep_mod1: 1, loop_dep_mod2: 1});
    [res1] = await fcf.require(":base-tests/functions/modules/loop_dep_mod1-1.js");
    a_unitest.equal(res1(), {loop_dep_mod1: 1, loop_dep_mod2: 1});

    let [res2] = await fcf.require(":base-tests/functions/modules/loop_dep_mod1-2.js");
    a_unitest.equal(res2(), {loop_dep_mod1: 1, loop_dep_mod2: 1});
    [res2] = await fcf.require(":base-tests/functions/modules/loop_dep_mod1-2.js");
    a_unitest.equal(res2(), {loop_dep_mod1: 1, loop_dep_mod2: 1});


    let [res3] = await fcf.require(":base-tests/functions/modules/loop_mod2.js");
    a_unitest.equal(res3(), {loop_dep_mod1: 1, loop_dep_mod2: 1});
    [res3] = await fcf.require([":base-tests/functions/modules/loop_mod2.js"]);
    a_unitest.equal(res3(), {loop_dep_mod1: 1, loop_dep_mod2: 1});
  }

  // check lazy errors
  {
    let error;
    try {
      let [res1] = await fcf.require(":base-tests/functions/modules/loop_mod_err1.js", {quiet: true});
    } catch (e){
      error = e;
    }
      if (!error) {
        a_unitest.error("When loading the wrong module in lazy mode, the fcf.module function did not throw an exception");
      }
  }
  {
    let error;
    try {
      let [res1] = await fcf.require(":base-tests/functions/modules/loop_mod_err1.js", {quiet: true});
    } catch (e){
      error = e;
    }
      if (!error) {
        a_unitest.error("When loading the wrong module in lazy mode, the fcf.module function did not throw an exception");
      }
  }

  // test nodejs module
  {
    let [res1] = await fcf.require("modules_test1");
    a_unitest.equal(res1, "modules_test1");
  }
  {
    let [res1] = await fcf.require("modules_test1:");
    a_unitest.equal(res1, "modules_test1");
  }
  {
    let [res1] = await fcf.require("modules_test1:index.js");
    a_unitest.equal(res1, "modules_test1");
  }
  {
    let [res1] = await fcf.require("modules_test1:/index.js");
    a_unitest.equal(res1, "modules_test1");
  }

  {
    let [res1] = await fcf.require("modules_test2");
    a_unitest.equal(res1, "modules_test2");
  }
  {
    let [res1] = await fcf.require("modules_test2:");
    a_unitest.equal(res1, "modules_test2");
  }
  {
    let [res1] = await fcf.require("modules_test2:main.js");
    a_unitest.equal(res1, "modules_test2");
  }
  {
    let [res1] = await fcf.require("modules_test2:/main.js");
    a_unitest.equal(res1, "modules_test2");
  }



});
