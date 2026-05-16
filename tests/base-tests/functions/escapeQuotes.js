fcf.test("Function fcf.escapeQuotes", (a_unitest) => {
  {
    let result = fcf.escapeQuotes("test string 1: \\ \" ' ");
    a_unitest.equal(result, `test string 1: \\\\ \\" \\' `);
    // console.log(result);
  }
  {
    let result = fcf.escapeQuotes("test string 2: \\ \" ' ", "\"");
    a_unitest.equal(result, `test string 2: \\\\ \\" ' `);
    // console.log(result);
  }
  {
    let result = fcf.escapeQuotes("test string 3: \\ \" ' ", "'");
    a_unitest.equal(result, `test string 3: \\\\ " \\' `);
    // console.log(result);
  }
  {
    let result = fcf.escapeQuotes("test string 4: \\ \" ' `", "`");
    a_unitest.equal(result, `test string 4: \\\\ " ' \\\``);
    // console.log(result);
  }
  {
    let result = fcf.escapeQuotes("test string 5: \\ \" ' `", ["\"", "'", "`"]);
    a_unitest.equal(result, `test string 5: \\\\ \\" \\' \\\``);
    // console.log(result);
  }
});
