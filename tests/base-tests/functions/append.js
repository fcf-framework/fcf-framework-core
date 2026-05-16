fcf.test("Function fcf.append", (a_unitest)=>{
  // // Non-recursive mode
  // {
  //   let dest = {"k1": "v1"};
  //   let source = {"k2": "v2"};
  //   fcf.append(dest, source);
  //   console.log(dest);
  // }
  // console.log("");
  // {
  //   let dest = [1];
  //   let source = [2];
  //   fcf.append(dest, source);
  //   console.log(dest);
  // }
  // console.log("");
  // {
  //   let dest = new Map();
  //   let source = {"k2": "v2"};
  //   fcf.append(dest, source);
  //   console.log(dest);
  // }
  // console.log("");
  // {
  //   let dest = new Set();
  //   dest.add("k1")
  //   let source = ["k2"];
  //   fcf.append(dest, source);
  //   console.log(dest);
  // }

  // recursive mode

  // {
  //   let dest = {
  //     o: {
  //       "k1": "v1"
  //     }
  //   };
  //   let source = {
  //     o: {
  //       "new_key": "new_value"
  //     }
  //   };
  //   fcf.append(true, dest, source);
  //   console.log(`dest:                `, dest);
  //   console.log(`dest.o === source.o: `, dest.o === source.o);
  // }

  // let source = {
  //   array: [1,2,3,4,5, {k1: {}, k2: 1}, [{},1]],
  //   object: {k1: {}, k2: 1},
  // };
  // let size = 10000;
  // let start = Date.now();
  // for(let i = 0; i < size; ++i) {
  //   fcf.append(true, {}, source);
  // }
  // console.warn((Date.now() - start) / size);

  class T1 {
  };
  {
    let o = {
      o1: {
        k1: "v1",
        o1: { k1_1: "v1_1" },
        d1: new Date("2021"),
        i1: 1,
        m1: new Map(),
        s1: new Set(),
        t1: new T1(),
      },
    }
    o.o1.m1.set("k1", "v1");
    o.o1.m1.set("k2", {k1: "v1"});
    o.o1.s1.add("k1");
    o.o1.s1.add("k2");
    o.o1.t1["k1"] = "v1";
    let r = fcf.append(true, {}, o);
    a_unitest.equal(r, o);
    a_unitest.equal(r.o1 !== o.o1, true);
    a_unitest.equal(r.o1.o1 !== o.o1.o1, true);
    a_unitest.equal(r.o1.m1 !== o.o1.m1, true);
    a_unitest.equal(r.o1.s1 !== o.o1.s1, true);
    a_unitest.equal(r.o1.t1 instanceof T1, true);
    a_unitest.equal(r.o1.t1 !== o.o1.t1, true);
  }
  {
    let dest = {
      o: {
        "k1": "v1"
      }
    };
    let source = {
      o: {
        "k2": "v2"
      }
    };
    fcf.append(true, dest, source);
    a_unitest.equal(
      dest,
      {
        o: {
          "k2": "v2"
        }
      }
    );
  }
  {
    let o = {
      k1: "v1",
      o1: { k1_1: "v1_1" },
      d1: new Date("2021"),
      i1: 1,
      m1: new Map(),
      s1: new Set(),
    }
    o.m1.set("k1", "v1");
    o.m1.set("k2", {k1: "v1"});
    o.s1.add("k1");
    o.s1.add("k2");
    let r = fcf.append({}, o);
    a_unitest.equal(r, o);
    a_unitest.equal(r.o1 === o.o1, true);
    a_unitest.equal(r.m1 === o.m1, true);
    a_unitest.equal(r.s1 === o.s1, true);
  }
  {
    let m1 = new Map();
    m1.set("k1", "v1");
    let m2 = new Map();
    m2.set("k2", "v2");
    fcf.append(m1, m2);
    a_unitest.equal(m1, {k1: "v1", k2: "v2"});
  }
  {
    let s1 = new Set();
    s1.add("k1");
    let s2 = new Set();
    s2.add("k2");
    fcf.append(s1, s2);
    a_unitest.equal(s1, {"k1": "k1", "k2": "k2"});
  }
  {
    let source = {
      constructor: "123",
    };
    a_unitest.equal(fcf.append(true, {}, source), {constructor: "123"});
    a_unitest.equal(fcf.append({}, source), {constructor: "123"});
  }
  {
    let source = {
      constructor: {
        constructor: "123",
      },
    };
    a_unitest.equal(fcf.append(true, {}, source), { constructor: { constructor: "123",} } );
    //a_unitest.equal(fcf.append({}, source), { constructor: { constructor: "123",} } );
  }

});
