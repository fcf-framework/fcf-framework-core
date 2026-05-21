fcf.test("Function fcf.build - SET", (a_unitest) => {
  //
  // Basic SET tests (Array input)
  //
  {
    let description = {
      type: fcf.SET,
      items: ["red", "green", "blue"],
    };
    let type = fcf.type(description);

    let value = fcf.build(type, ["red", "blue"]);
    a_unitest.equal(value.length, 2);
    a_unitest.equal(value[0], "red");
    a_unitest.equal(value[1], "blue");
  }

  //
  // Basic SET tests (String input with delimiters)
  //
  {
    let description = {
      type: fcf.SET,
      items: ["apple", "banana", "cherry"],
    };
    let type = fcf.type(description);

    let value = fcf.build(type, "apple|banana;cherry");
    a_unitest.equal(value.length, 3);
    a_unitest.equal(value[0], "apple");
    a_unitest.equal(value[1], "banana");
    a_unitest.equal(value[2], "cherry");
  }

  //
  // Invalid element in SET
  //
  {
    let description = {
      type: fcf.SET,
      items: ["one", "two"],
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, ["one", "three"]);
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }

  //
  // Invalid element in SET (String input)
  //
  {
    let description = {
      type: fcf.SET,
      items: ["a", "b"],
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, "a|c");
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }

  //
  // Empty SET
  //
  {
    let description = {
      type: fcf.SET,
      items: ["val"],
    };
    let type = fcf.type(description);

    let value = fcf.build(type, "");
    a_unitest.equal(value.length, 0);
  }

});
