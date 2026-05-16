fcf.test("Function fcf.getPathInfo", (a_unitest) => {

  // if (fcf.isServer()){
  //   {
  //     let path = fcf.getPath("express:") + "/index.js";
  //     let result = fcf.getPathInfo(path);
  //     console.log("Path:  ", path);
  //     console.log("Result:", result);
  //   }
  //   console.log("");
  //   {
  //     let path = "fcf-framework-core:fcf.js";
  //     let result = fcf.getPathInfo(path);
  //     console.log("Path:  ", path);
  //     console.log("Result:", result);
  //   }
  //   console.log("");
  //   {
  //     let path = "./index.js";
  //     let result = fcf.getPathInfo(path);
  //     console.log("Path:  ", path);
  //     console.log("Result:", result);
  //   }
  //   console.log("");
  //   {
  //     let path = "/INCORRECT_PATH/index.js";
  //     let result = fcf.getPathInfo(path, true, true);
  //     console.log("Path:  ", path);
  //     console.log("Result:", result);
  //   }
  // }


  fcf.getConfiguration().append({
    sources: {
      "modules_test1": {
        webPackagePath:  "/tests/base-tests/functions/modules/node_modules/modules_test1",
      },
      "modules_test2": {
        webPackagePath:  "/tests/base-tests/functions/modules/node_modules/modules_test2",
      },
    }
  });

  a_unitest.equal(fcf.getPathInfo("").module, "");
  a_unitest.equal(fcf.getPathInfo("test").module, "");
  a_unitest.equal(fcf.getPathInfo("test"), {module: "", subpath: "test"});

  a_unitest.equal(fcf.getPathInfo("/asd", fcf.isServer(), true).module, fcf.isServer() ? undefined : "");
  if (!fcf.isServer()){
    let path = "/tests/base-tests/functions/modules/node_modules/modules_test1/test_dir/./test_file";
    a_unitest.equal(fcf.getPathInfo(path), {module: "modules_test1", subpath: "test_dir/test_file"});
  }
  {
    let path = fcf.getPath("fcf-framework-core:");
    a_unitest.equal(fcf.getPathInfo(`${path}/asd`), {module: "fcf-framework-core", subpath: "asd"});
    a_unitest.equal(fcf.getPathInfo(`${path}/asd/`), {module: "fcf-framework-core", subpath: "asd"});
    a_unitest.equal(fcf.getPathInfo(`${path}/./asd/`), {module: "fcf-framework-core", subpath: "asd"});
    a_unitest.equal(fcf.getPathInfo(`${path}/./asd?test=1`), {module: "fcf-framework-core", subpath: "asd?test=1"});
  }
  if (fcf.isServer()){
    let path = fcf.getPath("mime:");
    a_unitest.equal(fcf.getPathInfo(`${path}/asd`), {module: "mime", subpath: "asd"});
    a_unitest.equal(fcf.getPathInfo(`${path}/asd/`), {module: "mime", subpath: "asd"});
    a_unitest.equal(fcf.getPathInfo(`${path}/./asd/`), {module: "mime", subpath: "asd"});
    a_unitest.equal(fcf.getPathInfo(`${path}/./asd?test=1`), {module: "mime", subpath: "asd?test=1"});

    a_unitest.equal(fcf.getPathInfo(`${process.cwd()}/test/../test/`), {module: "", subpath: "test"});
    //a_unitest.equal(fcf.getPathInfo(`${process.cwd()}/../../test/`, fcf.isServer(), true), {});
    a_unitest.equal(fcf.getPathInfo(`${process.cwd()}/../../../test/`, fcf.isServer(), true), {});
  }
  a_unitest.equal(fcf.getPathInfo(`base-tests/functions/modules/simple2.js`), {module: "", subpath: "base-tests/functions/modules/simple2.js"});
  if (!fcf.isServer()) {
    let ri = new fcf.RouteInfo(window.location.href);
    let prefix = `${ri.protocol}://${ri.server}${ri.port ? ":" + ri.port : "" }`;
    a_unitest.equal(fcf.getPathInfo(`${prefix}/../../test/`), {module: "", subpath: "test"});
    a_unitest.equal(fcf.getPathInfo(`${prefix}/test`), {module: "", subpath: "test"});
    a_unitest.equal(fcf.getPathInfo(`${prefix}/tests/base-tests/functions/modules/node_modules/modules_test1/test_dir/./test_file`), {module: "modules_test1", subpath: "test_dir/test_file"});
    a_unitest.equal(fcf.getPathInfo(`http://google.com/test`), {});
  }
});
