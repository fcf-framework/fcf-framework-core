//
// This is solely for importing a module from the current directory.
const libPath = require('path');
const libModule = require("module");
let splitter    = process.platform == "win32" ? ";" : ":";
let paths       = !process.env.NODE_PATH ? [] : process.env.NODE_PATH.split(splitter);
paths.unshift(libPath.join(__dirname, '../../../..'));
process.env.NODE_PATH = paths.join(splitter);
libModule.Module._initPaths();

{
let fcf = require("fcf-framework-core");

async function main() {
  let actions = fcf.actions();
  await actions
  .then(()=>{
    fcf.log.log("APP", "The value of the state empty:                            ", actions.empty())
  });

  fcf.log.log("APP", "The state of the empty flag after completing all actions:", actions.empty())
}

main();
}
