fcf.test("Function fcf.build - ITERABLE", (a_unitest) => {
  //
  // Basic Iterable tests (using Set)
  //
  {
    let description = {
      type: fcf.ITERABLE,
      item: { type: fcf.NUMBER }
    };
    let type = fcf.type(description);

    let input = new Set([1, 2, 3]);
    let value = fcf.build(type, input);
    
    a_unitest.equal(value instanceof Set, true);
    a_unitest.equal(value.size, 3);
    a_unitest.equal(Array.from(value)[0], 1);
  }

  //
  // Basic Iterable tests (using Map)
  //
  {
    let description = {
      type: fcf.ITERABLE,
      item: { type: fcf.STRING }
    };
    let type = fcf.type(description);

    let input = new Map([["a", "val1"], ["b", "val2"]]);
    let value = fcf.build(type, input);

    a_unitest.equal(value instanceof Map, true);
    a_unitest.equal(value.get("a"), "val1");
    a_unitest.equal(value.get("b"), "val2");
  }

  {
    let description = {
      type: fcf.ITERABLE,
      item: fcf.ANY
    };
    let type = fcf.type(description);

    let input = new Map([["a", "val1"], ["b", "val2"]]);
    let value = fcf.build(type, input);

    a_unitest.equal(value instanceof Map, true);
    a_unitest.equal(value.get("a"), "val1");
    a_unitest.equal(value.get("b"), "val2");
  }

  {
    let description = {
      type: fcf.ITERABLE,
      item: fcf.NUMBER,
    };
    let type = fcf.type(description);

    let input = new Map([["a", "val1"], ["b", "val2"]]);
    let error = false;
    try {
      let value = fcf.build(type, input);
    } catch (e) {
      error = e instanceof fcf.Exception && e.name === "NOT_MATCH_TYPE";
    }
    a_unitest.equal(error, true);
  }

  //
  // Type mismatch in elements
  //
  {
    let description = {
      type: fcf.ITERABLE,
      item: { type: fcf.NUMBER }
    };
    let type = fcf.type(description);

    let input = new Set([1, "not_a_number", 3]);
    let error = false;
    try {
      fcf.build(type, input);
    } catch (e) {
      error = e instanceof fcf.Exception && e.name === "NOT_MATCH_TYPE";
    }
    a_unitest.equal(error, true);
  }

  //
  // Non-iterable input
  //
  {
    let description = {
      type: fcf.ITERABLE,
      item: { type: fcf.ANY }
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, { not: "iterable" });
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }

  //
  // Empty iterable
  //
  {
    let description = {
      type: fcf.ITERABLE,
      item: { type: fcf.STRING }
    };
    let type = fcf.type(description);

    let input = new Set();
    let value = fcf.build(type, input);
    a_unitest.equal(value.size, 0);
  }

  //
  // Conversion within iterable
  //
  {
    let description = {
      type: fcf.ITERABLE,
      item: { type: fcf.NUMBER, convert: true }
    };
    let type = fcf.type(description);

    let input = new Set(["1", "2.5", 3]);
    let value = fcf.build(type, input);
    let arr = Array.from(value);
    a_unitest.equal(arr[0], 1);
    a_unitest.equal(arr[1], 2.5);
    a_unitest.equal(arr[2], 3);
  }
});
