fcf.test("Function fcf.normalizePath", (a_unitest)=>{
  a_unitest.equal(fcf.normalizePath("/../", true), "/");
  a_unitest.equal(fcf.normalizePath("/..", true), "/");
  a_unitest.equal(fcf.normalizePath("/", true), "/");
  a_unitest.equal(fcf.normalizePath("/some/../file", true), "/file");
  a_unitest.equal(fcf.normalizePath("/some\\..\\file", true), "/file");
  a_unitest.equal(fcf.normalizePath("/../", true), "/");
  a_unitest.equal(fcf.normalizePath("../", true), "");
  a_unitest.equal(fcf.normalizePath("C:\\../", true), "C:\\");
  a_unitest.equal(fcf.normalizePath("C:\\..\\some", true), "C:\\some");
  a_unitest.equal(fcf.normalizePath("C:\\..\\some\\.\\\\", true), "C:\\some");
  a_unitest.equal(fcf.normalizePath("C:\\..\\some\\..\\\\", true), "C:\\");
  a_unitest.equal(fcf.normalizePath("C:\\..\\some\\..\\\\file", true), "C:\\file");
  a_unitest.equal(fcf.normalizePath("http://domain.org/../1", false), "http://domain.org/1");
  a_unitest.equal(fcf.normalizePath("http://domain.org/../1?test=../../1", false), "http://domain.org/1?test=../../1");
  a_unitest.equal(fcf.normalizePath("http://domain.org/../1/../2", false), "http://domain.org/2");
  a_unitest.equal(fcf.normalizePath("http://domain.org/../1/.././2/./", false), "http://domain.org/2");
  a_unitest.equal(fcf.normalizePath("module:./file", true), "module:file");
  a_unitest.equal(fcf.normalizePath("module:/../file", true), "module:file");
  a_unitest.equal(fcf.normalizePath("module:dir/./file", true), "module:dir/file");
  a_unitest.equal(fcf.normalizePath("module:dir/../file", true), "module:file");
  a_unitest.equal(fcf.normalizePath("mo/../dule:dir/../file", true), "file");
  a_unitest.equal(fcf.normalizePath("module:\\dir/../file", true), "module:file");
  a_unitest.equal(fcf.normalizePath("module:///../file", true), "module:file");
  a_unitest.equal(fcf.normalizePath("http://localhost:8080/../a", false), "http://localhost:8080/a");


  a_unitest.equal(fcf.normalizeSubpath("http://localhost:8080/../a", false), "http:/a");
  a_unitest.equal(fcf.normalizeSubpath("module../..///localhost:8080/../a", false), "a");
  a_unitest.equal(fcf.normalizeSubpath("module../..//../a/../", false), "");


  {
    let result = fcf.normalizePath("package-name:dir/////file.txt");
    a_unitest.equal(result, "package-name:dir/file.txt");
    // console.log(result)
  }
  {
    let result = fcf.normalizePath("package-name:dir/./file.txt");
    a_unitest.equal(result, "package-name:dir/file.txt");
    // console.log(result)
  }
  {
    let result = fcf.normalizePath("package-name:dir/../../file.txt");
    a_unitest.equal(result, "package-name:file.txt");
    // console.log(result)
  }
  {
    let result = fcf.normalizePath("http://domain/dir/../../file.txt", false);
    a_unitest.equal(result, "http://domain/file.txt");
    // console.log(result)
  }
  {
    let result = fcf.normalizePath("C:\\/dir/../../dir2\\file.txt", true);
    a_unitest.equal(result, "C:\\dir2/file.txt");
    // console.log(result)
  }



  {
    let result = fcf.normalizeSubpath("directory/../../file.txt");
    a_unitest.equal(result, "file.txt");
    //console.log(result);
  }
  {
    let result = fcf.normalizeSubpath("directory/./file.txt");
    a_unitest.equal(result, "directory/file.txt");
    //console.log(result);
  }
  {
    let result = fcf.normalizeSubpath("directory/////////file.txt");
    a_unitest.equal(result, "directory/file.txt");
    //console.log(result);
  }


});
