//
// This is solely for importing a module from the current directory.
const libPath = require('path');
const libModule = require("module");
let splitter    = process.platform == "win32" ? ";" : ":";
let paths       = !process.env.NODE_PATH ? [] : process.env.NODE_PATH.split(splitter);
paths.unshift(libPath.join(__dirname, '../../../..'));
process.env.NODE_PATH = paths.join(splitter);
libModule.Module._initPaths();

let fcf = require("fcf-framework-core");

// Delay in the order of actions
{
  let fcf = require("fcf-framework-core");

  fcf.actions()
  .then(()=>{
    fcf.log.log("APP", "Performing the first action")
  })
  .wait(1000)
  .then(()=>{
    fcf.log.log("APP", "The end of the \"wait\" method")
  })

}
