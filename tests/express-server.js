#!/usr/bin/env node
let fcf = require("fcf-framework-core");
let libModule = require("module");
let libPath = require("path");
let nodePath = (process.env.NODE_PATH ? process.env.NODE_PATH : "").split(":");
nodePath.unshift(libPath.dirname(__dirname));
process.env.NODE_PATH = nodePath.join(":");
libModule.Module._initPaths();

let libExpress = require("express");

let server = libExpress();

let port = 8080;

for(let i = 0; i < process.argv.length; ++i){
  if (process.argv[i] == "--port" && process.argv[i+1]){
    port = process.argv[i+1];
  }
}

server.use('*', (req, res, next) => {
  if (req.headers["cookie"]) {
    let context = req.headers["cookie"].split(";")
                  .map((a_item)=>{
                    a_item = fcf.trim(a_item);
                    let p = a_item.indexOf("=");
                    return [a_item.substring(0, p), a_item.substring(p+1)];
                  })
                  .find((a_item)=>{ return a_item[0] == "fcf-context"; });
    if (context) {
      try {
         context = JSON.parse(fcf.decodeBase64(decodeURIComponent(context[1])));
      } catch(e) {
        console.error("Failed to read context");
      }
    }
  }
  next();
});


server.use("/",
          libExpress.static(libPath.join(__dirname, 'public')));
server.use("/unitests",
          libExpress.static(libPath.join(__dirname, 'public')));
server.use("/base-tests",
          libExpress.static(libPath.join(__dirname, 'base-tests')));
server.use("/node_modules/fcf-framework-core",
          libExpress.static(libPath.join(libPath.dirname(__dirname), 'fcf-framework-core')));
server.use("/node_modules/fcf-framework-unitest",
          libExpress.static(libPath.join(libPath.dirname(__dirname), 'fcf-framework-unitest')));
server.use("/node_modules",
          libExpress.static(libPath.join(__dirname, 'node_modules')));

server.get('/', (req, res) => {
  res.sendFile(process.cwd()+"/public/index.html");
});

server.use('*', (req, res, next) => {
  fcf.getContext().testValue = "value-4";
  fcf.getContext().language = "ru";
  fcf.saveContext(res);
  next();
});

server.listen(port, () => {
  console.log(`Start listing on ${port} port`);
});
