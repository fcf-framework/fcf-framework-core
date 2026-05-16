let libExpress, libBodyParser;
if (fcf.isServer()) {
  libExpress = require("express");
  libBodyParser = require("body-parser");
}


fcf.test("Function fcf.load", async (a_unitest) => {

  // {
  //   let result = await fcf.load("fcf-framework-core:package.json");
  //   console.log(result);
  // }

  {
    let val = await fcf.load(":base-tests/functions/load/data", {format: "json"});
    a_unitest.equal(val, {value: 1});
  }
  {
    let val = await fcf.load(":base-tests/functions/load/data", {format: "auto"});
    a_unitest.equal(val, {value: 1});
  }
  {
    let val = await fcf.load(":base-tests/functions/load/data", {format: "raw"});
    a_unitest.equal(val, "{\n  \"value\": 1\n}\n");
  }
  if (fcf.isServer()) {
    {
      let server = libExpress();
      let listener;
      let port = 8697;
      server.use(libBodyParser.json());
      server.use(libBodyParser.text());
      server.get("/get", (a_req, a_res)=>{
        a_res.send("{\"value\": 2}");
      });
      server.post("/post1", (a_req, a_res)=>{
        a_res.send(`{"value": "${a_req.body.value}"}`);
      });
      server.post("/post2", (a_req, a_res)=>{
        if (fcf.empty(a_req.body))
          a_res.send(`echo: `);
        else
          a_res.send(`echo: ${a_req.body}`);
      });
      await fcf.actions()
      .then((a_res, a_act)=>{
        listener = server.listen(port, () => {
          a_act.complete();
        });
      })
      .then(async () => {
        let val = await fcf.load(`http://127.0.0.1:${port}/get?data=1`, {format: "raw", external: true});
        a_unitest.equal(val, "{\"value\": 2}");
        val = await fcf.load(`http://127.0.0.1:${port}/post1?data=2`, {method: "post", format: "raw", body: {value: 3}, external: "auto"});
        a_unitest.equal(val, "{\"value\": \"3\"}");
        val = await fcf.load(`http://127.0.0.1:${port}/post1?data=3`, {method: "post", format: "auto", body: {value: 3}, external: true});
        a_unitest.equal(val, {value: "3"});
        val = await fcf.load(`http://127.0.0.1:${port}/post1?data=4`, {method: "post", format: "json", body: {value: 3}, external: true});
        a_unitest.equal(val, {value: "3"});
        val = await fcf.load(`http://127.0.0.1:${port}/post2?data=5`, {method: "post", format: "raw", body: "test", external: true});
        a_unitest.equal(val, "echo: test");
        val = await fcf.load(`http://127.0.0.1:${port}/post2?data=6`, {method: "post", format: "raw", external: true});
        a_unitest.equal(val, "echo: ");
        val = await fcf.load(`127.0.0.1:${port}/post2?data=7`, {method: "post", format: "raw", external: true});
        a_unitest.equal(val, "echo: ");
      })
      .finally(()=>{
        if (listener) {
          listener.close();
        }
      })
    }
  }
})
