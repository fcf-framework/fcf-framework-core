fcf.test("Function fcf.build", (a_unitest)=>{
  //
  // Boolean tests
  //
  {
    let description = {
      type:    fcf.BOOLEAN,
    };

    let type = fcf.type(description);

    let value = fcf.build(type, true);
    a_unitest.equal(value, true);
  }
  {
    let description = {
      type:    fcf.BOOLEAN,
    };

    let type = fcf.type(description);

    let value = fcf.build(type, false);
    a_unitest.equal(value, false);
  }
  {
    let description = {
      type:    fcf.BOOLEAN,
      default: false,
    };

    let type = fcf.type(description);

    let value = fcf.build(type, "123");
    a_unitest.equal(value, false);
  }
  {
    let description = {
      type:    fcf.BOOLEAN,
      default: true,
    };

    let type = fcf.type(description);

    let value = fcf.build(type, undefined);
    a_unitest.equal(value, true);
  }
  {
    let description = {
      type:    fcf.BOOLEAN,
      default: "ok",
    };

    let type = fcf.type(description);

    let value = fcf.build(type, undefined);
    a_unitest.equal(value, "ok");
  }
  {
    let description = {
      type:    fcf.BOOLEAN,
      convert: true,
    };

    let type = fcf.type(description);

    let value = fcf.build(type, "asd");
    a_unitest.equal(value, true, true);
  }
  {
    let description = {
      type:    fcf.BOOLEAN,
    };

    let type = fcf.type(description);

    let error = false;
    try {
      let value = fcf.build(type, "asd");
    } catch(e){
      error = true;
    }
    a_unitest.equal(error, true, true);
  }


  //
  // Number tests
  //

  
  //
  // Enum tests
  //
  {
    let description = {
      type:    fcf.ENUM,
      items:   ["none", "first", "second"],
    };

    let type = fcf.type(description);

    let value = fcf.build(type, "first");
    a_unitest.equal(value, "first", true);
  }
  {
    let description = {
      type:    fcf.ENUM,
      items:   ["none", "first", "second"],
      default: "first",
    };

    let type = fcf.type(description);

    let value = fcf.build(type, "error_value");
    a_unitest.equal(value, "first");
  }
  {
    let description = {
      type:    fcf.ENUM,
      items:   ["none", "first", "second"],
      default: 1,
    };

    let type = fcf.type(description);

    let value = fcf.build(type, "error_value");
    a_unitest.equal(value, 1);
  }
  {
    let description = {
      type:    fcf.ENUM,
      items:   ["none", "first", "second"],
    };

    let type = fcf.type(description);

    let error = false
    try {
      let value = fcf.build(type, "error_value");
    } catch (e){
      error = true;
    }
    a_unitest.equal(error, true);
  }

});


