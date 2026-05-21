fcf.test("fcf.build", "Function fcf.build - OBJECT", (a_unitest) => {
  //
  // Basic Object tests
  //
  {
    let description = {
      type: fcf.OBJECT,
      fields: {
        name: { type: fcf.STRING, require: true },
        age:  { type: fcf.NUMBER, default: 18 }
      }
    };
    let type = fcf.type(description);

    // Test valid object
    let value = fcf.build(type, { name: "John", age: 25 });
    a_unitest.equal(value.name, "John");
    a_unitest.equal(value.age, 25);

    // Test default value
    let valueWithDefault = fcf.build(type, { name: "Jane" });
    a_unitest.equal(valueWithDefault.name, "Jane");
    a_unitest.equal(valueWithDefault.age, 18);
  }

  //
  // Undeclared fields tests
  //
  {
    let description = {
      type: fcf.OBJECT,
      fields: {
        id: { type: fcf.NUMBER }
      },
      undeclared: false // Disallow extra fields
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, { id: 1, extra: "not allowed" });
    } catch (e) {
      error = e instanceof fcf.Exception && e.name === "UNDECLARED_FIELD";
    }
    a_unitest.equal(error, true);
  }

  {
    let description = {
      type: fcf.OBJECT,
      fields: {
        obj: { 
          type: fcf.ITERABLE,
          item: {
            type:  fcf.OBJECT,
            fields:{
              value: fcf.NUMBER
            }
          }
        }
      },
    };
    let type = fcf.type(description);

    let source = { obj: [{value: 1}, {value: 2}] };
    let value = fcf.build(type, source);
    a_unitest.equal(value, source, true);
    if (value === source){
      a_unitest.error("Invalid link (on object)");
    }
    if (value.obj === source.obj){
      a_unitest.error("Invalid link (on array)");
    }
    if (value.obj[0] === source.obj[0]){
      a_unitest.error("Invalid link (on subobject)");
    }
  }

  {
    let description = {
      type: fcf.OBJECT,
      fields: {
        id: { type: fcf.NUMBER }
      },
      undeclared: { type: fcf.STRING } // All undeclared fields must be strings
    };
    let type = fcf.type(description);

    // Valid undeclared field
    let value = fcf.build(type, { id: 1, note: "hello", tag: "test" });
    a_unitest.equal(value.note, "hello");
    a_unitest.equal(value.tag, "test");

    // Invalid undeclared field (number instead of string)
    let error = false;
    try {
      fcf.build(type, { id: 1, note: 123 });
    } catch (e) {
      error = e instanceof fcf.Exception && e.name === "NOT_MATCH_TYPE";
    }
    a_unitest.equal(error, true);
  }

  //
  // Nested Object tests
  //
  {
    let description = {
      type: fcf.OBJECT,
      fields: {
        user: {
          type: fcf.OBJECT,
          fields: {
            email: { type: fcf.STRING, require: true },
            active: { type: fcf.BOOLEAN, default: true }
          }
        },
        tags: {
          type: fcf.ARRAY,
          item: { type: fcf.STRING }
        }
      }
    };
    let type = fcf.type(description);

    let input = {
      user: { email: "test@example.com" },
      tags: ["admin", "user"]
    };

    let value = fcf.build(type, input);
    a_unitest.equal(value.user.email, "test@example.com");
    a_unitest.equal(value.user.active, true);
    a_unitest.equal(value.tags.length, 2);
    a_unitest.equal(value.tags[0], "admin");
  }

  //
  // Missing required field tests
  //
  {
    let description = {
      type: fcf.OBJECT,
      fields: {
        requiredField: { type: fcf.STRING }
      }
    };
    let type = fcf.type(description);

    let value = fcf.build(type, { otherField: "value" });
    a_unitest.equal(value, {}, true);
  }

  //
  // Missing required field tests
  //
  {
    let description = {
      type: fcf.OBJECT,
      fields: {
        requiredField: { type: fcf.STRING, require: true }
      }
    };
    let type = fcf.type(description);

    let error = false;
    try {
      fcf.build(type, { otherField: "value" });
    } catch (e) {
      error = e instanceof fcf.Exception && e.name === "FIELD_NOT_SET";
    }
    a_unitest.equal(error, true);
  }
});
