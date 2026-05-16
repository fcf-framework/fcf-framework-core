fcf.test("Function fcf.tokenize", (a_unitest)=>{


  // let size = 100000;
  // {
  //   let res;
  //   let start = Date.now();
  //   for(let i = 0; i < size; ++i) {
  //     res = fcf.pattern("test string @{args.value}@", {args:{value: 1}});
  //   }
  //   console.warn("pattern: ", (Date.now() - start) / size, res);
  // }
  // {
  //   let res;
  //   let start = Date.now();
  //   for(let i = 0; i < size; ++i) {
  //     res = fcf.tokenize("test string @{{args.value}}@", {args:{value: 1}});
  //     //fcf.inlineExecution(`args.value`, {args: {value: 1}});
  //     //res = fcf.tokenize({v: { k1: 1, k2: 1, k3: 1, k4: 1, k5: 1, k6: 1, k7: 1, k8: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], data: "asd @{{args.value1}}@"}}, {args:{value1: 1}})
  //   }
  //   console.warn("tokenize: ", (Date.now() - start) / size, res);
  // }

  //console.log("", "11111111111111");

  {
    // Example of adding global function call permission
    function getString() {
      return "Hello world";
    }
    (fcf.isServer() ? global : window).getString = getString;

    fcf.getConfiguration().append({
      tokenize: {
        functions: [
          {
            object: "",
            allow:  ["getString"],
          },
        ]
      }
    });
    let result = fcf.tokenize("Value: @{{ getString() }}@");
    a_unitest.equal(result, "Value: Hello world");
  }

  {
    (fcf.isServer() ? global : window).Namespace = {
      getString: () => {
        return "Hello world";
      }
    };

    fcf.getConfiguration().append({
      tokenize: {
        functions: [
          {
            object: "Namespace",
            allow:  ["getString"],
          },
        ]
      }
    });

    let result = fcf.tokenize("Value: @{{ Namespace.getString() }}@");
    a_unitest.equal(result, "Value: Hello world");
  }
  {
    class Class {
      constructor() {
        this.value = 1;
      }

      getString(){
        return "Hello world";
      }
    }
    (fcf.isServer() ? global : window).Class = Class;

    fcf.getConfiguration().append({
      tokenize: {
        functions: [
          {
            object: "*",
            class:  "Class",
            allow:  ["constructor", "getString"],
          },
        ]
      }
    });

    let propertyValue = fcf.tokenize("Value: @{{(new Class()).value}}@");
    a_unitest.equal(propertyValue, "Value: 1");
    //console.log(propertyValue);

    let methodGetString = fcf.tokenize("getString: @{{object.getString()}}@", {object: new Class()});
    a_unitest.equal(methodGetString, "getString: Hello world");
    //console.log(methodGetString);
  }
  {
    let result = fcf.tokenize("@{{array[0]}}@", {array: [{value: 1}]}, {result: "auto"});
    // console.log(result);
    a_unitest.equal(result, {value: 1});

  }
  {
    let result = fcf.pattern("Next value: @{value + 1}@", {value: 1});
    //console.log(result);
    a_unitest.equal(result, "Next value: 2");
  }
  {
    let result = fcf.pattern("@{array[0]}@", {array: [{value: 1}]}, {result: "auto"});
    //console.log(result);
    a_unitest.equal(result, {value: 1});

  }
  {
    fcf.getConfiguration().append({
      translations: [
        {
          language: "ja",
          translations: {
            "Next value: @{value + 1}@": "次の値: @{value + 1}@",
          }
        }
      ]
    });

    fcf.getContext().language = "ja";
    let result = fcf.pattern("Text: !{Next value: @{value + 1}@}!", {value: 1});
    //console.log(result);
    a_unitest.equal(result, "Text: 次の値: 2");
  }


  {
    class Class {
      constructor() {
        this.value = 1;
      }

      getString(){
        return "Hello world";
      }
    }
    (fcf.isServer() ? global : window).Class = Class;

    fcf.getConfiguration().append({
      tokenize: {
        functions: [
          {
            "object": "*",
            "class":  "Class",
            "allow":  ["*"],
          },
        ]
      }
    });

    let propertyValue = fcf.tokenize("Value: @{{(new Class()).value}}@");
    a_unitest.equal(propertyValue, "Value: 1");
    // console.log(propertyValue);

    let methodGetString = fcf.tokenize("getString: @{{object.getString()}}@", {object: new Class()});
    a_unitest.equal(methodGetString, "getString: Hello world");
    // console.log(methodGetString);
  }
  {
    fcf.getConfiguration().append({
      translations: [
        {
          language: "ja",
          translations: {
            "Next value: @{{value + 1}}@": "次の値: @{{value + 1}}@",
          }
        }
      ]
    });

    fcf.getContext().language = "ja";
    let result = fcf.tokenize("Text: !{{Next value: @{{value + 1}}@}}!", {value: 1});
    a_unitest.equal(result, "Text: 次の値: 2");
    //console.log(result);
  }
  {
    (fcf.isServer() ? global : window).globalVariable1 = "value1";
    (fcf.isServer() ? global : window).globalVariable2 = { subitem: "value2" };
    fcf.getConfiguration().append({
      tokenize: {
        objects: {
          "globalVariable1": "globalVariable1",
          "globalVariable2": "globalVariable2.subitem",
        }
      }
    });
    let result1 = fcf.tokenize("Global variable 1: @{{globalVariable1}}@");
    a_unitest.equal(result1, "Global variable 1: value1");
    let result2 = fcf.tokenize("Global variable 2: @{{globalVariable2}}@");
    a_unitest.equal(result2, "Global variable 2: value2");
  }
  {
    let result = fcf.pattern("@{ {value: arg1} }@", {arg1: 1}, {result: "auto"});
    a_unitest.equal(result, {value: 1});
    // console.log(result);
  }
  {
    let result = fcf.pattern("@{{value: arg1}}@", {arg1: 1});
    a_unitest.equal(result, "@{{value: arg1}}@");
    // console.log(result);
  }
  {
    let result = fcf.inlineExecution("arg1 ? 'Yes' : 'No'", {arg1: 1});
    a_unitest.equal(result, "Yes");
    //console.log(result);
  }

  class Test {
    constructor(){
      this.value  = 1;
    }
  };
  fcf.prepare(fcf, "Tests").TokenizeGlobalClass = Test;
  (fcf.isServer() ? global : window).Tests = Test;

  fcf.getConfiguration().append({
    tokenize: {
      functions: [
        {
          object: "Tests",
          allow:  ["constructor"],
        },
        {
          object: ["fcfTest.Tests.TokenizeGlobalClass", "fcf.Tests.TokenizeGlobalClass"],
          allow:  ["*"],
        }
      ]
    },
    translations: [
      {
        language: "ja",
        translations: {
          "test value: @{{value}}@": "テスト値: @{{value}}@",
          "test value: @{value}@": "テスト値: @{value}@",
        }
      }
    ]
  });


  if (fcf.tokenize("@{{args.value}}@", {args:{value: 1}}, {result: "auto"}) !== 1) {
    a_unitest.error("Faild result type");
  }
  if (fcf.tokenize("@{{true}}@", {args:{value: 1}}, {result: "auto"}) !== true) {
    a_unitest.error("Faild result type");
  }
  a_unitest.equal(fcf.tokenize("@{{new Tests().value}}@"), 1);
  a_unitest.equal(fcf.tokenize("@{{new fcfTest.Tests.TokenizeGlobalClass().value}}@"), 1);

  a_unitest.equal(fcf.tokenize("@{{args.value1}}", {args:{value1: 1}}), "@{{args.value1}}");
  a_unitest.equal(fcf.tokenize({v: { data: "@{{args}}@"}}, {args:{value1: 1}}, {result: "auto"}), {v: { data: {value1: 1}}});
  a_unitest.equal(fcf.tokenize("{{args.value1}}@", {args:{value1: 1}}, {result: "auto"}), "{{args.value1}}@");
  a_unitest.equal(fcf.tokenize("_{{args.value1}}@", {args:{value1: 1}}, {result: "auto"}), "_{{args.value1}}@");
  a_unitest.equal(fcf.tokenize("@{{args.value1}}@", {args:{value1: 1}}, {result: "auto"}), 1);
  a_unitest.equal(fcf.tokenize("_@{{args.value1}}@", {args:{value1: 1}}, {result: "auto"}), "_1");
  a_unitest.equal(fcf.tokenize("@{{args.value1}}@_", {args:{value1: 1}}), "1_");
  a_unitest.equal(fcf.tokenize("_@{{args.value1}}@@{{args.value2}}@", {args:{value1: 1, value2: 2}}), "_12");
  a_unitest.equal(fcf.tokenize("_@{{args.value1}}@_@{{args.value2}}@", {args:{value1: 1, value2: 2}}), "_1_2");
  a_unitest.equal(fcf.tokenize("_@{{args.value1}}@_@{{args.value2}}@_", {args:{value1: 1, value2: 2}}), "_1_2_");
  a_unitest.equal(fcf.tokenize("_!{{test strin asda}}!_@{{args.value2}}@_", {args:{value1: 1, value2: 2}}), "_test strin asda_2_");
  a_unitest.equal(fcf.tokenize("_!{{test strin asda}}!_!{{2}}!_"), "_test strin asda_2_");
  a_unitest.equal(fcf.tokenize("_!{{test strin asda}}!!{{2}}!_"), "_test strin asda2_");
  a_unitest.equal(fcf.tokenize("!{{test string @{{test}}@}}!", {test: 1}), "test string 1");
  if (fcf.pattern("@{args.value}@", {args:{value: 1}}, {result: "auto"}) !== 1) {
    a_unitest.error("Faild result type");
  }
  if (fcf.pattern("@{true}@", {args:{value: 1}}, {result: "auto"}) !== true) {
    a_unitest.error("Faild result type");
  }
  //a_unitest.equal(fcf.pattern("\\@{args.value1}@", {args:{value1: 1}}), "@{args.value1}@");
  a_unitest.equal(fcf.pattern("@{args.value1}", {args:{value1: 1}}), "@{args.value1}");
  a_unitest.equal(fcf.pattern({v: { data: "@{args}@"}}, {args:{value1: 1}}, {result: "auto"}), {v: { data: {value1: 1}}});
  a_unitest.equal(fcf.pattern("{args.value1}@", {args:{value1: 1}}), "{args.value1}@");
  a_unitest.equal(fcf.pattern("_{args.value1}@", {args:{value1: 1}}), "_{args.value1}@");
  a_unitest.equal(fcf.pattern("@{args.value1}@", {args:{value1: 1}}), 1);
  a_unitest.equal(fcf.pattern("_@{args.value1}@", {args:{value1: 1}}), "_1");
  a_unitest.equal(fcf.pattern("@{args.value1}@_", {args:{value1: 1}}), "1_");
  a_unitest.equal(fcf.pattern("_@{args.value1}@@{args.value2}@", {args:{value1: 1, value2: 2}}), "_12");
  a_unitest.equal(fcf.pattern("_@{args.value1}@_@{args.value2}@", {args:{value1: 1, value2: 2}}), "_1_2");
  a_unitest.equal(fcf.pattern("_@{args.value1}@_@{args.value2}@_", {args:{value1: 1, value2: 2}}), "_1_2_");
  a_unitest.equal(fcf.pattern("_!{test strin asda}!_@{args.value2}@_", {args:{value1: 1, value2: 2}}), "_test strin asda_2_");
  a_unitest.equal(fcf.pattern("_!{test strin asda}!_!{2}!_", {args:{value1: 1, value2: 2}}), "_test strin asda_2_");
  a_unitest.equal(fcf.pattern("_!{test strin asda}!!{2}!_", {args:{value1: 1, value2: 2}}), "_test strin asda2_");
  a_unitest.equal(fcf.pattern("_!{{test}}!!{2}!_"), "_!{{test}}!2_");
  a_unitest.equal(fcf.pattern("_!{test"), "_!{test");
  a_unitest.equal(fcf.pattern("_@{{test}}@@{value1}@_", {value1: 1}), "_@{{test}}@1_");
  a_unitest.equal(fcf.pattern("_a{{test}}a@{value1}@_", {value1: 1}), "_a{{test}}a1_");
  a_unitest.equal(fcf.tokenize("@{{'0'}}@1@{{test.value}}@2", {value1: 1}, {quiet: true}), "01@{{test.value}}@2");
  a_unitest.equal(fcf.tokenize("@{{'0'}}@1!{{|Test @{{test.value}}@|}}!2", {value1: 1}, {quiet: true}), "01|Test @{{test.value}}@|2");


  a_unitest.equal(fcf.tokenize("@{{new fcf.RouteInfo(url).referer}}@", {url: "http://sole.test/1?data=1"}), "http://sole.test/1");

  fcf.getContext().language = "ja";
  a_unitest.equal(fcf.tokenize("!{{test value: @{{value}}@}}!", {value: 1}), "テスト値: 1");
  a_unitest.equal(fcf.pattern("!{test value: @{value}@}!", {value: 1}), "テスト値: 1");
  fcf.getContext().language = "en";

  a_unitest.equal(fcf.tokenize("test value: @{{cont.value}}@: value1: 1", {value1: 1}, {quiet: true}), "test value: @{{cont.value}}@: value1: 1");
});
