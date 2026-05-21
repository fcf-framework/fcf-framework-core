fcf.test("Function fcf.build - DATE", (a_unitest) => {
  //
  // Date tests
  //

  {
    let description = {
      type: fcf.DATE,
    };
    let type = fcf.type(description);

    let now = new Date();
    let value = fcf.build(type, now);
    a_unitest.equal(value.getTime(), now.getTime());
  }

  {
    let description = {
      type: fcf.DATE,
      convert: true,
    };
    let type = fcf.type(description);

    let dateStr = "2023-10-27T10:00:00";
    let value = fcf.build(type, dateStr);
    a_unitest.equal(value instanceof Date, true);
    a_unitest.equal(value.toISOString().split('.')[0], new Date(dateStr).toISOString().split('.')[0]);
  }

  {
    let description = {
      type: fcf.DATE,
      default: new Date(2000, 0, 1),
    };
    let type = fcf.type(description);

    let value = fcf.build(type, undefined);
    a_unitest.equal(value.getFullYear(), 2000);
    a_unitest.equal(value.getMonth(), 0);
  }

  {
    let description = {
      type: fcf.DATE,
      convert: true,
      default: new Date(1970, 0, 1),
    };
    let type = fcf.type(description);

    let value = fcf.build(type, null);
    a_unitest.equal(value.getFullYear(), 1970);
  }

  {
    let description = {
      type: fcf.DATE,
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, "2023-10-27"); // convert is false
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }

  {
    let description = {
      type: fcf.DATE,
      convert: true,
    };
    let type = fcf.type(description);
    let dateStr = "2023-10-27";
    let value = fcf.build(type, dateStr);
    a_unitest.equal(value instanceof Date, true);
    a_unitest.equal(value.toISOString().split('T')[0], new Date(dateStr).toISOString().split('T')[0]);
  }

  {
    let description = {
      type: fcf.DATE,
      convert: true,
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, "not-a-date");
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }

  {
    let description = {
      type: fcf.DATE,
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, undefined);
    } catch (e) {
      error = e instanceof fcf.Exception && e.name === "FIELD_NOT_SET";
    }
    a_unitest.equal(error, true);
  }
});
