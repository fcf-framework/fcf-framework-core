fcf.test("Function fcf.build - NULL", (a_unitest) => {
  {
    let description = {
      type: fcf.NULL,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, null);
    a_unitest.equal(value, null);
  }

  {
    let description = {
      type: fcf.NULL,
      default: "default",
    };
    let type = fcf.type(description);

    let value = fcf.build(type, undefined);
    a_unitest.equal(value, "default");
  }

  {
    let description = {
      type: fcf.NULL,
    };
    let type = fcf.type(description);

    let error = false;
    try {
      let value = fcf.build(type, undefined);
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }
});