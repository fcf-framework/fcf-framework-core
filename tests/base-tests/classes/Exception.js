fcf.addException("TEST_EXCEPTION1", "Test exception 1 @{{value}}@");
fcf.addException("TEST_EXCEPTION2", "Test exception 2 @{{value}}@");
fcf.addException("TEST_EXCEPTION3", "Test exception 3 @{{value}}@");

fcf.test("Class fcf.Exception", (a_unitest) => {

  {
  // fcf.addException("TEST_EXCEPTION", "Test exception: @{{value}}@");
  // let error = new fcf.Exception("TEST_EXCEPTION", {value: 1});
  // console.log(error.toString(true));

  }

  {
    let e3 = new fcf.Exception("TEST_EXCEPTION3", {value: "value3"});
    let e2 = new fcf.Exception("TEST_EXCEPTION2", {value: "value2"}, e3);
    let e1 = new fcf.Exception("TEST_EXCEPTION1", {value: "value1"}, e2);

    a_unitest.equal(
      e1.toString(false, true),
      "Test exception 1 value1\n"+
      "    Sub Error: Test exception 2 value2\n"+
      "        Sub Error: Test exception 3 value3"
    );
  }

  {
    let stack = new Error().stack;
    let error = new fcf.Exception("TEST_EXCEPTION1", {value: "value"}, stack);
    a_unitest.equal(fcf.parseStack(error.stack), fcf.parseStack(stack));
    a_unitest.equal(fcf.parseStack(error.stack)[0].line, 28);
    // try {
    //   throw e;
    // } catch(e){
    //   a_unitest.equal(fcf.parseStack(e.stack), fcf.parseStack(stack));
    //   a_unitest.equal(fcf.parseStack(error.stack)[0].line, 28);
    // }
  }
});
