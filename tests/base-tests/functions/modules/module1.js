fcf.module({
  name: ":base-tests/functions/modules/module1.js",
  dependencies: [ "base-tests/functions/modules/module1_sub1_simple.js",
                  ":base-tests/functions/modules/module1_sub2_export.js",
                  ":/base-tests/functions/modules/module1_sub3.js"],
  module: (sub1, sub2, sub3) => {
   return [sub1, sub2, sub3];
  }
});
