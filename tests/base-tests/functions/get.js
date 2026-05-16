fcf.test("Function fcf.get", (a_unitest)=>{
// console.warn(`"k1" from {k1: "v1"}:       `, fcf.get({k1: "v1"}, "k1"));
// console.warn(`0    from ["v1"]:           `, fcf.get(["v1"], 0));
// {
//   let map = new Map();
//   map.set("k1", "v1");
//   console.warn(`"k1" from Map({k1: "v1"}):  `, fcf.get(map, "k1"));
// }
// {
//   let set = new Set();
//   set.add("k1");
//   console.warn(`"k1" from Set(["k1"]):      `, fcf.get(set, "k1"));
// }

a_unitest.equal(fcf.get({k1: "v1"}, "k1"), "v1");
a_unitest.equal(fcf.get(["v1"], 0), "v1");
{
  let map = new Map();
  map.set("k1", "v1");
  a_unitest.equal(fcf.get(map, "k1"), "v1");
}
{
  let set = new Set();
  set.add("k1");
  a_unitest.equal(fcf.get(set, "k1"), "k1");
}

});
