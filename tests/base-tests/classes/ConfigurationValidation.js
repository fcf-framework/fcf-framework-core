fcf.test("Class fcf.Configuration (validation)", (a_unitest)=>{
  {
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    configuration.append({
      merge: {
        param1: { type: "number", min: 10 }
      },
      param1: 10 
    }).exception();
    a_unitest.equal(configuration.param1, 10);
  }
  {
    let configuration = new fcf.Configuration(
                                              {
                                                merge: {
                                                  param1: { type: "number", min: 10 } 
                                                }
                                              });
    configuration.append({
      param1: 10 
    }).exception();
    a_unitest.equal(configuration.param1, 10);
  }
  {
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    let error = false;
    try {
      configuration.append({
        merge: {
          param1: { type: "number", min: 10 }
        },
        param1: 9
      }).exception();
    } catch(e){
      error = true;
    }
    a_unitest.equal(error, true);
  }
  {
    let configuration = new fcf.Configuration({
                                                merge: { 
                                                  param1: { type: "number", min: 10 } 
                                                }
                                              });
    let error = false;
    try {
      configuration.append({
        param1: 9
      }).exception();
    } catch(e){
      error = true;
    }
    a_unitest.equal(error, true);
  }

  {
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    configuration.append({
      merge: {
        "param.param1": { type: "number", min: 10 }
      },
      param: {
        param1: 10
      }
    }).exception();
    a_unitest.equal(configuration.param.param1, 10);
  }

  {
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    let error = false;
    try {
      configuration.append({
        merge: {
          "param.param1": { type: "number", min: 10 }
        },
        param: { param1: 9 },
      }).exception();
    } catch(e){
      error = true;
    }
    a_unitest.equal(error, true);
  }

  {
    let configuration = new fcf.Configuration({mergeParamNames: ["merge"]});
    configuration.append({
      merge: {
        "param": { type: "set", items: ["first", "second", "third"] }
      },
      param: "first|second",
    }).exception();
    a_unitest.equal(configuration.param, ["first", "second"]);
  }

  

});
