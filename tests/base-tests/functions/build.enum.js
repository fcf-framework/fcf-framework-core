fcf.test("Function fcf.build - ENUM", (a_unitest) => {
  //
  // Basic Enum tests
  //
  {
    let description = {
      type: fcf.ENUM,
      items: ["active", "inactive", "pending"],
    };
    let type = fcf.type(description);

    let value = fcf.build(type, "active");
    a_unitest.equal(value, "active");
  }

  {
    let description = {
      type: fcf.ENUM,
      items: ["red", "green", "blue"],
      default: "green",
    };
    let type = fcf.type(description);

    let value = fcf.build(type, "yellow");
    a_unitest.equal(value, "green");
  }

  {
    let description = {
      type: fcf.ENUM,
      items: [1, 2, 3],
      default: 1,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, 5);
    a_unitest.equal(value, 1);
  }

  {
    let description = {
      type: fcf.ENUM,
      items: ["a", "b"],
    };
    let type = fcf.type(description);

    let error = false;
    try {
      let value = fcf.build(type, "c");
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }
});