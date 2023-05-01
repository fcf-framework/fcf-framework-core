const libHttp = require('node:http');
const libHttps = require('node:https');

module.exports = (a_url, a_options)=>{
  a_options = a_options || {};
  return fcf.actions()
  .then((a_res, a_act)=>{
    let ri = new fcf.RouteInfo(a_url, "server");
    let foundContentType = false;
    if (typeof a_options.header === "object") {
      for(let k in a_options.header) {
        if (k.toLowerCase() == "content-type"){
          foundContentType = true;
          break;
        }
      }
    }
    let header = {};
    let body = a_options.body;
    if (body !== undefined && body !== null) {
      if (typeof body !== "string") {
        header["Content-Type"] = "application/json";
        body = JSON.stringify(body);
      } else {
        header["Content-Type"] = "text/plain";
      }
    }
    header["Content-Length"] = typeof body === "string" ? Buffer.byteLength(body) : 0;
    let options = {
      hostname: ri.server,
      port:     ri.port ? ri.port : (ri.protocol == "https" ? 443 : 80),
      path:     ri.uri + (ri.urlArgsStr ? "?" + ri.urlArgsStr : ""),
      method:   a_options.method ? a_options.method.toUpperCase() : "GET",
      headers:  fcf.append(
                  {},
                  a_options.header,
                  header
                )
    };
    let libQuery = ri.protocol == "https" ? libHttps : libHttp;
    let request = libQuery.request(options, (a_res) => {
      let data = "";
      a_res.setEncoding("utf8");
      a_res.on("data", (a_part)=>{
        data += a_part;
      });
      a_res.on("end", ()=>{
        if (a_res.statusCode == 200) {
          a_act.complete(data);
        } else {
          let error = data;
          try {
            error = JSON.parse(error);
          } catch(e) {
          }
          if (typeof error !== "object" || !error._templateMessage) {
            error = new fcf.Exception("HTTP_REQUEST_ERROR", {code: a_res.statusCode});
          } else {
            error = new fcf.Exception(error);
          }
          a_act.error(error);
        }
      });
    });
    request.on("error", (a_error)=>{
      a_act.error(a_error);
    });
    if (typeof body == "string") {
      request.write(body);
    }
    request.end();
  })
};
