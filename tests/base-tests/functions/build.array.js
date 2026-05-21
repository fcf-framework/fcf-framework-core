fcf.test("Function fcf.build - ARRAY", (a_unitest) => {
  //
  // Basic Array tests
  //
  {
    let description = {
      type: fcf.ARRAY,
      item: { type: fcf.NUMBER }
    };
    let type = fcf.type(description);

    let input = [1, 2, 3, 4];
    let value = fcf.build(type, input);
    a_unitest.equal(value.length, 4);
    a_unitest.equal(value[0], 1);
    a_unitest.equal(value[3], 4);
  }

  //
  // Array with conversion
  //
  {
    let description = {
      type: fcf.ARRAY,
      item: { type: fcf.STRING, convert: true }
    };
    let type = fcf.type(description);

    let input = [1, 2, 3];
    let value = fcf.build(type, input);
    a_unitest.equal(value[0], "1");
    a_unitest.equal(value[1], "2");
    a_unitest.equal(value[2], "3");
  }

  //
  // Nested Array tests
  //
  {
    let description = {
      type: fcf.ARRAY,
      item: {
        type: fcf.ARRAY,
        item: { type: fcf.NUMBER }
      }
    };
    let type = fcf.type(description);

    let input = [[1, 2], [3, 4]];
    let value = fcf.build(type, input);
    a_unitest.equal(value.length, 2);
    a_unitest.equal(value[0].length, 2);
    a_unitest.equal(value[1][0], 3);
  }

  //
  // Array of Objects
  //
  {
    let description = {
      type: fcf.ARRAY,
      item: {
        type: fcf.OBJECT,
        fields: {
          id: { type: fcf.NUMBER, require: true },
          name: { type: fcf.STRING }
        }
      }
    };
    let type = fcf.type(description);

    let input = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    ];
    let value = fcf.build(type, input);
    a_unitest.equal(value.length, 2);
    a_unitest.equal(value[0].id, 1);
    a_unitest.equal(value[1].name, "Bob");
  }

  //
  // Type mismatch in array element
  //
  {
    let description = {
      type: fcf.ARRAY,
      item: { type: fcf.NUMBER }
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, [1, "not_a_number", 3]);
    } catch (e) {
      error = e instanceof fcf.Exception && e.name === "NOT_MATCH_TYPE";
    }
    a_unitest.equal(error, true);
  }

  //
  // Missing required field in object within array
  //
  {
    let description = {
      type: fcf.ARRAY,
      item: {
        type: fcf.OBJECT,
        fields: {
          id: { type: fcf.NUMBER, require: true }
        }
      }
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, [{ id: 1 }, { name: "no_id" }]);
    } catch (e) {
      error = e instanceof fcf.Exception && e.name === "FIELD_NOT_SET";
    }
    a_unitest.equal(error, true);
  }

  //
  // Non-array input
  //
  {
    let description = {
      type: fcf.ARRAY,
      item: { type: fcf.ANY }
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, { not: "an_array" });
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }

  //
  // Empty array
  //
  {
    let description = {
      type: fcf.ARRAY,
      item: { type: fcf.NUMBER }
    };
    let type = fcf.type(description);

    let value = fcf.build(type, []);
    a_unitest.equal(value.length, 0);
  }
});