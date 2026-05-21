fcf.test("Function fcf.build - STRING", (a_unitest) => {
  {
    let description = {
      type: fcf.STRING,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, "hello");
    a_unitest.equal(value, "hello");
  }

  {
    let description = {
      type: fcf.STRING,
      convert: true,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, 123);
    a_unitest.equal(value, "123");
  }

  {
    let description = {
      type: fcf.STRING,
      length: 5,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, "abcde");
    a_unitest.equal(value, "abcde");
  }

  {
    let description = {
      type: fcf.STRING,
      length: 5,
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, "abcd");
    } catch (e) {
      error = e instanceof fcf.Exception && e.name === "STRING_LENGTH";
    }
    a_unitest.equal(error, true);
  }

  {
    let description = {
      type: fcf.STRING,
      minLength: 3,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, "abc");
    a_unitest.equal(value, "abc");
  }

  {
    let description = {
      type: fcf.STRING,
      minLength: 3,
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, "ab");
    } catch (e) {
      error = e instanceof fcf.Exception && e.name === "STRING_MIN_LENGTH";
    }
    a_unitest.equal(error, true);
  }

  {
    let description = {
      type: fcf.STRING,
      maxLength: 5,
    };
    let type = fcf.type(description);

    let value = fcf.build(type, "abcde");
    a_unitest.equal(value, "abcde");
  }

  {
    let description = {
      type: fcf.STRING,
      maxLength: 5,
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, "abcdef");
    } catch (e) {
      error = e instanceof fcf.Exception && e.name === "STRING_MAX_LENGTH";
    }
    a_unitest.equal(error, true);
  }

  {
    let description = {
      type: fcf.STRING,
      default: "default_val",
    };
    let type = fcf.type(description);

    let value = fcf.build(type, undefined);
    a_unitest.equal(value, "default_val");
  }

  {
    let description = {
      type: fcf.STRING,
      convert: true,
      default: "none",
    };
    let type = fcf.type(description);

    let value = fcf.build(type, null);
    a_unitest.equal(value, "");
  }

  {
    let description = {
      type: fcf.STRING,
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, 123);
    } catch (e) {
      error = true;
    }
    a_unitest.equal(error, true);
  }
});


