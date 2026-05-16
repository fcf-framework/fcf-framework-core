fcf.test("Function fcf.prepare", (a_unitest)=>{
  {
    let object    = {}
    let subobject = fcf.prepare(object, "field1[[field2]]");
    a_unitest.equal(object, { field1: { field2: [] } });
    a_unitest.equal(subobject, []);
    // console.log("Object:    ", object);
    // console.log("Subobject: ", subobject);
  }
  // console.log("");
  {
    let object    = {
      field1: {
        field2: { value: "value" }
      }
    };
    let subobject = fcf.prepare(object, "field1.field2");
    a_unitest.equal(object, { field1: { field2: { value: 'value' } } });
    a_unitest.equal(subobject, { value: 'value' });
    // console.log("Object:    ", object);
    // console.log("Subobject: ", subobject);
  }
});
