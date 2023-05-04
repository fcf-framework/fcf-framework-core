(function() {
  const libPath   = require("path");
  const libModule = require("module");

  let _directories = { };

  module.exports = new (class {

    appendModuleDirectory(a_directory) {
      let splitter    = process.platform == "win32" ? ";" : ":";
      let paths       = fcf.empty(process.env.NODE_PATH) ? [] : process.env.NODE_PATH.split(splitter);
      let directories = !Array.isArray(a_directory) ? [a_directory] : a_directory;
      let needUpdate  = false;
      for(let dir of directories){
        if (typeof dir !== "string")
          continue;
        dir = fcf.getPath(dir);
        if (paths.indexOf(dir) == -1){
          paths.unshift(dir);
          needUpdate = true;
        }
      }
      if (needUpdate) {
        process.env.NODE_PATH = paths.join(splitter);
        libModule.Module._initPaths();
      }
      _directories = {};
    }

    resolveModule(a_module){
      a_module = a_module.split("\\")[0].split("/")[0];
      if (!(a_module in _directories)) {
        if (a_module == "..") {
          throw new fcf.Exception("GET_PATH_ERROR_INVALID_MODULE_NAME", { path: a_module});
        } else if (a_module == ".") {
          _directories[a_module] = process.cwd();
        } else {
          try {
            _directories[a_module] = libPath.dirname(require.resolve(`${a_module}/package.json`));
          } catch(e){
            throw new fcf.Exception("GET_PATH_ERROR_INVALID_MODULE_NAME", { path: a_module});
          }
        }
      }
      return _directories[a_module];
    }

  })();
})();
