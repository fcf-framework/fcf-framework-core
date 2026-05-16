fcf.test("Function fcf.NDetails.getEqualitiesExpression", (a_unitest)=>{
  var IE = require("fcf-framework-core/NDetails/inlineExecution.js");
  var res = IE.getEqualitiesExpression("(var1[\"info\"][1] == 1) && test == 3");
  a_unitest.equal(
    res,
    {
     "[\"var1\"][\"info\"][\"1\"]" : 1,
     "[\"test\"]" : 3
    }
  );
  var res = IE.getEqualitiesExpression("var1[\"info\"][1] == 1");
  a_unitest.equal(
    res,
    {
     "[\"var1\"][\"info\"][\"1\"]" : 1,
    }
  );
  var res = IE.getEqualitiesExpression("(var1[\"info\"][1] == 1) && (test == 3  || test == 4) ");
  a_unitest.equal(
    res,
    {
     "[\"var1\"][\"info\"][\"1\"]" : 1,
    }
  );
  var res = IE.getEqualitiesExpression("(var1[\"info\"][1] == 1.2) && (test2 == 2 && (test == 3  || test == 4)) ");
  a_unitest.equal(
    res,
    {
     "[\"var1\"][\"info\"][\"1\"]" : 1.2,
     "[\"test2\"]": 2,
    }
  );
  var res = IE.getEqualitiesExpression("var1.info[1] == 1 && test2 == test1");
  a_unitest.equal(
    res,
    {
     "[\"var1\"][\"info\"][\"1\"]" : 1,
    }
  );
 
});
