fcf.test("Function fcf.compare", (a_unitest)=>{
  let d1 = fcf.parseDate("2023-01-01", "Y-m-d");
  let d2 = fcf.parseDate("2023-01-01", "Y-m-d");
  let d3 = fcf.parseDate("2023-01-02", "Y-m-d");
  let m1 = new Map();
  m1.set("k1", "v1");
  let m2 = new Map();
  m2.set("k1", "v1");
  let m3 = new Map();
  let s1 = new Set();
  s1.add("k1");
  let s2 = new Set();
  s2.add("k1");
  let s3 = new Set();

  a_unitest.equal(fcf.equal(false, "", true), false);
  a_unitest.equal(fcf.equal(false, "", false), true);
  a_unitest.equal(fcf.equal(true, "1", false), true);
  a_unitest.equal(fcf.equal(true, "1", true), false);
  a_unitest.equal(fcf.equal(1, "1", true), false);
  a_unitest.equal(fcf.equal(1, "1", false), true);
  a_unitest.equal(fcf.equal([1], ["1"], true), false);
  a_unitest.equal(fcf.equal([1], ["1"], false), true);
  a_unitest.equal(fcf.equal(d1, d2), true);
  a_unitest.equal(fcf.equal(d1, d3), false);
  a_unitest.equal(fcf.equal(d1, {}), false);
  a_unitest.equal(fcf.equal({}, d1), false);
  a_unitest.equal(fcf.equal({}, {}), true);
  a_unitest.equal(fcf.equal({}, {}), true);
  a_unitest.equal(fcf.equal({v:1}, {}), false);
  a_unitest.equal(fcf.equal({}, {v:1}), false);
  a_unitest.equal(fcf.equal(m1, m2), true);
  a_unitest.equal(fcf.equal(m1, m3), false);
  a_unitest.equal(fcf.equal(m3, m1), false);
  a_unitest.equal(fcf.equal(s1, s2), true);
  a_unitest.equal(fcf.equal(s1, s3), false);
  a_unitest.equal(fcf.equal(s3, s1), false);
  a_unitest.equal(fcf.equal(NaN, NaN), true);
  a_unitest.equal(fcf.equal(new Date("as"), new Date("as")), true);
  a_unitest.equal(fcf.equal(false, undefined), 0);
  a_unitest.equal(fcf.equal(false, undefined, true), false);
  a_unitest.equal(fcf.equal(false, 0, true), false);
  a_unitest.equal(fcf.equal(false, 0), true);
  a_unitest.equal(fcf.equal(" ", 0), true);
  a_unitest.equal(fcf.equal(" ", "0"), false);
  a_unitest.equal(fcf.equal(" ", "0"), false);
  a_unitest.equal(fcf.equal(false, " 0 "), true);
  a_unitest.equal(fcf.equal(false, " 0 ", true), false);
  {
    let map = new Map();
    map.set("k1", "v1");
    a_unitest.equal(fcf.equal(map, {k1: "v1"}), true);
    a_unitest.equal(fcf.equal({k1: "v1"}, map), true);
    a_unitest.equal(fcf.equal({k1: "v1"}, map, true), false);
    a_unitest.equal(fcf.equal(map, {k1: "v1"}, true), false);
  }

  a_unitest.equal(fcf.compare([""], [false]), 0);
  a_unitest.equal(fcf.compare([""], [false], true), 1);
  a_unitest.equal(fcf.compare(["1"], [true], true), 1);
  a_unitest.equal(fcf.compare(["1"], [true], false), 0);
  a_unitest.equal(fcf.compare([d1], [d2]), 0);
  a_unitest.equal(fcf.compare([d1], [d3]), -1);
  a_unitest.equal(fcf.compare([d3], [d1]), 1);
  a_unitest.equal(fcf.compare([1], ["1"]), 0);
  a_unitest.equal(fcf.compare([1], ["1"], true), -1);
  a_unitest.equal(fcf.compare([], ["1"]), -1);
  a_unitest.equal(fcf.compare(["1"], []), 1);
  a_unitest.equal(fcf.compare({value: 1}, {value: "2"}), -1);
  a_unitest.equal(fcf.compare({value: 1}, {value: "0"}), 1);
  a_unitest.equal(fcf.compare({value: 1}, {value: "1"}), 0);
  a_unitest.equal(fcf.compare({value: 1}, {value: "1"}, true), -1);
  a_unitest.equal(fcf.compare(m1, m2), 0);
  a_unitest.equal(fcf.compare(m1, m3), 1);
  a_unitest.equal(fcf.compare(m3, m1), -1);
  a_unitest.equal(fcf.compare(s1, s2), 0);
  a_unitest.equal(fcf.compare(s1, s3), 1);
  a_unitest.equal(fcf.compare(s3, s1), -1);
  a_unitest.equal(fcf.compare(new Date("2021"), new Date("2022")), -1);
  a_unitest.equal(fcf.compare(new Date("2022"), new Date("2021")), 1);
  a_unitest.equal(fcf.compare(NaN, NaN), 0);
  a_unitest.equal(fcf.compare(new Date("as"), new Date("as")), 0);
  a_unitest.equal(fcf.compare(false, undefined), 0);
  a_unitest.equal(fcf.compare(false, undefined, true), 1);
  a_unitest.equal(fcf.compare(false, 0, true), -1);
  a_unitest.equal(fcf.compare(false, 0), 0);
  a_unitest.equal(fcf.compare(" ", 0), 0);
  a_unitest.equal(fcf.compare(" ", "0"), -1);
  a_unitest.equal(fcf.compare(false, " 0 "), 0);
  a_unitest.equal(fcf.compare(false, " 0 ", true), -1);

  {
    let map = new Map();
    map.set("k1", "v1");
    a_unitest.equal(fcf.compare(map, {k1: "v1"}), 0);
    a_unitest.equal(fcf.compare({k1: "v1"}, map), 0);
    a_unitest.equal(fcf.compare({k1: "v1"}, map, true), 1);
    a_unitest.equal(fcf.compare(map, {k1: "v1"}, true), -1);
  }

})
