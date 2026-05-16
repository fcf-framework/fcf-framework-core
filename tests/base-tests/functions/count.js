fcf.test("Function fcf.count", (a_unitest)=>{
  // console.log(`[1,2,3]                   :`, fcf.count([1,2,3]));
  // console.log(`{"k1": "v1"}              :`, fcf.count({"k1": "v1"}));
  // {
  //   let map = new Map();
  //   map.set("k1", "v1");
  //   console.log(`Map({"k1": "v1"})         :`, fcf.count(map));
  // }
  // {
  //   let result = fcf.count([1,2,3,4],
  //                          (a_key,a_value) => { return a_value % 2 == 0; });
  //   console.log(`[1,2,3,4] if value%2 == 0 :`, result);
  // }

  a_unitest.equal(fcf.count([1,2,3]), 3);
  a_unitest.equal(fcf.count({"k1": "v1"}), 1);
  {
    let map = new Map();
    map.set("k1", "v1");
    a_unitest.equal(fcf.count(map), 1);
  }
  {
    let result = fcf.count([1,2,3,4],
                           (a_key,a_value) => { return a_value % 2 == 0; });
    a_unitest.equal(result, 2);
  }

});
