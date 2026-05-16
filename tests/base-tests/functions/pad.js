fcf.test("Function fcf.pad", async (a_unitest)=>{
  a_unitest.equal(fcf.pad("-", 3, false), "-  ");
  a_unitest.equal(fcf.pad("-", 3, false, "l"), "-  ");
  a_unitest.equal(fcf.pad("-", 3, false, "r"), "  -");
  a_unitest.equal(fcf.pad("-", 3, false, "c"), " - ");
  a_unitest.equal(fcf.pad("-", 6, "*+1", "c"), "*+-*+1");
  a_unitest.equal(fcf.pad("-", 8, "*+1", "c"), "*+1-*+1*");
  a_unitest.equal(fcf.pad("-", 1, "*", "c"), "-");
  a_unitest.equal(fcf.pad("log", 7, " ", "c"), "  log  ");
});
