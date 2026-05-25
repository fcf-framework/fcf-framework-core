fcf.test("Function fcf.isNature", (a_unitest)=>{
  a_unitest.equal(fcf.isNature(1, fcf.NUMBER), true);
  a_unitest.equal(fcf.isNature(1, [fcf.BOOLEAN, fcf.NUMBER]), true);
  a_unitest.equal(fcf.isNature(1, [fcf.BOOLEAN, "number"]), true);
  a_unitest.equal(fcf.isNature(1, [fcf.BOOLEAN]), false);
  a_unitest.equal(fcf.isNature([], [fcf.BOOLEAN, fcf.NUMBERED]), true);
  a_unitest.equal(fcf.isNature([], [fcf.BOOLEAN, fcf.ITERABLE]), true);
  a_unitest.equal(fcf.isNature({}, [fcf.BOOLEAN, fcf.ITERABLE]), false);
  a_unitest.equal(fcf.isNature("1.2", fcf.NUMBER), false);
  a_unitest.equal(fcf.isNature("1.2", fcf.NUMBER, true), true);
  a_unitest.equal(fcf.isNature("", fcf.NUMBER, true), false);
  a_unitest.equal(fcf.isNature("2023-02-15T09:27:11.440Z", fcf.DATE, true), true);
  a_unitest.equal(fcf.isNature("2023-02-15T09:27:11.440Z", fcf.DATE, false), false);
  a_unitest.equal(fcf.isNature(new Date(), fcf.DATE), true);
  
  a_unitest.equal(fcf.isNumbered("23"), false);
});
