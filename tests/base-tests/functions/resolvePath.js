fcf.test("Function fcf.resolvePath", (a_unitest)=>{
  fcf.getConfiguration().append({
    aliases: {
      "controls:button": "fcf-framework-controls:templates/button.tmpl",
    }
  });
  {
    let result = fcf.resolvePath("@controls:button");
    a_unitest.equal(result, "fcf-framework-controls:templates/button.tmpl")
    // console.log(result);
  }
  {
    let result = fcf.resolvePath("@controls:button?query-arument=1");
    a_unitest.equal(result, "fcf-framework-controls:templates/button.tmpl?query-arument=1")
    // console.log(result);
  }
  {
    let result = fcf.resolvePath("@controls:textarea", {"controls:textarea": "fcf-framework-controls:templates/textarea.tmpl" });
    a_unitest.equal(result, "fcf-framework-controls:templates/textarea.tmpl")
    // console.log(result);
  }
});
