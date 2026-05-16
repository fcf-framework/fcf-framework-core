fcf.module({
  name: ":base-tests/functions/modules/loop_dep_mod1-2.js",
  dependencies: [],
  lazy: [":base-tests/functions/modules/loop_dep_mod1-1.js"],
  module: (module)=>{
    let test_modules = fcf.prepare(fcf, "namespaces.loop_dep_mod1");
    test_modules.loop_dep_mod2 = 1;
    return function(){
      return {
        loop_dep_mod1: test_modules.loop_dep_mod1,
        loop_dep_mod2: test_modules.loop_dep_mod2,
      }
    }
  }
});
