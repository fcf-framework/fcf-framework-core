fcf.test("Function fcf.parseObjectAddress", (a_unitest)=>{
  a_unitest.equal(fcf.parseObjectAddress("field1.field2.field3"),        ["field1", "field2", "field3"]);
  a_unitest.equal(fcf.parseObjectAddress("[f ield1].fie ld2.field3"),      ["f ield1", "fie ld2", "field3"]);
  a_unitest.equal(fcf.parseObjectAddress("[field1][\"field2\"].field3"), ["field1", "field2", "field3"]);
  a_unitest.equal(fcf.parseObjectAddress("[field1]['field2'].field3"), ["field1", "field2", "field3"]);
  a_unitest.equal(fcf.parseObjectAddress("[field1][ 'field2 \\' ' ].field3"), ["field1", "field2 ' ", "field3"]);
  a_unitest.equal(fcf.parseObjectAddress("[field1][ 'field2 \\\" ' ].field3"), ["field1", "field2 \" ", "field3"]);
  a_unitest.equal(fcf.parseObjectAddress(["field"]), ["field"]);
  a_unitest.equal(fcf.parseObjectAddress(["field"], true), [{part: "field", array: false}]);


  // {
  //   let result = fcf.parseObjectAddress("field1.field2");
  //   console.log(`"field1.field2":     `, result);
  // }
  // {
  //   let result = fcf.parseObjectAddress("field1[field2]");
  //   console.log(`"field1[field2]":    `, result);
  // }
  // {
  //   let result = fcf.parseObjectAddress("field1['field2']");
  //   console.log(`"field1['field2']":  `, result);
  // }
  // {
  //   let result = fcf.parseObjectAddress("field1['field2']", true);
  //   console.log(`"field1['field2']":  `, result);
  // }
  // {
  //   let result = fcf.parseObjectAddress("field1[['field2']]", true);
  //   console.log(`"field1[['field2']]":`, result);
  // }
});
