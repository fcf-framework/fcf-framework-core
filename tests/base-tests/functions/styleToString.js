fcf.test("Function fcf.styleToString", (a_unitest)=>{
{
  let result = fcf.styleToString("color", "#aaa");
  a_unitest.equal(result, "color: #aaa");
  //console.log(result);
}
{
  let result = fcf.styleToString("width", 10);
  a_unitest.equal(result, "width: 10px");
  //console.log(result);
}
{
  let result = fcf.styleToString({"width": 10, "color": "#aaa"});
  a_unitest.equal(result, "width: 10px; color: #aaa");
  //console.log(result);
}
});
