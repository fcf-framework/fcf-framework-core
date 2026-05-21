fcf.test("Function fcf.build - BOOLEAN", (a_unitest) => {
  //
  // Basic Boolean tests
  //
  {
    let description = {
      type: fcf.BOOLEAN,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, true);
    a_unitest.equal(value, true);
  }

  {
    let description = {
      type: fcf.BOOLEAN,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, false);
    a_unitest.equal(value, false);
  }

  {
    let description = {
      type: fcf.BOOLEAN,
      default: true,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, undefined);
    a_unitest.equal(value, true);
  }

  {
    let description = {
      type: fcf.BOOLEAN,
      default: false,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, null);
    a_unitest.equal(value, false);
  }

  //
  // Conversion tests
  //
  {
    let description = {
      type: fcf.BOOLEAN,
      convert: true,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, 1);
    a_unitest.equal(value, true);
  }

  {
    let description = {
      type: fcf.BOOLEAN,
      convert: true,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, 0);
    a_unitest.equal(value, false);
  }

  {
    let description = {
      type: fcf.BOOLEAN,
      convert: true,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, "any string");
    a_unitest.equal(value, true);
  }

  {
    let description = {
      type: fcf.BOOLEAN,
      default: true,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, "");
    a_unitest.equal(value, true);
  }

  //
  // Error tests
  //
  {
    let description = {
      type: fcf.BOOLEAN,
    };
    let type = fcf.type(description);

    let error = false;
    try {
      let value = fcf.build(type, "not a boolean");
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }
});
