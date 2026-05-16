fcf.test("Function fcf.each", async (a_unitest)=>{

  // // For site 1
  // fcf.each({k1: "v1", k2: "v2", k3: "v3"}, (a_key, a_value)=>{
  //   console.log("key:", a_key, "value:", a_value);
  // });

  // // For site (async mode)
  // console.log("Async function (with Promise):");
  // await fcf.each({k1: "v1", k2: "v2", k3: "v3"}, async (a_key, a_value)=>{
  //   await new Promise((a_resolve, a_reject)=>{
  //     setTimeout(()=>{
  //       console.log(new Date(), "key:", a_key, "value:", a_value);
  //       a_resolve();
  //     }, 1000);
  //   });
  // });
  //
  // console.log("");
  // console.log("Result Promise:");
  // await fcf.each({k1: "v1", k2: "v2", k3: "v3"}, (a_key, a_value)=>{
  //   return new Promise((a_resolve, a_reject)=>{
  //     setTimeout(()=>{
  //       console.log(new Date(), "key:", a_key, "value:", a_value);
  //       a_resolve();
  //     }, 1000);
  //   });
  // });
  //
  // console.log("");
  // console.log("Async function (with fcf.Actions):");
  // await fcf.each({k1: "v1", k2: "v2", k3: "v3"}, async (a_key, a_value)=>{
  //   await fcf.actions()
  //   .then((a_result, a_act)=>{
  //     setTimeout(()=>{
  //       console.log(new Date(), "key:", a_key, "value:", a_value);
  //       a_act.complete();
  //     }, 1000);
  //   });
  // });
  //
  // console.log("");
  // console.log("Result fcf.Actions:");
  // await fcf.each({k1: "v1", k2: "v2", k3: "v3"}, (a_key, a_value)=>{
  //   return fcf.actions()
  //   .then((a_result, a_act)=>{
  //     setTimeout(()=>{
  //       console.log(new Date(), "key:", a_key, "value:", a_value);
  //       a_act.complete();
  //     }, 1000);
  //   });
  // });

  // For site (find and break)

// // Sync mode
// {
//   console.log("Sync mode...");
//   let result = fcf.each({k1: "v1", k2: "v2", k3: "v3"}, (a_key, a_value)=>{
//     console.log("[Iteration] ", "key:", a_key, "value:", a_value);
//     if (a_value == "v2"){
//       return a_key;
//     }
//   }).result();
//   console.log("Found key: ", result);
// }
//
// // Sync mode
// console.log("");
// console.log("Async mode...");
// let result = await fcf.each({k1: "v1", k2: "v2", k3: "v3"}, async (a_key, a_value)=>{
//   return await (new Promise((a_resolve, a_reject)=>{
//     setTimeout(()=>{
//       console.log("[Iteration] ", "key:", a_key, "value:", a_value);
//       a_resolve(a_key == "k2" ? a_key : undefined);
//     }, 10);
//   }));
// });
// console.log("Found key: ", result);



  // object
  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let res = [];
    fcf.each(object, (a_key, a_value)=>{
      res.push([a_key, a_value]);
    });
    a_unitest.equal(res, [["k1", "v1"], ["k2", "v2"], ["k3", "v3"]]);
  }
  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let res = [];
    let result = fcf.each(object, (a_key, a_value)=>{
      res.push([a_key, a_value]);
      return a_key;
    }).result();
    a_unitest.equal(result, "k1");
    a_unitest.equal(res, [["k1", "v1"]]);
  }
  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let res = [];
    let counter = 0;
    let result = fcf.each(object, (a_key, a_value)=>{
      res.push([a_key, a_value]);
      if (++counter == 2)
      return a_key;
    }).result();
    a_unitest.equal(result, "k2");
    a_unitest.equal(res, [["k1", "v1"], ["k2", "v2"]]);
  }
  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let res = [];
    let result = await fcf.each(object, (a_key, a_value)=>{
      return new Promise((a_resolve, a_reject)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_resolve();
        }, 10);
      })
    });
    a_unitest.equal(result, undefined);
    a_unitest.equal(res, [["k1", "v1"], ["k2", "v2"], ["k3", "v3"]]);
  }

  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let res = [];
    let result = await fcf.each(object, (a_key, a_value)=>{
      return new Promise((a_resolve, a_reject)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_resolve(a_key);
        }, 10);
      })
    });
    a_unitest.equal(result, "k1");
    a_unitest.equal(res, [["k1", "v1"]]);
  }

  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let res = [];
    let counter = 0;
    let result = await fcf.each(object, (a_key, a_value)=>{
      return new Promise((a_resolve, a_reject)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_resolve(++counter == 2 ? a_key : undefined);
        }, 10);
      })
    });
    a_unitest.equal(result, "k2");
    a_unitest.equal(res, [["k1", "v1"], ["k2", "v2"]]);
  }

  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let res = [];
    let result = await fcf.each(object, (a_key, a_value)=>{
      return fcf.actions()
      .then((a_res, a_act)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_act.complete();
        }, 10);
      });
    });
    a_unitest.equal(result, undefined);
    a_unitest.equal(res, [["k1", "v1"], ["k2", "v2"], ["k3", "v3"]]);
  }

  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let res = [];
    let result = await fcf.each(object, (a_key, a_value)=>{
      return fcf.actions()
      .then((a_res, a_act)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_act.complete(a_key);
        }, 10);
      });
    });
    a_unitest.equal(result, "k1");
    a_unitest.equal(res, [["k1", "v1"]]);
  }

  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let res = [];
    let counter = 0;
    let result = await fcf.each(object, (a_key, a_value)=>{
      return fcf.actions()
      .then((a_res, a_act)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_act.complete(++counter == 2 ? a_key : undefined);
        }, 10);
      })
    });
    a_unitest.equal(result, "k2");
    a_unitest.equal(res, [["k1", "v1"], ["k2", "v2"]]);
  }

  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let error;
    try {
      await fcf.each(object, (a_key, a_value)=>{
        return new Promise((a_resolve, a_reject)=>{
          a_reject(new Error("error"));
        })
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }

  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let error;
    try {
      await fcf.each(object, (a_key, a_value)=>{
        return new Promise((a_resolve, a_reject)=>{
          setTimeout(()=>{
            a_reject(new Error("error"));
          }, 10)
        })
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }

  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let error;
    try {
      fcf.each(object, (a_key, a_value) => {
        return fcf.actions()
        .then((a_res, a_act) => {
          a_act.error(new Error("error"));
        });
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }

  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let error;
    try {
      await fcf.each(object, (a_key, a_value) => {
        return fcf.actions()
        .then((a_res, a_act) => {
          a_act.error(new Error("error"));
        });
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }

  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let error;
    try {
      await fcf.each(object, (a_key, a_value) => {
        return fcf.actions()
        .then((a_res, a_act) => {
          setTimeout(()=>{
            a_act.error(new Error("error"));
          }, 10);
        });
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }

  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let error;
    try {
      await fcf.each(object, async (a_key, a_value) => {
        throw new Error("error");
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }


  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let error;
    try {
      await fcf.each(object, async (a_key, a_value) => {
        await fcf.actions()
        .then(()=>{
          throw new Error("error");
        });
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }

  {
    let object = {k1: "v1", k2: "v2", k3: "v3"};
    let error;
    try {
      await fcf.each(object, async (a_key, a_value) => {
        await fcf.actions()
        .then((a_res, a_act)=>{
          setTimeout(()=>{
            a_act.error(new Error("error"));
          }, 10);
        });
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }


  //
  // ARRAY
  //


  // object
  {
    let array = ["v1", "v2", "v3"];
    let res = [];
    fcf.each(array, (a_key, a_value)=>{
      res.push([a_key, a_value]);
    });
    a_unitest.equal(res, [[0, "v1"], [1, "v2"], [2, "v3"]]);
  }

  {
    let array = ["v1", "v2", "v3"];
    let res = [];
    let result = fcf.each(array, (a_key, a_value)=>{
      res.push([a_key, a_value]);
      return a_key;
    }).result();
    a_unitest.equal(result, 0);
    a_unitest.equal(res, [[0, "v1"]]);
  }

  {
    let array = ["v1", "v2", "v3"];
    let res = [];
    let counter = 0;
    let result = fcf.each(array, (a_key, a_value)=>{
      res.push([a_key, a_value]);
      if (++counter == 2)
      return a_key;
    }).result();
    a_unitest.equal(result, 1);
    a_unitest.equal(res, [[0, "v1"], [1, "v2"]]);
  }

  {
    let array = ["v1", "v2", "v3"];
    let res = [];
    let result = await fcf.each(array, (a_key, a_value)=>{
      return new Promise((a_resolve, a_reject)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_resolve();
        }, 10);
      })
    });
    a_unitest.equal(result, undefined);
    a_unitest.equal(res, [[0, "v1"], [1, "v2"], [2, "v3"]]);
  }

  {
    let array = ["v1", "v2", "v3"];
    let res = [];
    let result = await fcf.each(array, (a_key, a_value)=>{
      return new Promise((a_resolve, a_reject)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_resolve(a_key);
        }, 10);
      })
    });
    a_unitest.equal(result, 0);
    a_unitest.equal(res, [[0, "v1"]]);
  }

  {
    let array = ["v1", "v2", "v3"];
    let res = [];
    let counter = 0;
    let result = await fcf.each(array, (a_key, a_value)=>{
      return new Promise((a_resolve, a_reject)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_resolve(++counter == 2 ? a_key : undefined);
        }, 10);
      })
    });
    a_unitest.equal(result, 1);
    a_unitest.equal(res, [[0, "v1"], [1, "v2"]]);
  }

  {
    let array = ["v1", "v2", "v3"];
    let res = [];
    let result = await fcf.each(array, (a_key, a_value)=>{
      return fcf.actions()
      .then((a_res, a_act)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_act.complete();
        }, 10);
      });
    });
    a_unitest.equal(result, undefined);
    a_unitest.equal(res, [[0, "v1"], [1, "v2"], [2, "v3"]]);
  }

  {
    let array = ["v1", "v2", "v3"];
    let res = [];
    let result = await fcf.each(array, (a_key, a_value)=>{
      return fcf.actions()
      .then((a_res, a_act)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_act.complete(a_key);
        }, 10);
      });
    });
    a_unitest.equal(result, 0);
    a_unitest.equal(res, [[0, "v1"]]);
  }

  {
    let array = ["v1", "v2", "v3"];
    let res = [];
    let counter = 0;
    let result = await fcf.each(array, (a_key, a_value)=>{
      return fcf.actions()
      .then((a_res, a_act)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_act.complete(++counter == 2 ? a_key : undefined);
        }, 10);
      })
    });
    a_unitest.equal(result, 1);
    a_unitest.equal(res, [[0, "v1"], [1, "v2"]]);
  }

  {
    let array = ["v1", "v2", "v3"];
    let error;
    try {
      await fcf.each(array, (a_key, a_value)=>{
        return new Promise((a_resolve, a_reject)=>{
          a_reject(new Error("error"));
        })
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }

  {
    let array = ["v1", "v2", "v3"];
    let error;
    try {
      await fcf.each(array, (a_key, a_value)=>{
        return new Promise((a_resolve, a_reject)=>{
          setTimeout(()=>{
            a_reject(new Error("error"));
          }, 10)
        })
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }

  {
    let array = ["v1", "v2", "v3"];
    let error;
    try {
      fcf.each(array, (a_key, a_value) => {
        return fcf.actions()
        .then((a_res, a_act) => {
          a_act.error(new Error("error"));
        });
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }

  {
    let array = ["v1", "v2", "v3"];
    let error;
    try {
      await fcf.each(array, (a_key, a_value) => {
        return fcf.actions()
        .then((a_res, a_act) => {
          a_act.error(new Error("error"));
        });
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }

  {
    let array = ["v1", "v2", "v3"];
    let error;
    try {
      await fcf.each(array, (a_key, a_value) => {
        return fcf.actions()
        .then((a_res, a_act) => {
          setTimeout(()=>{
            a_act.error(new Error("error"));
          }, 10);
        });
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }

  {
    let array = ["v1", "v2", "v3"];
    let error;
    try {
      await fcf.each(array, async (a_key, a_value) => {
        throw new Error("error");
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }


  {
    let array = ["v1", "v2", "v3"];
    let error;
    try {
      await fcf.each(array, async (a_key, a_value) => {
        await fcf.actions()
        .then(()=>{
          throw new Error("error");
        });
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }

  {
    let array = ["v1", "v2", "v3"];
    let error;
    try {
      await fcf.each(array, async (a_key, a_value) => {
        await fcf.actions()
        .then((a_res, a_act)=>{
          setTimeout(()=>{
            a_act.error(new Error("error"));
          }, 10);
        });
      });
    } catch(e) {
      error = true;
    }
    fcf.equal(error, true);
  }


  // Map and Set testing
  {
    let map = new Map();
    map.set("k1", "v1");
    map.set("k2", "v2");
    let res = [];
    fcf.each(map, (a_key, a_value)=>{
      res.push([a_key, a_value]);
    });
    a_unitest.equal(res, [["k1", "v1"], ["k2", "v2"]]);
  }

  {
    let map = new Map();
    map.set("k1", "v1");
    map.set("k2", "v2");
    let res = [];
    fcf.each(map, (a_key, a_value)=>{
      res.push([a_key, a_value]);
      return false;
    });
    a_unitest.equal(res, [["k1", "v1"]]);
  }

  {
    let set = new Set();
    set.add("v1");
    set.add("v2");
    let res = [];
    fcf.each(set, (a_key, a_value)=>{
      res.push(a_value);
    });
    a_unitest.equal(res, ["v1", "v2"]);
  }

  {
    let set = new Set();
    set.add("v1");
    set.add("v2");
    let res = [];
    fcf.each(set, (a_key, a_value)=>{
      res.push(a_value);
      return false;
    });
    a_unitest.equal(res, ["v1"]);
    let count = fcf.count(set, ()=>{ return true; });
    a_unitest.equal(count, 2);
  }

  {
    let set = new Map();
    set.set("k1", "v1");
    set.set("k2", "v2");
    set.set("k3", "v3");
    let res = [];
    let start = Date.now();
    await fcf.each(set, async (a_key, a_value)=>{
      await fcf.actions()
      .then((a_res, a_act)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_act.complete();
        }, 10);
      })
    });
    a_unitest.equal(res, [["k1", "v1"], ["k2", "v2"], ["k3", "v3"]]);
  }

  {
    let set = new Set();
    set.add("v1");
    set.add("v2");
    set.add("v3");
    let res = [];
    let start = Date.now();
    await fcf.each(set, async (a_key, a_value)=>{
      await fcf.actions()
      .then((a_res, a_act)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_act.complete();
        }, 10);
      })
    });
    a_unitest.equal(res, [["v1", "v1"], ["v2", "v2"], ["v3", "v3"]]);
  }


  {
    let set = new Set();
    set.add("v1");
    set.add("v2");
    set.add("v3");
    let res = [];
    let start = Date.now();
    await fcf.each(set, async (a_key, a_value)=>{
      await fcf.actions()
      .then((a_res, a_act)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_act.complete();
        }, 10);
      });
      return false;
    });
    a_unitest.equal(res, [["v1", "v1"]]);
  }

  {
    let set = new Set();
    set.add("v1");
    set.add("v2");
    set.add("v3");
    let res = [];
    let start = Date.now();
    let counter = 0;
    await fcf.each(set, async (a_key, a_value)=>{
      await fcf.actions()
      .then((a_res, a_act)=>{
        setTimeout(()=>{
          res.push([a_key, a_value]);
          a_act.complete();
        }, 10);
      });
      if (++counter == 2){
        return false;
      }
    });
    a_unitest.equal(res, [["v1", "v1"], ["v2", "v2"]]);
  }

})
