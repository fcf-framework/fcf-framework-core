
fcf.test("Function fcf.type", (a_unitest)=>{
  {
    let type  = fcf.type("number");
    let value = fcf.build(type, 1);
    a_unitest.equal(value, 1, true);
  }
  {
    let type  = fcf.type("number");
    let error = false;
    try {
      let value = fcf.build(type, "1");
    } catch(e){
      error = true;
    }
    a_unitest.equal(error, true);
  }
  {
    let type  = fcf.type(["boolean", "number"]);
    let value = fcf.build(type, 1);
    a_unitest.equal(value, 1, true);
  }
  {
    let type  = fcf.type(["number", "boolean"]);
    let value = fcf.build(type, 1);
    a_unitest.equal(value, 1, true);
  }
  {
    let type  = fcf.type(["number", "boolean"]);
    let error = false;
    try {
      let value = fcf.build(type, "1");
    } catch(e){
      error = true;
    }
    a_unitest.equal(error, true);
  }
  {
    let type  = fcf.type("number", {min: 10});
    let error = false;
    try {
      let value = fcf.build(type, 1);
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }
  {
    let type  = fcf.type("number", {max: 10});
    let error = false;
    try {
      let value = fcf.build(type, 11);
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }
  {
    let type  = fcf.type("object", { fields: {
                      "number": fcf.type("number", {min: 10})
                    }});
    let error = false;
    try {
      let value = fcf.build(type, { number: 9 });
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }
  {
    let type  = fcf.type({ type: fcf.NUMBER });
    let value = fcf.build(type, 1);
    a_unitest.equal(value, 1, true);
  }
  {
    let type  = fcf.type({ type: fcf.NUMBER, min: 0 });
    let value = fcf.build(type, 1);
    a_unitest.equal(value, 1, true);
  }



  {
    let type = fcf.type("string", {length: 1});
    let error = false;
    try {
      let value = fcf.build(type, "11111");
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }
  {
    let type  = fcf.type("object", { fields: {
                      "str": fcf.type("string", {minLength: 10})
                    }});
    let error = false;
    try {
      let value = fcf.build(type, { str: "11111111" });
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }
  {
    let type  = fcf.type("object", { fields: {
                      "str": fcf.type("string", {maxLength: 3})
                    }});
    let error = false;
    try {
      let value = fcf.build(type, { str: "1181" });
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }



  {
    let type  = fcf.type("number", { default: 3 });
    let value = fcf.build(type, "false");
    a_unitest.equal(value, 3, true);
  }
  {
    let type  = fcf.type("number", { default: 3 });
    let value = fcf.build(type, 1);
    a_unitest.equal(value, 1, true);
  }
  {
    let type  = fcf.type(["number", "string"], { default: 3 });
    let value = fcf.build(type, false);
    a_unitest.equal(value, 3, true);
  }
  {
    let type  = fcf.type(["number", "string"], { default: 3 });
    let value = fcf.build(type, "test");
    a_unitest.equal(value, "test", true);
  }

  {
    let type = fcf.type("object",
      {
        require: true,
        fields: {
          "field1": "string",
          "field2": fcf.type("number"),
        },
      }
    );
    let value = fcf.build(type, { field1: "first", field2: 2 });
    a_unitest.equal(value, {field1: "first", field2: 2});
  }

  {
    let type = fcf.type("object",
      {
        require: true,
        fields: {
          "field1": "string",
          "field2": "number",
          "field3": fcf.type("object", { fields: {
              "subfield1": fcf.type("string"),
            },
          }),
        },
      }
    );
    let value = fcf.build(type, { field1: "first", field2: 2, field3: { subfield1: "test"  } });
    a_unitest.equal(value, {field1: "first", field2: 2, field3: { subfield1: "test" } });
  }
  
  {
    let type = fcf.type("object",
      {
        require: true,
        fields: {
          "field1": "string",
          "field2": fcf.type("number", {default: undefined}),
          "field3": fcf.type("object", { fields: {
              "subfield1": "string",
            },
          }),
        },
      }
    );
    let value = fcf.build(type, { field1: "first", field2: "1", field3: { subfield1: "test"  } });
    a_unitest.equal(value, {field1: "first", field2: undefined, field3: { subfield1: "test" } });
  }

  {
    let type = fcf.type("object",
      {
        require: true,
        undeclared: false,
        fields: {
          "field1": "string",
          "field2": "number",
        },
      }
    );
    let error = false;
    try {
      let value = fcf.build(type, { field1: "first", field2: 2, field3: 3  });
    } catch(e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }

  {
    let type = fcf.type("object",
      {
        require: true,
        fields: {
          "field1": "string",
          "field2": "number",
          "field3": fcf.type("object", { require: true, undeclared: false, fields: {
              "subfield1": "string",
            },
          }),
        },
      }
    );
    let error = false;
    try {
      let value = fcf.build(type, { field1: "first", field2: 2, field3: { subfield1: "test", subfield2: "1"  } });
    } catch(e){
      error = true;
    }
    a_unitest.equal(error, true);
  }

  {
    let type = fcf.type("object",
      {
        require: true,
        fields: {
          "field1": "string",
          "field2": "number",
        },
        undeclared: fcf.ANY,
      }
    );
    let value = fcf.build(type, { field1: "first", field2: 2, field3: true });
    a_unitest.equal(value, { field1: "first", field2: 2, field3: true });
  }

  {
    let type = fcf.type("object",
      {
        require: true,
        fields: {
          "field1": "string",
          "field2": "number",
        },
        undeclared: true,
      }
    );
    let value = fcf.build(type, { field1: "first", field2: 2, field3: true });
    a_unitest.equal(value, { field1: "first", field2: 2, field3: true });
  }

  {
    let type = fcf.type("object",
      {
        require: true,
        fields: {
          "field1": "string",
          "field2": "number",
        },
        undeclared: "boolean"
      }
    );
    let value = fcf.build(type, { field1: "first", field2: 2, field3: true });
    a_unitest.equal(value, { field1: "first", field2: 2, field3: true });
  }

  {
    let type = fcf.type("object",
      {
        require: true,
        fields: {
          "field1": fcf.type("string", { require: true }),
          "field2": fcf.type("number", { require: true }),
        },
        undeclared: fcf.type("number", { default: undefined} )
      }
    );
    let value = fcf.build(type, { field1: "first", field2: 2, field3: true });
    a_unitest.equal(value, { field1: "first", field2: 2});
  }

  {
    let type = fcf.type("object",
      {
        require: true,
        fields: {
          "field1": fcf.type("string"),
          "field2": "number",
        },
        undeclared: "number",
      }
    );
    let error = false;
    try {
      let value = fcf.build(type, { field1: "first", field2: 2, field3: true });
    } catch(e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }

  {
    let type = fcf.type("array", {item: "number"});
    let value = fcf.build(type, [1,2,3]);
    a_unitest.equal(value, [1,2,3]);
  }
  {
    let type = fcf.type("array", {item: fcf.type("number", { default: undefined})});
    let value = fcf.build(type, [1,2, undefined, false, "asd", 3]);
    a_unitest.equal(value, [1,2, undefined, undefined, undefined, 3], true);
  }
  {
    let type = fcf.type("array", {item: fcf.type("number", {default: 1}) });
    let value = fcf.build(type, [1,2, undefined, false, "asd", 3]);
    a_unitest.equal(value, [1, 2, 1, 1, 1, 3], true);
  }
  {
    let type = fcf.type("array", {item: fcf.type("number", { default: 1 }) });
    let value = fcf.build(type, [1,2, undefined, false, "asd", 3]);
    a_unitest.equal(value, [1, 2, 1, 1, 1, 3], true);
  }
  {
    let type = fcf.type("array", {item: "number" });
    let error = false;
    try {
     let value = fcf.build(type, [1, "string", 3]);
    } catch(e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }
  
  {
    let type = fcf.type("iterable", {item: "number"});
    let value = fcf.build(type, [1,2,3]);
    a_unitest.equal(value, [1,2,3]);
  }

  {
    let type = fcf.type("array", {item: "iterable"});
    let value = fcf.build(type, [[1]]);
    a_unitest.equal(value, [[1]]);
  }
  {
    let type = fcf.type("iterable", {item: "number" });
    let error = false;
    try {
     let value = fcf.build(type, [1, "string", 3]);
    } catch(e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }
  {
    let type = fcf.type("iterable", {item: fcf.type("number", {default: 1}) });
    let error = false;
    try {
     let value = fcf.build(type, [1, "string", 3]);
    } catch(e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }


  {
    let type = fcf.type("numbered", {item: "number"});
    let value = fcf.build(type, [1,2,3]);
    a_unitest.equal(value, [1,2,3]);
  }
  {
    let type = fcf.type("numbered", {item: "number"});
    let error = false;
    try {
      let value = fcf.build(type, {});
    } catch (e){
      error = true
    }
    a_unitest.equal(error, true);
  }
  {
    let type = fcf.type("numbered", {item: fcf.type("number", { default: undefined})});
    let value = fcf.build(type, [1,2, undefined, false, "asd", 3]);
    a_unitest.equal(value, [1,2, undefined, undefined, undefined, 3], true);
  }
  {
    let type = fcf.type("numbered", {item: fcf.type("number", {default: 1}) });
    let value = fcf.build(type, [1,2, undefined, false, "asd", 3]);
    a_unitest.equal(value, [1, 2, 1, 1, 1, 3], true);
  }
  {
    let type = fcf.type("numbered", {item: fcf.type("number", { default: 1 }) });
    let value = fcf.build(type, [1,2, undefined, false, "asd", 3]);
    a_unitest.equal(value, [1, 2, 1, 1, 1, 3], true);
  }
  {
    let type = fcf.type("numbered", {item: "number" });
    let error = false;
    try {
     let value = fcf.build(type, [1, "string", 3]);
    } catch(e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }


  {
    let type  = fcf.type("enum", {items: ["on", "off"]});
    let value = fcf.build(type, "on");
    a_unitest.equal(value, "on", true);
  }
  {
    let type  = fcf.type("enum", {items: ["on", "off"]});
    let value = fcf.build(type, "off");
    a_unitest.equal(value, "off", true);
  }
  {
    let type  = fcf.type("enum", {items: [1,2,3]});
    let value = fcf.build(type, 1);
    a_unitest.equal(value, 1, true);
  }
  {
    let type  = fcf.type([fcf.type("enum", {items: [1,2,3]}), "boolean"]);
    let value = fcf.build(type, true);
    a_unitest.equal(value, true, true);
  }
  {
    let type  = fcf.type([fcf.type("enum", {items: [1,2,3]}), "boolean"]);
    let value = fcf.build(type, 1);
    a_unitest.equal(value, 1, true);
  }

  {
    let type  = fcf.type("set", {items: ["first", "second", "third"]});
    let value = fcf.build(type, "first|second");
    a_unitest.equal(value, ["first", "second"]);
  }
  {
    let type  = fcf.type("set", {items: ["first", "second", "third"]});
    let value = fcf.build(type, "");
    a_unitest.equal(value, []);
  }
  {
    let type  = fcf.type("set", {items: ["first", "second", "third", ""]});
    let value = fcf.build(type, "|");
    a_unitest.equal(value, [""]);
  }







});





