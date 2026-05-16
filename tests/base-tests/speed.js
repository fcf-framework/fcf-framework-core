fcf.test("Speed", (a_unitest)=>{
  let size = 100000;
  {
    let start1 = new Date().getTime();
    for(let i = 0; i < size; ++i) {
      fcf.uuid();
    }
    //console.warn((Date.now() - start1)/size);
  }
});
