fcf.test("Class fcf.ActionsQueue", async (a_unitest)=>{

  let timeout = 100;
  function task(a_state, a_expected, a_item) {
    a_state[a_item] = true;
    a_unitest.equal(a_state, a_expected);
    return fcf.actions().then((a_res, a_act)=>{
      setTimeout(()=>{
        try {
          a_unitest.equal(a_state, a_expected);
          a_act.complete();
        } catch(e){
          a_act.error(e);
        }
      }, timeout);
    })
  }
  
  {
    let res = [];
    let aq = new fcf.ActionsQueue();

    for(let i = 0 ; i < 10; ++i) {
      (function(i) {
        aq.getActions().then((a_res, a_act)=>{
          setTimeout(()=>{
            res.push(i);
            a_act.complete();
          }, 10);
        });
      })(i);
    }
    await aq.getActions();

    a_unitest.equal(res, [0,1,2,3,4,5,6,7,8,9]);
  }

  {
    let res = [];
    let aq = new fcf.ActionsQueue();

    for(let i = 0 ; i < 10; ++i) {
      (function(i) {
        aq.getAsyncActions("test").then((a_res, a_act)=>{
          setTimeout(()=>{
            res.push(i);
            a_act.complete();
          }, 100 + (i*10));
        });
      })(i);
    }
    aq.getActions().then(()=>{
      res.push(10);
    })

    let start = Date.now();
    await aq.getActions();
    a_unitest.equal(res, [0,1,2,3,4,5,6,7,8,9,10]);
    let diff = Date.now() - start;
    a_unitest.greater(diff, 100);
    a_unitest.less(diff, 300);
  }

  {
    let res = [];
    let aq = new fcf.ActionsQueue();

    for(let i = 0 ; i < 10; ++i) {
      (function(i) {
        aq.getAsyncActions("test").then((a_res, a_act)=>{
          setTimeout(()=>{
            res.push(i);
            a_act.complete();
          }, 100 + (i*10));
        });
      })(i);
    }
    aq.getActions().then(()=>{
      res.push(10);
    })
    for(let i = 0 ; i < 10; ++i) {
      (function(i) {
        aq.getAsyncActions("test").then((a_res, a_act)=>{
          setTimeout(()=>{
            res.push(i);
            a_act.complete();
          }, 100 + (i*10));
        });
      })(i);
    }

    let start = Date.now();
    await aq.getActions();
    a_unitest.equal(res, [0,1,2,3,4,5,6,7,8,9,10,0,1,2,3,4,5,6,7,8,9]);
    let diff = Date.now() - start;
    a_unitest.greater(diff, 200);
    a_unitest.less(diff, 500);
  }

  {
    let res = [];
    let aq = new fcf.ActionsQueue();

    for(let i = 0 ; i < 10; ++i) {
      (function(i) {
        aq.getAsyncActions("test1").then((a_res, a_act)=>{
          setTimeout(()=>{
            res.push(i);
            a_act.complete();
          }, 100 + (i*10));
        });
      })(i);
    }
    for(let i = 0 ; i < 10; ++i) {
      (function(i) {
        aq.getAsyncActions("test2").then((a_res, a_act)=>{
          setTimeout(()=>{
            res.push(i+100);
            a_act.complete();
          }, 100 + (i*10));
        });
      })(i);
    }

    let start = Date.now();
    await aq.getActions();
    a_unitest.equal(res, [0,1,2,3,4,5,6,7,8,9,100,101,102,103,104,105,106,107,108,109]);
    let diff = Date.now() - start;
    a_unitest.greater(diff, 200);
    a_unitest.less(diff, 500);
  }
  
 
  {
    let aq = new fcf.ActionsQueue();
    let state = {
      "g1": false,
      "g2": false,
      "g3": false,
     };
    for(let i = 0; i < 10; ++i) {
      aq.getAsyncActions("g1", true)
      .then(()=>{
        return task(
          state,
          {
            "g1": true,
            "g2": false,
            "g3": false,
          }, 
          "g1");
      });
      aq.getAsyncActions("g2", true)
      .then(()=>{
        return task(
          state,
          {
            "g1": true,
            "g2": true,
            "g3": false,
          }, 
          "g2");
      });
      aq.getAsyncActions("g3", true)
      .then(()=>{
        return task(
          state,
          {
            "g1": true,
            "g2": true,
            "g3": true,
          }, 
          "g3");
      });
    }
    
    await aq.getActions();
  }

  {
    let timeout = 100;
    let aq = new fcf.ActionsQueue();
    let state = {
      "g1": false,
      "a1": false,
      "g2": false,
      "g3": false,
      "a2": false,
     };
    for(let i = 0; i < 10; ++i) {
      aq.getAsyncActions("g1", true)
      .then(()=>{
        return task(
          state,
          {
            "g1": true,
            "a1": false,
            "g2": false,
            "g3": false,
            "a2": false,
          }, 
          "g1");
      });
      if (!i) {
        aq.getActions()
        .then(()=>{
          return task(
            state,
            {
              "g1": true,
              "a1": true,
              "g2": false,
              "g3": false,
              "a2": false,
            }, 
            "a1");
        });
      }
      aq.getAsyncActions("g2", true)
      .then(()=>{
        return task(
          state,
          {
            "g1": true,
            "a1": true,
            "g2": true,
            "g3": false,
            "a2": false,
          }, 
          "g2");
      });
      aq.getAsyncActions("g3", true)
      .then(()=>{
        return task(
          state,
          {
            "g1": true,
            "a1": true,
            "g2": true,
            "g3": true,
            "a2": false,
          }, 
          "g3");
      });
      if (!i) {
        aq.getActions()
        .then(()=>{
          return task(
            state,
            {
              "g1": true,
              "a1": true,
              "g2": true,
              "g3": true,
              "a2": true,
            }, 
            "a2");
        });
      }
    }

    await aq.getActions();
  }

  {
    let wactions = fcf.actions();
    let act;
    wactions.then((a_res, a_act)=>{
      act = a_act;
    });
    let aq = new fcf.ActionsQueue();
    aq.getAsyncActions("actions", true)
    .then(()=>{
      return fcf.actions().wait(100);
    });
    aq.getActions()
    .then(()=>{
      act.complete();
      return fcf.actions().wait(100);
    });
    aq.getAsyncActions("actions", true)
    .then(()=>{
      return fcf.actions().wait(100);
    });
    await wactions;
  }

  {
    let states = [];
    let aq = new fcf.ActionsQueue();

    aq.getAsyncActions("actions", true)
    .then(()=>{
      states.push("001");
      return fcf.actions().wait(100);
    })
    .then(()=>{
      states.push("001-e");
    });
    aq.getAsyncActions("actions", true)
    .then(()=>{
      states.push("002");
      return fcf.actions().wait(100);
    })
    .then(()=>{
      states.push("002-e");
    });
    aq.getAsyncActions("actions", true)
    .then(()=>{
      states.push("003");
      return fcf.actions().wait(100);
    })
    .then(()=>{
      states.push("003-e");
    });

    await fcf.actions().wait(110);

    aq.getAsyncActions("actions", true)
    .then(()=>{
      states.push("004");
      return fcf.actions().wait(100);
    })
    .then(()=>{
      states.push("004-e");
    });

    await aq.getActions()
    .then(()=>{
      states.push("a01");
     return fcf.actions().wait(100);
    })
    .then(()=>{
      states.push("a01-e");
    });

    a_unitest.equal(
      states,
      [
        "001",
        "002",
        "003",
        "001-e",
        "002-e",
        "003-e",
        "004",
        "004-e",
        "a01",
        "a01-e"
      ]
    );

  }


});
