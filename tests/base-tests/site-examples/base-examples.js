fcf.test("Base examples", (a_unitest)=>{
  // fcf.replaceAll function
  {
    let newString = fcf.replaceAll("Some text: 123", "123", "987");
    //console.log(newString);
    a_unitest.equal(newString, "Some text: 987");
  }

  {
    let url = fcf.buildUrl("http://localhost:8080/index.html", {arg1: "value1"}, "ancor_value");
    a_unitest.equal(url, "http://localhost:8080/index.html?arg1=value1#ancor_value")
  }


  // {
  //   let ri = new fcf.RouteInfo("http://localhost:8080/index.html?q=v1");
  //   ri.urlArgs["key2"] = "v2";
  //   ri = new fcf.RouteInfo(ri);
  //   console.log(ri);
  //   // a_unitest.equal(url, "http://localhost:8080/index.html?arg1=value1#ancor_value")
  // }


  // fcf.decodeHtml function
  {
    let newString = fcf.decodeHtml("Ampersand character: &amp;");
    //console.log(newString);
    a_unitest.equal(newString, "Ampersand character: &");
  }
  {
    let newString = fcf.decodeHtml("Less than sign character: &lt;");
    //console.log(newString);
    a_unitest.equal(newString, "Less than sign character: <");
  }
  {
    let newString = fcf.decodeHtml("Delta character: &delta;");
    //console.log(newString);
    a_unitest.equal(newString, "Delta character: δ");
  }
  {
    let newString = fcf.decodeHtml("Greater than sign character (Dec value): &#62;");
    //console.log(newString);
    a_unitest.equal(newString, "Greater than sign character (Dec value): >");
  }



  // fcf.encodeHtml function
  {
    let newString = fcf.encodeHtml(`< > & " '`);
    //console.log(newString);
    a_unitest.equal(newString, "&lt; &gt; &amp; &quot; &apos;");
  }

  // fcf.stripTags function
  {
    let newString = fcf.stripTags(`<header>Title</header>\n<div>Content</div>`);
    //console.log(newString);
    a_unitest.equal(newString, "Title\nContent");
  }


  // fcf.ltrim function
  {
    let newString = fcf.ltrim(` test string `);
    //console.log(`"${newString}"`);
    a_unitest.equal(newString, "test string ");
  }
  {
    let newString = fcf.ltrim(`/path/file/`, "/");
    //console.log(`"${newString}"`);
    a_unitest.equal(newString, "path/file/");
  }
  {
    let newString = fcf.ltrim(` / \\ path/file/`, ["/","\\", false]);
    //console.log(`"${newString}"`);
    a_unitest.equal(newString, "path/file/");
  }

  // fcf.pad function
  {
    let newString = fcf.pad(`text`, 7);
    //console.log(`"${newString}"`);
    a_unitest.equal(newString, "text   ");
  }
  {
    let newString = fcf.pad(`98`, 7, "0", "r");
    //console.log(`"${newString}"`);
    a_unitest.equal(newString, "0000098");
  }
  {
    let newString = fcf.pad(`text`, 10, " ", "center");
    //console.log(`"${newString}"`);
    a_unitest.equal(newString, "   text   ");
  }

  // fcf.id function
  {
    //console.log(fcf.id());
    a_unitest.equal(fcf.id().length, 32);
  }
  // {
  //   console.log(fcf.id(8, true));
  //   console.log(fcf.id(8, true));
  //   console.log(fcf.id(8, true));
  //   console.log(fcf.id(8, true));
  //   console.log(fcf.id(8, true));
  // }
  // {
  //   console.log(fcf.id(8, false));
  //   console.log(fcf.id(8, false));
  //   console.log(fcf.id(8, false));
  //   console.log(fcf.id(8, false));
  //   console.log(fcf.id(8, false));
  // }


  // fcf.uuid function
  // {
  //   console.log(fcf.uuid());
  // }

  // fcf.decodeBase64 function
  {
    //console.log(fcf.decodeBase64("VGVzdCBzdHJpbmc="));
    a_unitest.equal(fcf.decodeBase64("VGVzdCBzdHJpbmc="), "Test string");
  }

  // fcf.encodeBase64 function
  {
    //console.log(fcf.encodeBase64("Test string"));
    a_unitest.equal(fcf.encodeBase64("Test string"), "VGVzdCBzdHJpbmc=");
  }

  // fcf.isObject function
  {
    // console.log(fcf.isObject({}));
    // console.log(fcf.isObject([]));
    // console.log(fcf.isObject(null));
    // console.log(fcf.isObject(1));
    a_unitest.equal(fcf.isObject({}), true);
    a_unitest.equal(fcf.isObject([]), true);
    a_unitest.equal(fcf.isObject(null), false);
    a_unitest.equal(fcf.isObject(1), false);
    a_unitest.equal(fcf.encodeBase64("Test string"), "VGVzdCBzdHJpbmc=");
  }

  // fcf.isIterable function
  {
    // console.log(`[]:        `, fcf.isIterable([]));
    // console.log(`new Map(): `, fcf.isIterable(new Map()));
    // console.log(`{}:        `, fcf.isIterable({}));
    // console.log(`"str":     `, fcf.isIterable("str"));
    // console.log(`1:         `, fcf.isIterable(1));
    // console.log(`null:      `, fcf.isIterable(null));
    a_unitest.equal(fcf.isIterable([]), true);
    a_unitest.equal(fcf.isIterable(new Map()), true);
    a_unitest.equal(fcf.isIterable({}), false);
    a_unitest.equal(fcf.isIterable("str"), false);
    a_unitest.equal(fcf.isIterable(1), false);
    a_unitest.equal(fcf.isIterable(null), false);
  }

  // fcf.isNumbered function
  {
    if (!fcf.isServer()){
      a_unitest.equal(fcf.isNumbered(document.querySelectorAll("body")), true);
      a_unitest.equal(fcf.isNumbered(document.querySelectorAll("body213213")), true);
    }
    a_unitest.equal(fcf.isNumbered([]), true);
    a_unitest.equal(fcf.isNumbered([1]), true);
    a_unitest.equal(fcf.isNumbered({0: 1}), false);
    a_unitest.equal(fcf.isNumbered(new Map()), false);
    a_unitest.equal(fcf.isNumbered(null), false);

    // console.log(`[]:        `, fcf.isNumbered([]));
    // if (!fcf.isServer())
    //   console.log(`NodeList:  `, fcf.isNumbered(document.querySelectorAll("body")));
    // console.log(`new Map(): `, fcf.isNumbered(new Map()));
    // console.log(`{}:        `, fcf.isNumbered({}));
    // console.log(`"str":     `, fcf.isNumbered("str"));
    // console.log(`1:         `, fcf.isNumbered(1));
    // console.log(`null:      `, fcf.isNumbered(null));
  }

  // fcf.isNature function
  {
    // console.warn(`"hello" is fcf.STRING           :`, fcf.isNature("hello", fcf.STRING));
    // console.warn(`null is [fcf.STRING, fcf.NULL]  :`, fcf.isNature(null, [fcf.STRING, fcf.NULL]));
    // console.warn(`1 is "number"                   :`, fcf.isNature(1, "number"));
    // console.warn(`[] is fcf.NUMBERED              :`, fcf.isNature([], fcf.NUMBERED));
    // console.warn(`"123" is fcf.NUMBERED           :`, fcf.isNature("123", fcf.NUMBERED));
    // console.warn(`"123" is fcf.NUMBER             :`, fcf.isNature("123", fcf.NUMBER));
    // console.warn(`new Date() is fcf.DATE             :`, fcf.isNature(new Date(), fcf.DATE));

    a_unitest.equal(fcf.isNature("hello", fcf.STRING), true);
    a_unitest.equal(fcf.isNature(false, fcf.STRING), false);
    a_unitest.equal(fcf.isNature(null, [fcf.STRING, fcf.NULL]), true);
    a_unitest.equal(fcf.isNature(1, "number"), true);
    a_unitest.equal(fcf.isNature([], fcf.NUMBERED), true);
    a_unitest.equal(fcf.isNature("123", fcf.NUMBER), false);

    // console.log(`[SOFT_MODE: TRUE]:  "123"                      is fcf.NUMBER :`, fcf.isNature("123", fcf.NUMBER, true));
    // console.log(`[SOFT_MODE: TRUE]:  ""                         is fcf.NUMBER :`, fcf.isNature("", fcf.NUMBER, true));
    // console.log(`[SOFT_MODE: FALSE]: "123"                      is fcf.NUMBER :`, fcf.isNature("123", fcf.NUMBER, false));
    // console.log(`[SOFT_MODE: TRUE]:  "2023-02-15T22:54:55.105Z" is fcf.DATE   :`, fcf.isNature("2023-02-15T22:54:55.105Z", fcf.DATE, true));
    // console.log(`[SOFT_MODE: FALSE]: "2023-02-15T22:54:55.105Z" is fcf.DATE   :`, fcf.isNature("2023-02-15T22:54:55.105Z", fcf.DATE, false));


    a_unitest.equal(fcf.isNature("123", fcf.NUMBER, true), true);
    a_unitest.equal(fcf.isNature("", fcf.NUMBER, true), false);
    a_unitest.equal(fcf.isNature("123", fcf.NUMBER, false), false);
    a_unitest.equal(fcf.isNature(NaN, fcf.NAN), true);
    a_unitest.equal(fcf.isNature(NaN, fcf.NUMBER), false);
    a_unitest.equal(fcf.isNature(0, fcf.NAN), false);
    a_unitest.equal(fcf.isNature(1, [fcf.NUMBER, fcf.NAN]), true);


  }



  // fcf.empty function
  {
    // console.log(`"" :         `, fcf.empty(""));
    // console.log(`"1":         `, fcf.empty("1"));
    // console.log(`null:        `, fcf.empty(null));
    // console.log(`{}:          `, fcf.empty({}));
    // console.log(`{v: 1}:      `, fcf.empty({v: 1}));
    // console.log(`[]:          `, fcf.empty([]));
    // console.log(`[1]:         `, fcf.empty([1]));
    // console.log(`NodeList0:   `, fcf.empty(document.querySelectorAll("non_existent_tag")));
    // console.log(`NodeList1:   `, fcf.empty(document.querySelectorAll("body")));
    // console.log(`Map:         `, fcf.empty(new Map()));
    // let notEmptyMap = new Map();
    // notEmptyMap.set("k1", 1);
    // console.log(`Map({k1:1}): `, fcf.empty(notEmptyMap));
    // console.log(`Set:         `, fcf.empty(new Set()));
    // let notEmptySet = new Set();
    // notEmptySet.add("k1");
    // console.log(`Set(["k1"]): `, fcf.empty(notEmptySet));

    a_unitest.equal(fcf.empty(""), true);
    a_unitest.equal(fcf.empty("1"), false);
    a_unitest.equal(fcf.empty(null), true);
    a_unitest.equal(fcf.empty({}), true);
    a_unitest.equal(fcf.empty({v: 1}), false);
    a_unitest.equal(fcf.empty([]), true);
    a_unitest.equal(fcf.empty([1]), false);
    if (!fcf.isServer()) {
      a_unitest.equal(fcf.empty(document.querySelectorAll("non_existent_tag")), true);
      a_unitest.equal(fcf.empty(document.querySelectorAll("body")), false);
    }

    a_unitest.equal(fcf.empty(new Map()), true);
    let notEmptyMap = new Map();
    notEmptyMap.set("k1", 1);
    a_unitest.equal(fcf.empty(notEmptyMap), false);
    a_unitest.equal(fcf.empty(new Set()), true);
    let notEmptySet = new Set();
    notEmptySet.add("k1");
    a_unitest.equal(fcf.empty(notEmptySet), false);


  }

  // fcf.equal
  // console.log(`0 == 0:      `, fcf.equal(0, 0));
  // console.log(`"0" == 0:    `, fcf.equal("0", 0));
  // console.log(`"0" === 0:   `, fcf.equal("0", 0, true));
  // console.log(`"a" == "a":  `, fcf.equal("a", "a"));
  // console.log(`"a" == "b":  `, fcf.equal("a", "b"));
  // console.log(`0 == false:  `, fcf.equal(0, false));
  // console.log(`0 === false: `, fcf.equal(0, false, true));
  // console.log(`NaN === NaN: `, fcf.equal(NaN, NaN, true));

  {
    let date1 = new Date("2023-09-07");
    let date2 = new Date("2023-09-07");
    a_unitest.equal(fcf.equal(date1, date2), true);
  }
  {
    let date1 = new Date("2023-09-07");
    let date2 = new Date("2023-09-08");
    a_unitest.equal(fcf.equal(date1, date2), false);
  }


  a_unitest.equal(fcf.equal(0, 0), true);
  a_unitest.equal(fcf.equal("0", 0), true);
  a_unitest.equal(fcf.equal("0", 0, true), false);
  a_unitest.equal(fcf.equal("a", "a"), true);
  a_unitest.equal(fcf.equal("a", "b"), false);
  a_unitest.equal(fcf.equal(0, false), true);
  a_unitest.equal(fcf.equal(0, false, true), false);
  a_unitest.equal(fcf.equal(NaN, NaN, true), true);
  a_unitest.equal(fcf.equal(NaN, NaN, false), true);
  a_unitest.equal(fcf.equal(new Date("asd"), new Date("asd"), false), true);


  //  fcf.equal Comparison of arrays
  // console.log(`[1] == [1]:     `, fcf.equal([1], [1]));
  // console.log(`["1"] == [1]:   `, fcf.equal(["1"], [1]));
  // console.log(`["1"] === [1]:  `, fcf.equal(["1"], [1], true));
  // console.log(`[1,2] == [1]:   `, fcf.equal([1,2], [1]));
  // console.log(`[[1]] == [[1]]: `, fcf.equal([[1]], [[1]]));
  // console.log(`[[1]] == [[2]]: `, fcf.equal([[1]], [[2]]));

  a_unitest.equal(fcf.equal([1], [1]), true);
  a_unitest.equal(fcf.equal(["1"], [1]), true);
  a_unitest.equal(fcf.equal(["1"], [1], true), false);
  a_unitest.equal(fcf.equal([1,2], [1]), false);
  a_unitest.equal(fcf.equal([[1]], [[1]]), true);
  a_unitest.equal(fcf.equal([[1]], [[2]]), false);

  //  fcf.equal Comparison of objects
  {
    let result = fcf.equal({v: 1}, {v: 1});
    //console.log(`{v: 1} == {v: 1}: `, result);
    a_unitest.equal(result, true);
  }
  {
    let result = fcf.equal({v: 1}, {v: 2});
    //console.log(`{v: 1} == {v: 2}: `, result);
    a_unitest.equal(result, false);
  }
  {
    let result = fcf.equal([1], [1]);
    //console.log(`[1] == [1]:       `, result);
    a_unitest.equal(result, true);
  }
  {
    let result = fcf.equal([1], [2]);
    //console.log(`[1] == [2]:       `, result);
    a_unitest.equal(result, false);
  }
  {
    let result = fcf.equal("1", 1);
    //console.log(`"1" == 1  :       `, result);
    a_unitest.equal(result, true);
  }
  {
    let result = fcf.equal("1", 1, true);
    //console.log(`"1" === 1 :       `, result);
    a_unitest.equal(result, false);
  }



  {
    let m1 = new Map();
    let m2 = new Map();
    a_unitest.equal(fcf.equal(m1, m2), true);
  }
  {
    let m1 = new Map();
    m1.set(1, 1);
    let m2 = new Map();
    m2.set(1, 1);
    a_unitest.equal(fcf.equal(m1, m2), true);
  }
  {
    let m1 = new Map();
    m1.set(1, 1);
    let m2 = new Map();
    m2.set(1, 2);
    a_unitest.equal(fcf.equal(m1, m2), false);
  }
  {
    let m1 = new Map();
    m1.set(1, {k: 1});
    let m2 = new Map();
    m2.set(1, {k: 1});
    a_unitest.equal(fcf.equal(m1, m2), true);
  }
  {
    let m1 = new Map();
    m1.set(1, {k: 1});
    let m2 = new Map();
    m2.set(1, {k: 2});
    a_unitest.equal(fcf.equal(m1, m2), false);
  }

  // fcf.compare
  {
    let result = fcf.compare({value: 2}, {value: 1});
    //console.log(`{value: 2} cmp {value: 1}:         `, result)
    fcf.equal(result, 1);
  }
  {
    let result = fcf.compare({value: 1}, {value: 1});
    //console.log(`{value: 1} cmp {value: 1}:         `, result)
    fcf.equal(result, 0);
  }
  {
    let result = fcf.compare({value: 1}, {value: 2});
    //console.log(`{value: 1} cmp {value: 2}:         `, result)
    fcf.equal(result, -1);
  }
  {
    let result = fcf.compare({value: "1"}, {value: 1});
    //console.log(`{value: "1"} cmp {value: 1}:       `, result)
    fcf.equal(result, 0);
  }
  {
    let result = fcf.compare({value: "1"}, {value: 1}, true);
    //console.log(`{value: "1"} strict_cmp {value: 1}:`, result)
    fcf.equal(result, 1);
  }

})
