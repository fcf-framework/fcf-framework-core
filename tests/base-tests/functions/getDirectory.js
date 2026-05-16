fcf.test("Function fcf.getDirectory", (a_unitest)=>{
{
  let result = fcf.getDirectory("/directory/file.txt");
  a_unitest.equal(result, "/directory")
  //console.warn(result);
}
{
  let result = fcf.getDirectory("C:\\directory1\\directory2\\file.txt");
  a_unitest.equal(result, "C:\\directory1\\directory2")
  //console.warn(result);
}
});
