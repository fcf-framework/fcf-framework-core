fcf.test("Class fcf.EventEmitter", async (a_unitest)=>{
  {
    // class Test extends fcf.EventEmitter {
    // };
    // let testObject = new Test();
    //
    // function callback(a_event) {
    //   console.log(a_event)
    // }
    // testObject.on("call", callback);
    //
    // testObject.emit("call", {info: "value"});
    // testObject.detach(callback);
    // testObject.emit("call", {info: "value"});
    // testObject.emit("call", {info: "value"});
  }
  {
    class Test extends fcf.EventEmitter {
    };
    let obj = new Test();
    let arr = [];
    let cb1 = (a_arr)=>{
      a_arr.push(1);
    };
    obj.on("event", cb1);
    let cb2 = (a_arr)=>{
      a_arr.push(2);
    };
    obj.on("event", cb2);
    let cb3 = (a_arr)=>{
      a_arr.push(3);
    };
    obj.on("event", cb3);
    let data = obj.emit("event", arr).result();
    a_unitest.equal(data, [1,2,3]);
    a_unitest.equal(arr, [1,2,3]);

    obj.detach("event", cb2);
    arr = [];
    data = await obj.emit("event", arr);
    a_unitest.equal(data, [1,3]);
    a_unitest.equal(arr, [1,3]);

    obj.detach(cb1);
    arr = [];
    data = await obj.emit("event", arr);
    a_unitest.equal(data, [3]);
    a_unitest.equal(arr, [3]);
  }
});
