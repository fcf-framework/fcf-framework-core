fcf.module({
  name: ":base-tests/classes/ConfigurationMergeFunctions.js",
  module: ()=>{
    fcf.prepare(fcf, "NTest").mergeAppend = (a_current, a_source)=>{
      return fcf.append(a_current, a_source);
    }
  }
});
