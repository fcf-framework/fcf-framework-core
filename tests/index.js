#!/usr/bin/env node
const libPath = require('path');
const libModule = require("module");
let splitter    = process.platform == "win32" ? ";" : ":";
let paths       = !process.env.NODE_PATH ? [] : process.env.NODE_PATH.split(splitter);
paths.unshift(libPath.join(__dirname, '../..'));
process.env.NODE_PATH = paths.join(splitter);
libModule.Module._initPaths();

let fcf = require("fcf-framework-core");
let unitest = require("fcf-framework-unitest");

let tests = undefined;
let groups = false;
let enableLocalTests = true;
let enableWebTests = true;

for(let i = 0; i < process.argv.length; ++i) {
  if (process.argv[i] == "--test" && process.argv[i+1]){
    tests = process.argv[i+1].split(";");
  } else if (process.argv[i] == "--groups" && process.argv[i+1]){
    groups = process.argv[i+1].split(";");
  } else if (process.argv[i] == "--server-only"){
    enableLocalTests = true;
    enableWebTests = false;
  } else if (process.argv[i] == "--web-only"){
    enableLocalTests = false;
    enableWebTests = true;
  }
}

fcf.getConfiguration().append({
  logFile:  "log/log-",
});

unitest.run({
  tests:                tests,
  groups:               groups,
  timeout:              24*60*60*1000,
  enableLocalTests:     enableLocalTests,
  enableWebTests:       enableWebTests,
  include:              [
                          ":base-tests/functions/build.js",
                          ":base-tests/functions/build.array.js",
                          ":base-tests/functions/build.boolean.js",
                          ":base-tests/functions/build.date.js",
                          ":base-tests/functions/build.enum.js",
                          ":base-tests/functions/build.iterable.js",
                          ":base-tests/functions/build.object.js",
                          ":base-tests/functions/build.nan.js",
                          ":base-tests/functions/build.null.js",
                          ":base-tests/functions/build.number.js",
                          ":base-tests/functions/build.numbered.js",
                          ":base-tests/functions/build.set.js",
                          ":base-tests/functions/build.string.js",
                          ":base-tests/functions/build.undefined.js",
                          ":base-tests/functions/escapeQuotes.js",
                          ":base-tests/functions/compare.js",
                          ":base-tests/functions/has.js",
                          ":base-tests/functions/get.js",
                          ":base-tests/functions/count.js",
                          ":base-tests/functions/append.js",
                          ":base-tests/functions/parseObjectAddress.js",
                          ":base-tests/functions/normalizePath.js",
                          ":base-tests/functions/normalizeObjectAddress.js",
                          ":base-tests/functions/getPathInfo.js",
                          ":base-tests/functions/modules.js",
                          ":base-tests/functions/parseStack.js",
                          ":base-tests/functions/pad.js",
                          ":base-tests/functions/resolve.js",
                          ":base-tests/functions/resolvePath.js",
                          ":base-tests/functions/getPath.js",
                          ":base-tests/classes/Exception.js",
                          ":base-tests/classes/Context.js",
                          ":base-tests/classes/Logger.js",
                          ":base-tests/functions/inlineExecution.js",
                          ":base-tests/functions/getEqualitiesExpression.js",
                          ":base-tests/functions/tokenize.js",
                          ":base-tests/functions/t.js",
                          ":base-tests/functions/date.js",
                          ":base-tests/functions/load.js",
                          ":base-tests/functions/isNature.js",
                          ":base-tests/functions/each.js",
                          ":base-tests/functions/getDirectory.js",
                          ":base-tests/functions/styleToString.js",
                          ":base-tests/functions/type.js",
                          ":base-tests/classes/RouteInfo.js",
                          ":base-tests/classes/EventEmitter.js",
                          ":base-tests/classes/Configuration.js",
                          ":base-tests/classes/ConfigurationMergeFunctions.js",
                          ":base-tests/classes/ConfigurationValidation.js",
                          ":base-tests/classes/Actions.js",
                          ":base-tests/classes/ActionsQueue.js",
                          ":base-tests/site-examples/base-examples.js",
                        ],
  webProcesses:         [
                          { command: "node ./express-server.js --port 4590", startTimeout: 1000 },
                        ],
  webBrowsers:          [process.platform == "win32" ? "chrome" : "chromium"],
  webTestingPages:      [
                          {
                            url: "http://localhost:4590/unitests/unitests.html",
                            include: [
                              ":base-tests/functions/escapeQuotes.js",
                              "/base-tests/functions/modules.js",
                              ":base-tests/functions/has.js",
                              ":base-tests/functions/get.js",
                              ":base-tests/functions/count.js",
                              ":base-tests/functions/append.js",
                              ":base-tests/functions/resolve.js",
                              ":base-tests/functions/prepare.js",
                              ":base-tests/functions/parseObjectAddress.js",
                              ":base-tests/functions/normalizeObjectAddress.js",
                              ":base-tests/functions/resolvePath.js",
                              ":base-tests/functions/getPath.js",
                              ":base-tests/classes/Exception.js",
                              ":base-tests/functions/inlineExecution.js",
                              ":base-tests/functions/t.js",
                              ":base-tests/functions/getPathInfo.js",
                              ":base-tests/functions/load.js",
                              ":base-tests/classes/Configuration.js",
                              ":base-tests/classes/Actions.js",
                              ":base-tests/site-examples/base-examples.js",
                              ":base-tests/functions/isNature.js",
                              ":base-tests/functions/each.js",
                              ":base-tests/functions/getDirectory.js",
                              ":base-tests/functions/styleToString.js",
                              ":base-tests/functions/tokenize.js",
                            ]
                          },
                          {
                            url: "http://localhost:4590/unitests/nexttest.html",
                            include: [
                              /*":base-tests/functions/path.js",*/
                              ":base-tests/functions/modules.js"
                            ]
                          }
                        ],
})
.finally(function (a_result){
  function flush() {
    return Promise.all([
        new Promise((a_res)=>{ process.stdout.write("", ()=>{ setTimeout(()=>{ a_res(); }, 0); }); }),
        new Promise((a_res)=>{ process.stderr.write("", ()=>{ setTimeout(()=>{ a_res(); }, 0); }); })
      ]);
  };
  flush().then(()=>{
    process.exit(this.error() || a_result.errorCount ? 1 : 0);
  })
});
