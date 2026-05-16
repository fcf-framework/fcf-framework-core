fcf.module({
  name: ":base-tests/functions/modules/loop_mod_err1.js",
  dependencies: [":base-tests/functions/modules/loop_dep_err_mod1-1.js", ":base-tests/functions/modules/loop_dep_err_mod1-2.js"],
  lazy: [],
  module: (module)=>{
    let test_modules = fcf.prepare(fcf, "namespaces.loop_dep_err_mod1");
    return function(){
      return {
        loop_dep_mod1: test_modules.loop_dep_mod1,
        loop_dep_mod2: test_modules.loop_dep_mod2,
      }
    }
  }
});
