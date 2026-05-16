fcf.test("Function fcf.normalizeObjectAddress", (a_unitest)=>{
  // {
  //   let size = 1000000;
  //
  //   let path = "field1.field2.field3";
  //   let result;
  //   let start = Date.now();
  //   for(let i = 0; i < size; ++i) {
  //     result = fcf.normalizeObjectAddress(path);
  //   }
  //   console.warn(result);
  //   console.warn((Date.now() - start) / size);
  // }

  {
    let address = fcf.normalizeObjectAddress("field1.field2");
    a_unitest.equal(address, '["field1"]["field2"]');
    //console.log(address)
  }
  {
    let address = fcf.normalizeObjectAddress("field1[field2]");
    a_unitest.equal(address, '["field1"]["field2"]');
    //console.log(address)
  }
  {
    let address = fcf.normalizeObjectAddress(["field1", "field2"]);
    a_unitest.equal(address, '["field1"]["field2"]');
    //console.log(address)
  }
  {
    let address = fcf.normalizeObjectAddress(["field1", {part: "field2", array: true}]);
    a_unitest.equal(address, '["field1"][["field2"]]');
    //console.log(address)
  }
});
