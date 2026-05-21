fcf.test("Function fcf.build - NAN", (a_unitest) => {
  {
    let description = {
      type: fcf.NAN,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, NaN);
    a_unitest.equal(isNaN(value), true);
  }

  {
    let description = {
      type: fcf.NAN,
      default: 0,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, null);
    a_unitest.equal(value, 0);
  }

  {
    let description = {
      type: fcf.NAN,
    };
    let type = fcf.type(description);

    let error = false;
    try {
      let value = fcf.build(type, 123);
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }
});