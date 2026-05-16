fcf.module({
  name: ":base-tests/functions/modules/loop_mod2.js",
  dependencies: [],
  lazy: [":base-tests/functions/modules/loop_dep_mod2-1.js", ":base-tests/functions/modules/loop_dep_mod2-2.js"],
  module: ()=>{
    let test_modules = fcf.prepare(fcf, "namespaces.loop_dep_mod2");
    return function(){
      return {
        loop_dep_mod1: test_modules.loop_dep_mod1,
        loop_dep_mod2: test_modules.loop_dep_mod2,
      }
    }
  }
});
