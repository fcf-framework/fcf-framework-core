fcf.test("Function fcf.resolve", (a_unitest) => {
  {
    let object = {
      field1: {
        field2: "value",
      }
    }
    let value = fcf.resolve(object, "field1.field2");
    a_unitest.equal(value, "value");
    //console.log(value);
  }



  // {
  //   let object = {
  //     field1: {
  //       field2: "value",
  //     }
  //   }
  //   let ref = fcf.resolveEx(object, "field1.field2");
  //   a_unitest.equal(ref.object[ref.key], "value");
  //   //console.log(ref.object[ref.key]);
  // }
  {
    let object = {}
    let ref = fcf.resolveEx(object, "field1.field2", true);
    a_unitest.equal(ref, { key: 'field2', object: {} })
    // console.log("Reference:", ref);
    // console.log("Source:", object);
  }
  // console.log("");
  // console.log("Creating an array");
  {
    let object = {}
    let ref = fcf.resolveEx(object, "[[field1]].field2", true);
    a_unitest.equal(ref, { key: 'field2', object: [] })
    // console.log("Reference:", ref);
    // console.log("Source:", object);
  }

  {
    let object = { str: "132"};
    let ref = fcf.resolveEx(object, "str[0]");
    a_unitest.equal(ref.object, undefined)
  }

  {
    let object = { str: 1};
    let ref = fcf.resolveEx(object, "str[0]");
    a_unitest.equal(ref.object, undefined)
  }

  {
    let object = {str: ""};
    let ref = fcf.resolveEx(object, "str[[0]].value", true);
    a_unitest.equal(ref.object, []);
  }

  {
    let object = {str: 1};
    let ref = fcf.resolveEx(object, "str[[0]].value", true);
    a_unitest.equal(ref.object, []);
  }

  {
    let object = {};
    let ref = fcf.resolveEx(object, "str[[0]].value", true);
    a_unitest.equal(ref.object, []);
  }

  {
    let func = function () {};
    let object = {func: func};
    let ref = fcf.resolveEx(object, "func.object.value", true);
    a_unitest.equal(ref.object, {});
  }

  {
    let func = function () {};
    func.object = {value: 1};
    let object = {func: func};
    let ref = fcf.resolveEx(object, "func.object.value");
    a_unitest.equal(ref.object, {value: 1});
    a_unitest.equal(ref.key, "value");
  }
  {
    let func = function () {};
    func.object = {value: 1};
    let object = {func: func};
    let ref = fcf.resolveEx(object, "func.object.value2");
    a_unitest.equal(ref.object, {value: 1});
    a_unitest.equal(ref.key, "value2");
  }

  {
    let func = function () {};
    func.object = {value: 1};
    let object = {func: func};
    value = fcf.resolve(object, "func.object.value", true);
    a_unitest.equal(value, 1);
  }

  {
    let func = function () {};
    func.object = {value: 1};
    let object = {func: func};
    value = fcf.resolve(object, "func.object.value2", true);
    a_unitest.equal(value, undefined);
  }
  {
    let func = function () {};
    func.object = {value: 1};
    let object = {func: func};
    value = fcf.resolve(undefined, "func.object.value2", true);
    a_unitest.equal(value, undefined);
  }

});
