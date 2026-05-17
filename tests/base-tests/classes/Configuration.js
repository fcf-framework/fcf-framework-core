fcf.test("Class fcf.Configuration", async (a_unitest) => {


  // {
  //   let configuration = new fcf.Configuration();
  //   configuration.append({value1: 1});
  //   configuration.appendPackage({value1: 10, value2: 20});
  //   console.log("value1:", configuration.value1);
  //   console.log("value2:", configuration.value2);
  //
  //
  //   // let configuration = new fcf.Configuration();
  //   //
  //   // configuration.on("update_after", (a_event)=>{
  //   //   console.log(a_event.object);
  //   // });
  //   //
  //   // configuration.append({number: "1"});
  // }

  {
    let configuration = new fcf.Configuration();

    configuration.on("update_before", (a_event)=>{
      if ("number" in a_event.object) {
        a_event.object.number = parseInt(a_event.object.number);
        if (isNaN(a_event.object.number)) {
          throw new Error("Incorrect type");
        }
      }
    });

    configuration.append({number: "1"});
    a_unitest.equal(configuration.number, 1);
    a_unitest.equal(typeof configuration.number, "number");
    //console.log("value:", configuration.number, "; type: ", typeof configuration.number);
  }

  {
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});

    (fcf.isServer() ? global : window).mergeFunctions = {
      param: (a_current, a_source) => {
        return fcf.append(a_current, a_source);
      },
      subarray: (a_current, a_source) => {
        return fcf.append(a_current, a_source);
      }
    };

    configuration.append({
      merge: {
        "param": "mergeFunctions.param",
        "param.subarray": "mergeFunctions.subarray",
      },
      param: {
        value1: 1,
        subarray: [1],
      }
    });

    // console.log("Step 1: ", configuration.param);

    configuration.append({
      param: {
        value2: 2,
        subarray: [2],
      }
    });

    // console.log("Step 2: ", configuration.param);

    a_unitest.equal(configuration.param, { value1: 1, subarray: [ 1, 2 ], value2: 2 });

  }

  {
    let configuration = new fcf.Configuration({enableDefaultParams: true, mergeParamNames: ["merge"]});
    configuration.append({
      merge: {
        "packages.test1.array1": "fcf.append",
        "packages.test1.array3": {function: "fcf.NTest.mergeAppend", file: ":base-tests/classes/ConfigurationMergeFunctions.js"},
      },
      packages:{
        "test1": {
          field1: "value1",
          array1:  [1,2,3],
          array2:  [1,2,3],
          array3:  [1,2,3],
        },
        "test2": {
          field1: "value1",
        }
      }
    });
    configuration.append({
      packages:{
        "test1": {
          field1: "value1",
          field2: "value2",
          array1:  [4,5,6],
          array2:  [4,5,6],
          array3:  [4,5,6],
        },
        "test2": {
        },
        "test3": {
          field1: "value1",
        },
      }
    });
    a_unitest.equal(configuration.packages,
      {
        "test1" : {
          "field1" : "value1",
          "field2" : "value2",
          "array1"  : [1,2,3,4,5,6],
          "array2"  : [4,5,6],
          "array3"  : [1,2,3,4,5,6],

        },
        "test2" : {
          "field1" : "value1"
        },
        "test3" : {
          "field1" : "value1"
        }
      }
    );
  }

  {
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    let e = configuration.on("update_item_before:value", (a_event)=>{
      a_unitest.equal(a_event.object.level, a_event.level);
      a_event.object.value = 111;
    })

    configuration.append({value: 1, level: 2});
    a_unitest.equal(configuration.value, 111);
  }
  {
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    let e = configuration.on("update_item_before:value", (a_event)=>{
      a_unitest.equal(a_event.object.level, a_event.level);
      a_event.object.value = 111;
    })

    configuration.appendPackage({value: 1, level: 1});
    a_unitest.equal(configuration.value, 111);
  }
  {
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    let e = configuration.on("update_item_before:value", (a_event)=>{
      a_unitest.equal(a_event.object.level, a_event.level);
    })
    configuration.appendPackage({value: 1, level: 1});
    a_unitest.equal(configuration.value, 1)
    configuration.append({value: 2, level: 2});
    a_unitest.equal(configuration.value, 2)
    configuration.appendPackage({value: 3, level: 1});
    a_unitest.equal(configuration.value, 2)
  }
  {
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    let e = configuration.on("update_item_before:value", (a_event)=>{
      a_unitest.equal(a_event.object.level, a_event.level);
      a_event.object.value = 111;
    })

    configuration.appendDefault({value: 1, level: 0});
    a_unitest.equal(configuration.value, 111)
  }
  {
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    let e = configuration.on("update_item_before:value", (a_event)=>{
      a_unitest.equal(a_event.object.level, a_event.level);
    })
    configuration.appendDefault({value: 1, level: 0});
    a_unitest.equal(configuration.value, 1)
    configuration.appendPackage({value: 2, level: 1});
    a_unitest.equal(configuration.value, 2)
    configuration.appendDefault({value: 3, level: 0});
    a_unitest.equal(configuration.value, 2)
    configuration.append({value: 4, level: 2});
    a_unitest.equal(configuration.value, 4)
  }
  {
    let eevent = 0;
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    let e = configuration.on("update_item_before:object.value1", (a_event)=>{
      ++eevent;
    })
    configuration.append({object: {}});
    a_unitest.equal(eevent, 0);
    configuration.append(
      {
        object: {
          value1: 1
        },
        merge: {
          "object": "fcf.append",
        }
      });
    a_unitest.equal(eevent, 1);
    a_unitest.equal(configuration.object, { value1: 1 });
    configuration.append({object: {value2: 1}});
    a_unitest.equal(eevent, 1);
    a_unitest.equal(configuration.object, { value1: 1, value2: 1 });
    configuration.append({object: {value1: 2}});
    a_unitest.equal(eevent, 2);
    a_unitest.equal(configuration.object, { value1: 2, value2: 1 });
    configuration.append({object: {value1: 2}});
    a_unitest.equal(eevent, 3);
    a_unitest.equal(configuration.object, { value1: 2, value2: 1 });
  }

  {
    let eevent = 0;
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    let e = configuration.on("update_item_before:object.value1:value", (a_event)=>{
      ++eevent;
    })
    configuration.append({object: {}});
    a_unitest.equal(eevent, 0);
    configuration.append(
      {
        object: {
          value1: 1
        },
        merge: {
          "object": "fcf.append",
        }
      });
    a_unitest.equal(eevent, 1);
    a_unitest.equal(configuration.object, { value1: 1 });
    configuration.append({object: {value1: 2}});
    a_unitest.equal(eevent, 2);
    a_unitest.equal(configuration.object, { value1: 2 });
    configuration.append({value: 1});
    a_unitest.equal(eevent, 3);
    a_unitest.equal(configuration.value, 1);
    configuration.append({value: 2, object: {value1: 3}});
    a_unitest.equal(eevent, 4);
    a_unitest.equal(configuration.value, 2);
    a_unitest.equal(configuration.object, { value1: 3 });
    configuration.append({value2: 2});
    a_unitest.equal(eevent, 4);
    a_unitest.equal(configuration.value, 2);
    a_unitest.equal(configuration.object, { value1: 3 });
  }
  {
    let eevent = 0;
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    let e = configuration.on("update_item:object.value1:value", (a_event)=>{
      ++eevent;
    })
    configuration.append({object: {}});
    a_unitest.equal(eevent, 0);
    configuration.append(
      {
        object: {
          value1: 1
        },
        merge: {
          "object": "fcf.append",
        }
      });
    a_unitest.equal(eevent, 1);
    a_unitest.equal(configuration.object, { value1: 1 });
    configuration.append({object: {value1: 2}});
    a_unitest.equal(eevent, 2);
    a_unitest.equal(configuration.object, { value1: 2 });
    configuration.append({value: 1});
    a_unitest.equal(eevent, 3);
    a_unitest.equal(configuration.value, 1);
    configuration.append({value: 2, object: {value1: 3}});
    a_unitest.equal(eevent, 4);
    a_unitest.equal(configuration.value, 2);
    a_unitest.equal(configuration.object, { value1: 3 });
    configuration.append({value2: 2});
    a_unitest.equal(eevent, 4);
    a_unitest.equal(configuration.value, 2);
    a_unitest.equal(configuration.object, { value1: 3 });
  }
  {
    let eevent = 0;
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    let e = configuration.on("update_item_after:object.value1:value", (a_event)=>{
      ++eevent;
    })
    configuration.append({object: {}});
    a_unitest.equal(eevent, 0);
    configuration.append(
      {
        object: {
          value1: 1
        },
        merge: {
          "object": "fcf.append",
        }
      });
    a_unitest.equal(eevent, 1);
    a_unitest.equal(configuration.object, { value1: 1 });
    configuration.append({object: {value1: 2}});
    a_unitest.equal(eevent, 2);
    a_unitest.equal(configuration.object, { value1: 2 });
    configuration.append({value: 1});
    a_unitest.equal(eevent, 3);
    a_unitest.equal(configuration.value, 1);
    configuration.append({value: 2, object: {value1: 3}});
    a_unitest.equal(eevent, 4);
    a_unitest.equal(configuration.value, 2);
    a_unitest.equal(configuration.object, { value1: 3 });
    configuration.append({value2: 2});
    a_unitest.equal(eevent, 4);
    a_unitest.equal(configuration.value, 2);
    a_unitest.equal(configuration.object, { value1: 3 });
  }
  {
    let eevent = 0;
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    let e = configuration.on("update_item:object.value1:value", (a_event)=>{
      a_unitest.equal(a_event.object.value, 1);
      a_unitest.equal(a_event.configuration.value, undefined);
      a_unitest.equal(a_event.newConfiguration.value, 1);
      ++eevent;
    })
    configuration.append({value: 1});
    a_unitest.equal(configuration.value, 1);
    a_unitest.equal(eevent, 1);
  }
  {
    let eevent = 0;
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    let e = configuration.on("update_item_after:object.value1:value", (a_event)=>{
      a_unitest.equal(a_event.object.value, 1);
      a_unitest.equal(a_event.configuration.value, 1);
      ++eevent;
    })
    configuration.append({value: 1});
    a_unitest.equal(configuration.value, 1);
    a_unitest.equal(eevent, 1);
    configuration.append({value: 1});
    a_unitest.equal(configuration.value, 1);
    a_unitest.equal(eevent, 2);
  }

  {
    let eevent = 0;
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    let e = configuration.on("change_item:object.value1:value", (a_event)=>{
      a_unitest.equal(a_event.object.value, 1);
      a_unitest.equal(a_event.newConfiguration.value, 1);
      ++eevent;
    })
    configuration.append({value: 1});
    a_unitest.equal(configuration.value, 1);
    a_unitest.equal(eevent, 1);
    configuration.append({value: 1});
    a_unitest.equal(configuration.value, 1);
    a_unitest.equal(eevent, 1);
  }
  {
    let eevent = 0;
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    let e = configuration.on("change_item_after:value", (a_event)=>{
      a_unitest.equal(a_event.object.value, 1);
      a_unitest.equal(a_event.configuration.value, 1);
      ++eevent;
    })
    configuration.append({value: 1});
    a_unitest.equal(configuration.value, 1);
    a_unitest.equal(eevent, 1);
    configuration.append({value: 1});
    a_unitest.equal(configuration.value, 1);
    a_unitest.equal(eevent, 1);
  }

  {
    let counter = 0;
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    configuration.on("change_item_after:value", (a_event)=>{
      ++counter;
      let e = new Error("E");
      e.test = 1;
      throw e;
    });
    configuration.on("change_item_after:value", (a_event)=>{
      ++counter;
    });
    let error;
    try {
      configuration.append({value: 1}).exception();
    } catch(e){
      error = e;
    }
    a_unitest.equal(counter, 2);
    a_unitest.equal(error.test, 1);
  }
  {
    let counter = 0;
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    configuration.on("update_after", (a_event)=>{
      ++counter;
      let e = new Error("E");
      e.test = 1;
      throw e;
    });
    configuration.on("update_after", (a_event)=>{
      ++counter;
    });
    let error;
    try {
      configuration.append({value: 1}).exception();
    } catch(e){
      error = e;
    }
    a_unitest.equal(counter, 2);
    a_unitest.equal(error.test, 1);
  }
  // {
  //   let configuration = new fcf.Configuration();
  //   let e = configuration.on("change_after:value1:object.value", (a_event)=>{
  //     console.log(a_event.paths);
  //   })
  //
  //   configuration.append({value3: 1, object: {value: 1}});
  //
  //   //configuration.detach(e);
  //
  //   configuration.append({value1: 2});
  // }


});
