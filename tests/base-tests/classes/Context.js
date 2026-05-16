let libExpress = require("express");

fcf.test("Class fcf.Context", async (a_unitest)=>{

  fcf.getConfiguration().append({
    "host": "127.0.0.1",
  });

  {
    function printValue() {
      a_unitest.equal(fcf.getContext().value, 1);
      //console.log(fcf.getContext().value);
    }
    let context = new fcf.Context();
    context.value = 1;
    fcf.setContext(context);
    await new Promise((a_resolve)=>{
      a_resolve();
    });
    printValue();
  }

  {
    let context = new fcf.Context();
    context.language = "ja1";
    fcf.setContext(context);
    let actions = fcf.actions();
    let startId = fcf.require("async_hooks").result()[0].executionAsyncId();
    let endId;
    await (actions.then(()=>{}));
    a_unitest.equal(fcf.getContext().language, "ja1");
  }

  let server = libExpress();
  let listener;
  let port = 8697;
  server.use(libExpress.json());
  server.post("/index1", (a_req, a_res) => {
    fcf.setContext( new fcf.Context(a_req) );
    a_unitest.equal(fcf.getContext().route.url, "/index1?data=1");
    a_res.send(
      JSON.stringify(
        {
          test: fcf.getContext().test,
          data: fcf.getContext().route.urlArgs.data,
          postVariable: fcf.getContext().route.postArgs.postVariable
        }
      )
    );
  });



  {
    let libExpress = require("express");
    let server = libExpress();
    server.use(libExpress.json());
    server.get("/index1", (a_req, a_res) => {
      fcf.setContext(
        new fcf.Context({
          url:      a_req.originalUrl,
          postArgs: a_req.body,
          context:  a_req.headers["fcf-context"],
        })
      );
      // console.log("URL:", fcf.getContext().route.url);
      // console.log("Context data:", fcf.getContext().data);
      a_res.send("");
    });
    let listener;
    await fcf.actions()
    .then((a_res, a_act)=>{
       listener = server.listen(8697, ()=>{
        a_act.complete();
      });
    })
    .then(async ()=>{
      fcf.getContext().data = "value";
      await fcf.load("http://127.0.0.1:8697/index1?data=1", {external: true});
    })
    .finally(()=>{
      if (listener){
        listener.close();
      }
    });
  }


  server.post("/index2", (a_req, a_res) => {
    let context = new fcf.Context({
      url:      a_req.originalUrl,
      postArgs: a_req.body,
      context:  a_req.headers["fcf-context"],
    });
    a_res.send(
      JSON.stringify(
        {
          test:         context.test,
          data:         context.route.urlArgs.data,
          postVariable: context.route.postArgs.postVariable
        }
      )
    );
  });

  server.post("/index3", (a_req, a_res) => {
    let context = new fcf.Context({
      url:      a_req.originalUrl,
      postArgs: a_req.body,
      context:  {test: 1},
    });
    a_res.send(
      JSON.stringify(
        {
          test:         context.test,
          data:         context.route.urlArgs.data,
          postVariable: context.route.postArgs.postVariable
        }
      )
    );
  });

  await fcf.actions()
  .then((a_res, a_act)=>{
    listener = server.listen(port, () => {
      a_act.complete();
    });
  })
  .then(async ()=>{
    fcf.getContext().test = 1;
    {
      let val = await fcf.load(`http://127.0.0.1:${port}/index1?data=1`, { body: {postVariable: 1}, method: "POST",  format: "json", external: true });
        a_unitest.equal(val, {test: 1, data: 1, postVariable: 1});
    }
    {
      let val = await fcf.load(`http://127.0.0.1:${port}/index2?data=1`, { body: {postVariable: 1}, method: "POST",  format: "json", external: true });
        a_unitest.equal(val, {test: 1, data: 1, postVariable: 1});
    }
    {
      let val = await fcf.load(`http://127.0.0.1:${port}/index3?data=1`, { body: {postVariable: 1}, method: "POST",  format: "json", external: true });
        a_unitest.equal(val, {test: 1, data: 1, postVariable: 1});
    }
  })
  .finally(()=>{
    if (listener) {
      listener.close();
    }
  });

  {
    let context1 = new fcf.Context();
    context1.index = 1;
    fcf.setContext(context1);
    let state1 = fcf.clone(fcf.getState());

    let context2 = new fcf.Context();
    context2.index = 2;
    fcf.setContext(context2);
    let state2 = fcf.clone(fcf.getState());
    fcf.setState(state2);

    await (new Promise((a_resolve)=>{
      fcf.setState(state1);
      a_unitest.equal(fcf.getContext().index, 1);
      a_resolve();
    }));

    a_unitest.equal(fcf.getContext().index, 2);
  }

  {
    let context1 = new fcf.Context();
    context1.index = 1;
    fcf.setContext(context1);

    let context2 = new fcf.Context();
    context2.index = 2;
    fcf.setContext(context2);

    await (new Promise((a_resolve)=>{
      fcf.setContext(context1);
      a_unitest.equal(fcf.getContext().index, 1);
      a_resolve();
    }));

    a_unitest.equal(fcf.getContext().index, 2);
  }

  {
    let context1 = new fcf.Context();
    context1.index = 1;
    fcf.setContext(context1);

    let context2 = new fcf.Context();
    context2.index = 2;
    fcf.setContext(context2);

    (new fcf.Actions().then(()=>{
      fcf.setContext(context1);
      a_unitest.equal(fcf.getContext().index, 1);
    }));

    a_unitest.equal(fcf.getContext().index, 2);
  }



});
