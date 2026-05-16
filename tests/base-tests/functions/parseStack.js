fcf.test("Function fcf.parseStack", (a_unitest) => {
  function callStack() {
    return new Error();
  }
  let stackInfo = fcf.parseStack(callStack());
  separator = fcf.isServer() && process.platform == "win32" ? "\\" : "/";
  a_unitest.notEqual(stackInfo[0].function.indexOf("callStack"), -1);
  a_unitest.notEqual(stackInfo[0].file.indexOf(separator + "parseStack.js"), -1);
  a_unitest.equal(stackInfo[0].line, 3);
  a_unitest.equal(stackInfo[0].column, 12);
})
