fcf.test("core", "fcf.build", "Function fcf.build - NUMBER", (a_unitest) => {
  {
    let description = {
      type: fcf.NUMBER,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, 123);
    a_unitest.equal(value, 123);
  }

  {
    let description = {
      type: fcf.NUMBER,
      convert: true,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, "45.6");
    a_unitest.equal(value, 45.6);
  }

  {
    let description = {
      type: fcf.NUMBER,
      min: 10,
      max: 20,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, 15);
    a_unitest.equal(value, 15);
  }

  {
    let description = {
      type: fcf.NUMBER,
      min: 10,
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, 5);
    } catch (e) {
      error = e instanceof fcf.Exception && e.name === "NUMBER_MIN";
    }
    a_unitest.equal(error, true);
  }

  {
    let description = {
      type: fcf.NUMBER,
      max: 100,
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, 101);
    } catch (e) {
      error = e instanceof fcf.Exception && e.name === "NUMBER_MAX";
    }
    a_unitest.equal(error, true);
  }

  {
    let description = {
      type: fcf.NUMBER,
      default: 0,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, undefined);
    a_unitest.equal(value, 0);
  }

  {
    let description = {
      type: fcf.NUMBER,
      convert: true,
      default: 1,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, undefined);
    a_unitest.equal(value, 1);
  }

  {
    let description = {
      type: fcf.NUMBER,
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, "not_a_number");
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }
});

