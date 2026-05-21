fcf.test("Function fcf.build - UNDEFINED", (a_unitest) => {
  {
    let description = {
      type: fcf.UNDEFINED,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, undefined);
    a_unitest.equal(value, undefined);
  }

  {
    let description = {
      type: fcf.UNDEFINED,
      default: "default",
    };
    let type = fcf.type(description);

    let value = fcf.build(type, null);
    a_unitest.equal(value, "default");
  }

  {
    let description = {
      type: fcf.UNDEFINED,
    };
    let type = fcf.type(description);

    let error = false;
    try {
      let value = fcf.build(type, null);
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }
});