fcf.test("Function fcf.t", (a_unitest)=>{

  fcf.getConfiguration().append({
    translations: [
      {
        language: "ja",
        translations: {
          "Hello world": "こんにちは世界",
        }
      }
    ],
  });
  fcf.getContext().language = "ja"
    //console.log(fcf.t("Hello world"));
  a_unitest.equal(fcf.t("Hello world"), "こんにちは世界");


  fcf.getConfiguration().append({
    translations: [
      {
        language: "xyz",
        translations: {
          "test1": "test_1xyz",
        }
      }
    ],
  });
  fcf.getConfiguration().append({
    translations: [":base-tests/functions/t/translations1.json",
                   ":base-tests/functions/t/translations2.json"],
  });
  a_unitest.equal(fcf.t("test1", "xyz"), "test_1xyz");
  a_unitest.equal(fcf.t("test2", "xyz"), "test2_xyz");
  a_unitest.equal(fcf.t("test3", "xyz1"), "test3_xyz1");
  a_unitest.equal(fcf.t("test4", "xyz2"), "test4_xyz2");

  fcf.appendTranslate({language: "xyz3", translations: {"test5": "test5_xyz3"}});
  a_unitest.equal(fcf.t("test5", "xyz3"), "test5_xyz3");

  fcf.appendTranslate(":base-tests/functions/t/translations3.json");
  a_unitest.equal(fcf.t("test6", "xyz5"), "test6_xyz5");

  fcf.appendTranslate(undefined, true);
  a_unitest.equal(fcf.t("test1", "xyz"), "test_1xyz");
  a_unitest.equal(fcf.t("test2", "xyz"), "test2_xyz");
  a_unitest.equal(fcf.t("test3", "xyz1"), "test3_xyz1");
  a_unitest.equal(fcf.t("test4", "xyz2"), "test4_xyz2");
  a_unitest.equal(fcf.t("test5", "xyz3"), "test5_xyz3");
  a_unitest.equal(fcf.t("test6", "xyz5"), "test6_xyz5");

  a_unitest.equal(fcf.translate("test6", "xyz5"), "test6");
  a_unitest.equal(fcf.translate("!{{test6}}!", "xyz5"), "test6_xyz5");
  a_unitest.equal(fcf.translate("_!{{test6}}!_", "xyz5"), "_test6_xyz5_");
  a_unitest.equal(fcf.translate("_!{test6}!_", "xyz5"), "_test6_xyz5_");
  a_unitest.equal(fcf.translate("_!{{test61}}!_", "xyz5"), "_test61_");
  a_unitest.equal(fcf.translate("_!{test61}!_", "xyz5"), "_test61_");
  a_unitest.equal(fcf.translate("_!_{test61}!_", "xyz5"), "_!_{test61}!_");
  a_unitest.equal(fcf.translate("_!{{test1}}!!{test2}!_", "xyz"), "_test_1xyztest2_xyz_");

  // let count = 100000;
  // {
  //   let start = Date.now();
  //   let res;
  //   for(let i = 0; i < count; ++i) {
  //     //res = fcf.tokenize("12345678_}_9asdasd");
  //     res = fcf.translate("12345678_}_9asdasd");
  //   }
  //   console.warn((Date.now() - start) / count, res);
  // }

});
