fcf.test("Function fcf.build - NUMBERED", (a_unitest) => {
  //
  // Basic Numbered tests (Standard Array)
  //
  {
    let description = {
      type: fcf.NUMBERED,
      item: { type: fcf.NUMBER }
    };
    let type = fcf.type(description);

    // Array is iterable, has length, and has index 0
    let input = [10, 20, 30];
    let value = fcf.build(type, input);
    if (value === input){
      a_unitest.error("Invalid link");
    }
    a_unitest.equal(value.length, 3);
    a_unitest.equal(value[0], 10);
    a_unitest.equal(value[2], 30);
  }

  //
  // Custom Numbered object (Iterable + length + index 0)
  //
  {
    let description = {
      type: fcf.NUMBERED,
      item: { type: fcf.STRING }
    };
    let type = fcf.type(description);

    // Custom object that satisfies fcf.isNumbered
    let input = {
      0: "first",
      1: "second",
      length: 2,
      [Symbol.iterator]: function* () {
        yield this[0];
        yield this[1];
      }
    };
    let value = fcf.build(type, input);
    a_unitest.equal(value[0], "first");
    a_unitest.equal(value[1], "second");
  }

  //
  // Numbered with conversion
  //
  {
    let description = {
      type: fcf.NUMBERED,
      item: { type: fcf.NUMBER, convert: true }
    };
    let type = fcf.type(description);

    let input = {
      0: "100",
      1: "200",
      length: 2,
      [Symbol.iterator]: function* () {
        yield this[0];
        yield this[1];
      }
    };
    let value = fcf.build(type, input);
    a_unitest.equal(value[0], 100);
    a_unitest.equal(value[1], 200);
  }

  //
  // Type mismatch in numbered element
  //
  {
    let description = {
      type: fcf.NUMBERED,
      item: { type: fcf.NUMBER }
    };
    let type = fcf.type(description);

    let input = [1, "not_a_number", 3];
    let error = false;
    try {
      fcf.build(type, input);
    } catch (e) {
      error = e instanceof fcf.Exception && e.name === "NOT_MATCH_TYPE";
    }
    a_unitest.equal(error, true);
  }

  //
  // Missing element in numbered object (FIELD_NOT_SET)
  //
  {
    let description = {
      type: fcf.NUMBERED,
      item: { type: fcf.NUMBER, require: true }
    };
    let type = fcf.type(description);

    // length is 2, but index 1 is missing in the iterator/object
    let input = {
      0: 1,
      length: 2,
      [Symbol.iterator]: function* () {
        yield this[0];
        // index 1 is missing
      }
    };
    let error = false;
    try {
      fcf.build(type, input);
    } catch (e) {
      error = e instanceof fcf.Exception && e.name === "FIELD_NOT_SET";
    }
    a_unitest.equal(error, true);
  }

  //
  // Non-numbered input (Missing Symbol.iterator)
  //
  {
    let description = {
      type: fcf.NUMBERED,
      item: { type: fcf.ANY }
    };
    let type = fcf.type(description);

    let input = {
      0: "val",
      length: 1
      // Missing Symbol.iterator
    };
    let error = false;
    try {
      fcf.build(type, input);
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }

  //
  // Empty numbered object (length 0)
  //
  {
    let description = {
      type: fcf.NUMBERED,
      item: { type: fcf.ANY }
    };
    let type = fcf.type(description);

    let input = {
      length: 0,
      [Symbol.iterator]: function* () {}
    };
    let value = fcf.build(type, input);
    a_unitest.equal(value.length, 0);
  }
});
