fcf.test("Function fcf.NDetails.inlineExecution", (a_unitest) => {
  // let c = 10;
  // let command = "value.obj.item";
  // for (let i = 0; i < c; ++i){
  //   let start = Date.now();
  //   let size  = 100000;
  //   let res;
  //   let code;
  //   for(let i = 0; i < size; ++i) {
  //     code = fcf.NDetails.inlineExecution.parse(command);
  //   }
  //   let end1 = Date.now();
  //   let startExec = Date.now();
  //   for(let i = 0; i < size; ++i) {
  //     //res = fcf.inlineExecution(command, {value: {obj: {item: "test"}}});
  //     res = fcf.resolve({value: {obj: {item: "test"}}}, "value.obj.item");
  //   }
  //   let end2 = Date.now();
  //
  //   let d1  = end1 - start;
  //   let d2  = end2 - startExec;
  //   if (c == i + 1){
  //     fcf.log.tst("", d2/size, " ", d1 / size, " ", res);
  //   }
  // }

  class TestClass {
    constructor(a_arg1, a_arg2){
      this.default = 3;
      this.arg1 = a_arg1;
      this.arg2 = a_arg2;
    }
  }

  if (fcf.inlineExecution("undefined") !== undefined)
    a_unitest.error("Faild result");
  if (!isNaN(fcf.inlineExecution("NaN")))
    a_unitest.error("Faild result");
  if (fcf.inlineExecution("Infinity") !== Infinity)
    a_unitest.error("Faild result");
  if (fcf.inlineExecution("false") !== false)
    a_unitest.error("Faild result");
  if (fcf.inlineExecution("true") !== true)
    a_unitest.error("Faild result");
  if (fcf.inlineExecution("true | false") !== 1)
    a_unitest.error("Faild result");
  if (fcf.inlineExecution("true || false") !== true)
    a_unitest.error("Faild result");
  a_unitest.equal(fcf.inlineExecution("typeof obj", {obj: {val: 10}}), "object");
  a_unitest.equal(fcf.inlineExecution("typeof obj.val", {obj: {val: 10}}), "number");
  a_unitest.equal(fcf.inlineExecution("typeof '1'"), "string");
  a_unitest.equal(fcf.inlineExecution("(typeof 1).toString()"), "number");
  a_unitest.equal(fcf.inlineExecution("0.5 * 2"), 1);
  a_unitest.equal(fcf.inlineExecution(" 0.5 * 2 "), 1);
  a_unitest.equal(fcf.inlineExecution("0.5*2"), 1);
  a_unitest.equal(fcf.inlineExecution("1 + 2"), 3);
  a_unitest.equal(fcf.inlineExecution("1 + 2 * 2"), 5);
  a_unitest.equal(fcf.inlineExecution(" 1 + 2 * 2 * 3.5 "), 15);
  a_unitest.equal(fcf.inlineExecution("2*2*3.5+1"), 15);
  a_unitest.equal(fcf.inlineExecution("- -1"), 1);
  a_unitest.equal(fcf.inlineExecution("- - -1"), -1);
  a_unitest.equal(fcf.inlineExecution("(!1)"), false);
  a_unitest.equal(fcf.inlineExecution("!!1"), true);
  a_unitest.equal(fcf.inlineExecution("1 ? null : true"), null, true);
  a_unitest.equal(fcf.inlineExecution("2*- - -1"), -2);
  a_unitest.equal(fcf.inlineExecution(" 2 * - - - 1"), -2);
  a_unitest.equal(fcf.inlineExecution("2*(-1)"), -2);
  a_unitest.equal(fcf.inlineExecution("1 * (3 + 1)"), 4);
  a_unitest.equal(fcf.inlineExecution("5 * -(3 + -1)"), -10);
  a_unitest.equal(fcf.inlineExecution("(5 * 3  > (10))"), true);
  a_unitest.equal(fcf.inlineExecution("-(9*9 - 1*3) * 2"), -156);
  a_unitest.equal(fcf.inlineExecution("-(9*9 - 1*3) * - -2"), -156);
  a_unitest.equal(fcf.inlineExecution("-(9*9 - 1*3) * - - - 2"), 156);
  a_unitest.equal(fcf.inlineExecution("9*9 - 1*3*2 - 1/2 + 1%2"), 75.5);
  a_unitest.equal(fcf.inlineExecution("((1 > 0) ? 2+1 : 0) + 1"), 4);
  a_unitest.equal(fcf.inlineExecution("((1 < 0) ? 2+1 : 0) + 1"), 1);
  a_unitest.equal(fcf.inlineExecution("1 ? (1 ? 2 : 1) : 0"), 2);
  a_unitest.equal(fcf.inlineExecution("1?1?2+1:1+1:0+1"), 3);
  a_unitest.equal(fcf.inlineExecution("1 ? 1 ? ( 2 + 1 ) : ( 1 + 1 ) : (0 + 1)"), 3);
  a_unitest.equal(fcf.inlineExecution("(1 ? (1 ? ( 2 + 1 ) : ( 1 + 1 )) : (0 + 1))"), 3);
  a_unitest.equal(fcf.inlineExecution("(0 ? obj1 : obj2).value", {obj1: {value: 1}, obj2: {value: 2}}), 2);
  a_unitest.equal(fcf.inlineExecution("(1 ? obj1 : obj2).value", {obj1: {value: 1}, obj2: {value: 2}}), 1);
  a_unitest.equal(fcf.inlineExecution("3 % 2 == 1"), true);
  a_unitest.equal(fcf.inlineExecution("date instanceof Date", {date: new Date()}), true);
  a_unitest.equal(fcf.inlineExecution("test instanceof TestClass", {test: new TestClass(), TestClass: TestClass}), true);
  a_unitest.equal(fcf.inlineExecution("date instanceof Date && false", {date: new Date()}), false);
  a_unitest.equal(fcf.inlineExecution("date instanceof Date && true", {date: new Date()}), true);
  a_unitest.equal(fcf.inlineExecution("(date instanceof Date) && true", {date: new Date()}), true);
  a_unitest.equal(fcf.inlineExecution("(date instanceof Date)", {date: new Date()}), true);
  a_unitest.equal(fcf.inlineExecution("(date instanceof[Date][0])", {date: new Date()}), true);
  a_unitest.equal(fcf.inlineExecution("1 instanceof Date"), false);
  a_unitest.equal(fcf.inlineExecution("[] instanceof Array"), true);
  a_unitest.equal(fcf.inlineExecution("[date instanceof Date][0]", {date: new Date()}), true);
  a_unitest.equal(fcf.inlineExecution("[{} instanceof Date][0]", {date: new Date()}), false);
  a_unitest.equal(fcf.inlineExecution("\"t\" in {t: 1}"), true);
  a_unitest.equal(fcf.inlineExecution("\"t\" in ({k: {t: 1}})['k']"), true);
  a_unitest.equal(fcf.inlineExecution("\"q\" in ({t: 1})"), false);
  a_unitest.equal(fcf.inlineExecution("(\"q\") in ({t: 1})"), false);
  a_unitest.equal(fcf.inlineExecution("k in o", {k : "t", o: {t:1}}), true);
  a_unitest.equal(fcf.inlineExecution("\"123\""), "123");
  a_unitest.equal(fcf.inlineExecution("\"123\\\"\d\""), "123\"d");
  a_unitest.equal(fcf.inlineExecution("'123\\x66'"), "123f");
  a_unitest.equal(fcf.inlineExecution("'123\\x66a'"), "123fa");
  a_unitest.equal(fcf.inlineExecution("'123\\u0001'"), "123\u0001");
  a_unitest.equal(fcf.inlineExecution("'123\\u0001_'"), "123\u0001_");
  a_unitest.equal(fcf.inlineExecution("'123\\t'"), "123\t");
  a_unitest.equal(fcf.inlineExecution("\"123\\n\""), "123\n");
  a_unitest.equal(fcf.inlineExecution("'123\\\\1'"), "123\\1");
  a_unitest.equal(fcf.inlineExecution("'123\\\"1'"), "123\"1");
  a_unitest.equal(fcf.inlineExecution("'123\\'1'"), "123'1");
  a_unitest.equal(fcf.inlineExecution("'123\\77_'"), "123?_");
  a_unitest.equal(fcf.inlineExecution("'123\\77'"), "123?");
  a_unitest.equal(fcf.inlineExecution("1 > 0 ? 1 : 0"), 1);
  a_unitest.equal(fcf.inlineExecution(" (1 > 0 ? \"123\" : \"\") "), "123");
  a_unitest.equal(fcf.inlineExecution(" (1 < 0 ? \"123\" : \"\") "), "");
  a_unitest.equal(fcf.inlineExecution("!1 ? !2 : ~2 * !-1"), 0);
  a_unitest.equal(fcf.inlineExecution("1 ? !2 || -2 : 2 * !-1"), -2);
  a_unitest.equal(fcf.inlineExecution("value", {value: 2}), 2);
  a_unitest.equal(fcf.inlineExecution("value.item", {value: {item: 3}}), 3);
  a_unitest.equal(fcf.inlineExecution(" value.item * 2 ", {value: {item: 3}}), 6);
  a_unitest.equal(fcf.inlineExecution(" value.item1 * value.item2 ? 1 : 2", {value: {item1: 3, item2: 2}}), 1);
  a_unitest.equal(fcf.inlineExecution("value[0]", {value: [1, 2]}), 1);
  a_unitest.equal(fcf.inlineExecution("value[0 + 1].item", {value: [{item: 1}, {item: 2}]}), 2);
  a_unitest.equal(fcf.inlineExecution("value[0 + 1 * 2 - 1].item", {value: [{item: 1}, {item: 2}]}), 2);
  a_unitest.equal(fcf.inlineExecution("value[1 > 2 ? 0 : 1].item", {value: [{item: 1}, {item: 2}]}), 2);
  a_unitest.equal(fcf.inlineExecution("value[\"0\"].item", {value: [{item: 1}, {item: 2}]}), 1);
  a_unitest.equal(fcf.inlineExecution("value[\"obj\"].item", {value: { obj:  {item: "test"} }} ), "test");
  a_unitest.equal(fcf.inlineExecution("isNaN()"), true);
  a_unitest.equal(fcf.inlineExecution("parseInt(\"123\")"), 123);
  a_unitest.equal(fcf.inlineExecution("Math.max(1, 2, 3)"), 3);
  a_unitest.equal(fcf.inlineExecution("-parseInt(1*2)"), -2);
  a_unitest.equal(fcf.inlineExecution("Array('test_', 1 + 1).join('') + '_'"), "test_2_");
  a_unitest.equal(fcf.inlineExecution("parseInt(Array('123')[0].substr(1))"), 23);
  a_unitest.equal(fcf.inlineExecution("-parseInt(Array('123').at(0).substr(1)) + '_'"), "-23_");
  a_unitest.equal(fcf.inlineExecution("(-parseInt(Array('123').at(0).substr(1)) + '_')"), "-23_");
  a_unitest.equal(fcf.inlineExecution("((-parseInt(Array('123').at(0).substr(1)))) + '_'"), "-23_");
  a_unitest.equal(fcf.inlineExecution("-((parseInt(Array('123').at(0).substr(1)))) + '_'"), "-23_");
  a_unitest.equal(fcf.inlineExecution("\"123\".substr(1)"), "23");
  a_unitest.equal(fcf.inlineExecution("\"123\".substr(1,1)"), "2");
  a_unitest.equal(fcf.inlineExecution("(\"123\").substr(1,2)"), "23");
  a_unitest.equal(fcf.inlineExecution("'_' + \"123\".substr(1) + '+'"), "_23+");
  a_unitest.equal(fcf.inlineExecution("fcf.replaceAll(123, '2', '_').substr(1)"), "_3");
  a_unitest.equal(fcf.inlineExecution("parseFloat('123')"), 123);
  a_unitest.equal(fcf.inlineExecution("'123'.concat('_')"), "123_");
  a_unitest.equal(fcf.inlineExecution("'123'.concat('_').concat('1')"), "123_1");
  a_unitest.equal(fcf.inlineExecution("arr.at(0)", {arr: [1,2,3]}), 1);
  a_unitest.equal(fcf.inlineExecution("arr.at(!1 + 1, !1 + 1, 1)", {arr: [2,1,3]}), 1);
  a_unitest.equal(fcf.inlineExecution("arr.at(!1 + 1, !1 + 1)", {arr: [2,1,3]}), 1);
  a_unitest.equal(fcf.inlineExecution("arr[0]", {arr: [1,2,3]}), 1);
  a_unitest.equal(fcf.inlineExecution("String('123')"), "123");
  a_unitest.equal(fcf.inlineExecution("Array(1,2,3)"), [1,2,3]);
  a_unitest.equal(fcf.inlineExecution("fcf['replaceAll']('123','2','_')"), "1_3");
  a_unitest.equal(fcf.inlineExecution("new Date('2000-12-11').getTime()"), new Date('2000-12-11').getTime());
  a_unitest.equal(fcf.inlineExecution("(new Date('2000-12-11')).getTime()"), new Date('2000-12-11').getTime());
  a_unitest.equal(fcf.inlineExecution("new Array"), []);
  a_unitest.equal(fcf.inlineExecution("new Array('1')"), ['1']);
  a_unitest.equal(fcf.inlineExecution("new Array(!0)"), [true]);
  a_unitest.equal(fcf.inlineExecution("new Array('1', '2')"), ['1', '2']);
  a_unitest.equal(fcf.inlineExecution("new Array('1', '2')[2-1]"), '2');
  a_unitest.equal(fcf.inlineExecution("new Array('1').at(0)"), '1');
  a_unitest.equal(fcf.inlineExecution("'123'.substr(1, 2)"), '23');
  a_unitest.equal(fcf.inlineExecution("Math.PI"), Math.PI);
  a_unitest.equal(fcf.inlineExecution("JSON.parse('{\"1\":2}')"), {"1":2});
  a_unitest.equal(fcf.inlineExecution("JSON.stringify(obj)", {obj: {"1":"2"}}), '{"1":"2"}');
  a_unitest.equal(fcf.inlineExecution(" { } "), {});
  a_unitest.equal(fcf.inlineExecution(" ({ }) "), {});
  a_unitest.equal(fcf.inlineExecution(" ({ test: '2' })['test'] "), 2);
  a_unitest.equal(fcf.inlineExecution(" ({ test: !1 })['test'] "), false);
  a_unitest.equal(fcf.inlineExecution(" ({ test: !1, 1: 1 })['test'] "), false);
  a_unitest.equal(fcf.inlineExecution(" ({ test: !1, })['test'] "), false);
  a_unitest.equal(fcf.inlineExecution("{2: 5*2}"), {2: 10});
  a_unitest.equal(fcf.inlineExecution("{ \"undefined\" : ~(5*2) }"), {undefined: -11});
  a_unitest.equal(fcf.inlineExecution("!true"), false);
  a_unitest.equal(fcf.inlineExecution("!!true"), true);
  a_unitest.equal(fcf.inlineExecution("{test: 5*2}"), {test: 10});
  a_unitest.equal(fcf.inlineExecution("{2: {'test': 1}}"), {2: {test: 1}});
  a_unitest.equal(fcf.inlineExecution("{a2: {test: 1}}"), {a2: {test: 1}});
  a_unitest.equal(fcf.inlineExecution("({1:1}).toString()"), "[object Object]");
  a_unitest.equal(fcf.inlineExecution("{ value1 : arg1 }", {arg1: 1}), {value1: 1});
  a_unitest.equal(fcf.inlineExecution("{\"value1\":arg1, value2: arg2}", {arg1: 1, arg2: 2}), {value1: 1, value2: 2});
  a_unitest.equal(fcf.inlineExecution("{\"value1\": (2-arg1), value2: arg2}", {arg1: 1, arg2: 2}), {value1: 1, value2: 2});
  a_unitest.equal(fcf.inlineExecution("{value1:arg1, value2: arg2}", {arg1: 1, arg2: 2}), {value1: 1, value2: 2});
  a_unitest.equal(fcf.inlineExecution("[arg1, {value2: arg2}]", {arg1: 1, arg2: 2}), [1, {value2: 2}]);
  a_unitest.equal(fcf.inlineExecution("[arg1, {value2: arg2+1}]", {arg1: 1, arg2: 2}), [1, {value2: 3}]);
  a_unitest.equal(fcf.inlineExecution("(\"1\").toString()"), "1");
  a_unitest.equal(fcf.inlineExecution("(1).toString()"), "1");
  a_unitest.equal(fcf.inlineExecution("(NaN).toString()"), "NaN");
  a_unitest.equal(fcf.inlineExecution("JSON.stringify({2: {'test': (1+2).toString()}})"), "{\"2\":{\"test\":\"3\"}}");
  a_unitest.equal(fcf.inlineExecution("{1:11, k: 22 + 1, 3: {1: {test: \"String\"}}, 4: 4}"), {1: 11, k: 23, 3: {1: {test: "String"}}, 4:4});
  a_unitest.equal(fcf.inlineExecution("[]"), []);
  a_unitest.equal(fcf.inlineExecution("[1]"), [1]);
  a_unitest.equal(fcf.inlineExecution("[ 1 ,  2 + 1 ]"), [1, 3]);
  a_unitest.equal(fcf.inlineExecution("[ 1, !2, 1 ]"), [1, false, 1]);
  a_unitest.equal(fcf.inlineExecution("[ 2 * obj.val,  2 + 1 ]", {obj: {val: 10}}), [20, 3]);
  a_unitest.equal(fcf.inlineExecution("[].at(0)"), undefined);
  a_unitest.equal(fcf.inlineExecution("[ 2 * obj.val,  2 + 1 ].at(0)", {obj: {val: 10}}), 20);
  a_unitest.equal(fcf.inlineExecution("[ 2 * obj.val,  [2 + 1, [0]] ].at(1)", {obj: {val: 10}}), [3,[0]]);
  a_unitest.equal(fcf.inlineExecution(" 'i' + \"j\" + 1"), "ij1");
  a_unitest.equal(fcf.inlineExecution("`12345${6}7`"), "1234567");
  a_unitest.equal(fcf.inlineExecution("`12345${1 + 2}7`"), "1234537");
  a_unitest.equal(fcf.inlineExecution("`12345\\${1}7`"), "12345${1}7");
  a_unitest.equal(fcf.inlineExecution("parseInt(`${value + 2}`) + 1", {value: 1}), "4");
  a_unitest.equal(fcf.inlineExecution("fcf.isServer()"), fcf.isServer());
  if (fcf.isServer()){
    let error;
    try {
      fcf.inlineExecution("!!fcf");
    } catch(e){
      error = e;
    }
    if (!error){
      a_unitest.error("No Error");
    }
  }
  if (fcf.isServer()){
    let error;
    try {
      fcf.inlineExecution("fcf.getConfiguration");
    } catch(e){
      error = e;
    }
    if (!error){
      a_unitest.error("No Error");
    }
  }
  a_unitest.equal(fcf.inlineExecution("fcf.test", {fcf: {test: 1}}), 1);
  a_unitest.equal(fcf.inlineExecution("fcf", {fcf: {test: 1}}), {test: 1});
  a_unitest.equal(fcf.inlineExecution("fcf.NUMBER"), 4);

  a_unitest.equal(fcf.inlineExecution("Array.isArray([])"), true);
  a_unitest.equal(fcf.inlineExecution("Array.isArray({})"), false);

  class TestGetter{
    test(){
      return 1;
    }
  };

  fcf.getConfiguration().append({
    tokenize: {
      functions: [
        {
          "object": "*",
          "class":  TestGetter,
          "allow":  ["*"],
        },
      ]
    }
  });

  a_unitest.equal(fcf.inlineExecution("t.test()", {t: new TestGetter()}), 1);
  try {
    a_unitest.equal(fcf.inlineExecution("t.__defineGetter__(\"ads\", Math.abs)", {t: new TestGetter()}), undefined);
    if (fcf.isServer()) {
      a_unitest.error("Failed test");
    }
  } catch(e){
  }





//  __defineGetter__


});
