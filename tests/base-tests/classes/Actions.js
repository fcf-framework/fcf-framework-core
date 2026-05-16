
async function testFunc(){
  return fcf.actions()
  .then(()=>{
    return 10;
  })
}

fcf.test("Class fcf.Actions", async (a_unitest)=>{
  a_unitest.equal(await testFunc(), 10);
  
  {
    let e = 0;
    let e2 = 0;
    let e3 = 0;
    let c = 0;
    fcf.actions({noexcept: true})
    .catch(true, ()=>{
      ++e2;
    })
    .then(()=>{
      throw new Error("E");
    })
    .catch(()=>{
      ++e;
    })
    .catch(true, ()=>{
      ++e3;
    })
    .then(()=>{
      ++c;
    })
    .then(function(){
      this.options({noexcept: false});
      this.error(this.error(true));
    })
    .catch(()=>{
      ++e;
    })
    a_unitest.equal(e,  2);
    a_unitest.equal(e2, 1);
    a_unitest.equal(e3, 1);
    a_unitest.equal(c,  1);
  }
  {
    let e = 0;
    let es = 0;
    await fcf.actions({noexcept: true})
    .catch(()=>{
      ++es;
    })
    .then(()=>{
      throw new Error("E");
    })
    .catch(()=>{
      ++es;
    })
    .catch(true, (err)=>{
      ++e;
    });
    a_unitest.equal(e, 1);
    a_unitest.equal(es, 0);
  }
  {
    let e = 0;
    let t = 0;
    let es = 0;
    await fcf.actions({noexcept: true})
    .catch(()=>{
      ++es;
    })
    .then(()=>{
      throw new Error("E");
    })
    .catch(true, (err)=>{
      ++e;
    })
    .then(()=>{
      ++t;
    })
    .catch(()=>{
      ++es;
    });
    a_unitest.equal(e, 1);
    a_unitest.equal(t, 1);
    a_unitest.equal(es, 0);
  }
  {
    let e = 0;
    let es = 0;
    let t = 0;
    await fcf.actions({noexcept: true})
    .catch(()=>{
      ++es;
    })
    .catch(true, (err)=>{
      ++e;
    })
    .then(()=>{
      throw new Error("E");
    })
    .then(()=>{
      ++t;
    })
    .catch(()=>{
      ++es;
    });
    a_unitest.equal(e, 1);
    a_unitest.equal(t, 1);
    a_unitest.equal(es, 0);

  }

  // let actions = new fcf.Actions();
  // await actions.then((a_result, a_act)=>{
  //   setTimeout(()=>{
  //     console.log("Step 001");
  //     a_act.complete("Hello world");
  //   }, 1000);
  // })
  // .then((a_result)=>{
  //   console.log("Step 002:", a_result);
  // });



  // let actions = new fcf.Actions();
  // await actions
  // .each({k1: "v1", k2: "v2", k3: "v3"}, (a_key, a_value, a_lastResult)=>{
  //   console.log("Iteration: ( a_key:", a_key, "; a_value:", a_value, "; a_lastResult: ", a_lastResult);
  //   return a_value;
  // })
  // .then((a_lastResult)=>{
  //   console.log("Complete:  ( a_lastResult:", a_lastResult, ")");
  // });



  // let actions = new fcf.Actions();
  // await actions
  // .each({k1: "v1", k2: "v2", k3: "v3"}, (a_key, a_value, a_lastResult, a_act)=>{
  //   setTimeout(()=>{
  //     console.log("Iteration: ( a_key:", a_key, "; a_value:", a_value, "; a_lastResult: ", a_lastResult);
  //     a_act.complete(a_value);
  //   }, 1000);
  // })
  // .then((a_lastResult)=>{
  //   console.log("Complete:  ( a_lastResult:", a_lastResult, ")");
  // });


  // let actions = new fcf.Actions();
  // let array = [];
  // await actions
  // .then((a_res, a_act)=>{
  //   setTimeout(()=>{
  //     array = [1,2,3];
  //     a_act.complete();
  //   }, 1000)
  // })
  // .each(()=>{ return array; }, (a_key, a_value, a_lastResult, a_act)=>{
  //   setTimeout(()=>{
  //     console.log("Iteration: ( a_key:", a_key, "; a_value:", a_value, "; a_lastResult: ", a_lastResult);
  //     a_act.complete(a_value);
  //   }, 1000);
  // })
  // .then((a_lastResult)=>{
  //   console.log("Complete:  ( a_lastResult:", a_lastResult, ")");
  // });


  // let actions = new fcf.Actions();
  // await actions
  // .then(()=>{
  //   return "first result";
  // })
  // .asyncEach({k1: "v1", k2: "v2", k3: "v3"}, (a_key, a_value, a_lastResult, a_act)=>{
  //   setTimeout(()=>{
  //     console.log("Iteration: ( a_key:", a_key, "; a_value:", a_value, "; a_lastResult: ", a_lastResult);
  //     a_act.complete(a_value);
  //   }, Math.random()*100);
  // })
  // .then((a_lastResult)=>{
  //   console.log("Complete:  ( a_lastResult:", a_lastResult, ")");
  // });



  // let actions = new fcf.Actions();
  // await actions
  // .then(()=>{
  //   throw new Error("Some error");
  // })
  // .catch((a_error)=>{
  //   console.error("Error:", a_error.message);
  // });


  // let actions = new fcf.Actions();
  // await actions
  // .then(()=>{
  //   /// doing something ...
  //   return "Hello world";
  // })
  // .finally(function(a_lastResult){
  //   if(this.error()){
  //     console.error("Error:", this.error().message);
  //   } else {
  //     console.log("Result:", a_lastResult);
  //   }
  // });



// let actions = new fcf.Actions({deferred: true});
// actions.then(()=>{
//   console.log("Step 1");
// })
//
// console.log("Initialize");
//
// actions.then(()=>{
//   console.log("Step 2");
// })
//
// actions.startup();


  // {
  //   let actions = new fcf.Actions({quiet: true});
  //   actions.then(()=>{
  //     throw new Error("Test error");
  //   });
  //   console.log(actions.error().message);
  // }
  //
  // {
  //   let actions = new fcf.Actions({quiet: true});
  //   actions.catch((a_error)=>{
  //     console.log(a_error.message);
  //   });
  //   actions.error(new Error("Test error"));
  // }



  // {
  //   let actions = new fcf.Actions();
  //   actions.then(()=>{
  //     return "Result value";
  //   });
  //   console.log(actions.result());
  // }

  // {
  //   let actions = new fcf.Actions();
  //   actions.result("Result value");
  //   actions.then((a_lastResutl)=>{
  //     console.log(a_lastResutl);
  //   });
  // }

  // fcf.actions()
  // .options({noexcept: true})
  // .then(()=>{
  //   console.log("First action");
  //   throw new Error("Test error");
  // })
  // .then(function (a_lastResult){
  //   console.log("Second action");
  // })


  //console.log(fcf.actions().options().noexcept)

  // fcf.actions()
  // .then((a_lastResult, a_act)=>{
  //   a_act.complete("Result value");
  // })
  // .then((a_lastResult)=>{
  //   console.log(a_lastResult);
  // });


  // fcf.actions()
  // .then((a_lastResult, a_act)=>{
  //   a_act.error(new Error("Test error"));
  // })
  // .catch((a_error)=>{
  //   console.error(a_error.message);
  // });


  // let info = fcf.errorToString(new Error("Test error"));
  // console.log(info);
});
