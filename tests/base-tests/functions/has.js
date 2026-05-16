fcf.test("Function fcf.has", (a_unitest)=>{
  // console.warn(`Is "k1" in {k1: 1}:         `, fcf.has({k1: 1}, "k1"))
  // console.warn(`Is "k2" in {k1: 1}:         `, fcf.has({k1: 1}, "k2"))
  // console.warn(`Is 0 in [1]:                `, fcf.has([1], 0))
  // console.warn(`Is 1 in [1]:                `, fcf.has([1], 1))
  // {
  //   let map = new Map()
  //   map.set("k1", "v1");
  //   console.warn(`Is "k1" in Map({k1: "v1"}): `, fcf.has(map, "k1"))
  //   console.warn(`Is "k2" in Map({k1: "v1"}): `, fcf.has(map, "k2"))
  // }
  // {
  //   let set = new Set()
  //   set.add("k1");
  //   console.warn(`Is "k1" in Set(["k1"]):     `, fcf.has(set, "k1"))
  //   console.warn(`Is "k2" in Set(["k1"]):     `, fcf.has(set, "k2"))
  // }

  a_unitest.equal(fcf.has({k1: 1}, "k1"), true);
  a_unitest.equal(fcf.has({k1: 1}, "k2"), false);
  a_unitest.equal(fcf.has([1], 0), true);
  a_unitest.equal(fcf.has([1], 1), false);
  {
    let map = new Map()
    map.set("k1", "v1");
    a_unitest.equal(fcf.has(map, "k1"), true);
    a_unitest.equal(fcf.has(map, "k2"), false);
  }
  {
    let set = new Set()
    set.add("k1");
    a_unitest.equal(fcf.has(set, "k1"), true);
    a_unitest.equal(fcf.has(set, "k2"), false);
  }
})
