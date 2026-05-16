const libExpress = require("express");

fcf.test("Class fcf.RouteInfo", async (a_unitest) => {

  a_unitest.equal(new fcf.RouteInfo("http://test.test///some?test").server, "test.test");
  a_unitest.equal(new fcf.RouteInfo("http://test.test").server, "test.test");
  a_unitest.equal(new fcf.RouteInfo("http://test.test/").server, "test.test");
  a_unitest.equal(new fcf.RouteInfo("http://test.test:8080/").server, "test.test");
  a_unitest.equal(new fcf.RouteInfo("http://test.test:8080/").port, 8080);
  a_unitest.equal(new fcf.RouteInfo("test.test///some?test").server, "");
  a_unitest.equal(new fcf.RouteInfo("http://test.test///some?test").protocol, "http");
  a_unitest.equal(new fcf.RouteInfo("/test.test///some?test").protocol, "");
  a_unitest.equal(new fcf.RouteInfo("http://test.test///some?test").uri, "/some");
  a_unitest.equal(new fcf.RouteInfo("http://test.test///some?test").referer, "http://test.test/some");
  a_unitest.equal(new fcf.RouteInfo("http://test.test///some//?test").uri, "/some");
  a_unitest.equal(new fcf.RouteInfo("http://test.test///some//test?test").uri, "/some/test");
  a_unitest.equal(new fcf.RouteInfo("http://test.test///some//test///.//?test").uri, "/some/test");
  a_unitest.equal(new fcf.RouteInfo("http://test.test///some//test///..//?test").uri, "/some");
  a_unitest.equal(new fcf.RouteInfo("http://test.test///some//test///..//?test").referer, "http://test.test/some");
  a_unitest.equal(new fcf.RouteInfo("http://test.test").uri, "/");
  a_unitest.equal(new fcf.RouteInfo("http://test.test").referer, "http://test.test");
  a_unitest.equal(new fcf.RouteInfo("http://test.test/").uri, "/");
  a_unitest.equal(new fcf.RouteInfo("http://test.test/").referer, "http://test.test");
  a_unitest.equal(new fcf.RouteInfo("http://test.test/").referer, "http://test.test");
  a_unitest.equal(new fcf.RouteInfo("http://test.test").referer, "http://test.test");
  a_unitest.equal(new fcf.RouteInfo("http://test.test//..//test/").referer, "http://test.test/test");
  a_unitest.equal(new fcf.RouteInfo("http://test.test//..//test/").uri, "/test");
  a_unitest.equal(new fcf.RouteInfo("http://test.test:8080//..//test/").referer, "http://test.test:8080/test");
  a_unitest.equal(new fcf.RouteInfo("test.test//.//test/").referer, "test.test/test");
  a_unitest.equal(new fcf.RouteInfo("test.test//.//test/", "root").referer, "/test.test/test");
  a_unitest.equal(new fcf.RouteInfo("test.test//.//test/?q", "root").url, "/test.test/test?q");
  a_unitest.equal(new fcf.RouteInfo("/test.test//.//test/").referer, "/test.test/test");
  a_unitest.equal(new fcf.RouteInfo("/test.test//..//test/").referer, "/test");
  a_unitest.equal(new fcf.RouteInfo("/test.test//..//test/?test=1").urlArgs, {test:1});
  a_unitest.equal("test" in new fcf.RouteInfo("/test.test//..//test/?test").urlArgs, true);
  a_unitest.equal(new fcf.RouteInfo("/test.test//..//test/?test1=1&test2=2").urlArgs, {test1:1, test2:2});
  a_unitest.equal(new fcf.RouteInfo("http://test.test:50//..//test/?test1=1&test2=2#asd").url, "http://test.test:50/test?test1=1&test2=2#asd");
  a_unitest.equal(new fcf.RouteInfo("http://test.test:50//..//test/?test1=1&test2=2").url, "http://test.test:50/test?test1=1&test2=2");
  a_unitest.equal(new fcf.RouteInfo("http://test.test:50//..//test/#1").url, "http://test.test:50/test#1");
  a_unitest.equal(new fcf.RouteInfo("http://test.test:50//..//test/?#1").url, "http://test.test:50/test#1");
  a_unitest.equal(new fcf.RouteInfo("http://test.test:50//..//test/?test={\"val\":1}#1").args.test, {val: 1});
  a_unitest.equal(new fcf.RouteInfo("http://test.test:50//..//test/?test={\"val\":1}#1").urlArgsRaw.test, "{\"val\":1}");
  a_unitest.equal(
    new fcf.RouteInfo("/test.test:50//./test/?test={\"val\":1}#1"),
    {
      "url": "/test.test:50/test?test={\"val\":1}#1",
      "referer": "/test.test:50/test",
      "uri": "/test.test:50/test",
      "urlArgs": {
        "test": {
          "val": 1
        }
      },
      "urlArgsRaw": {
        "test": "{\"val\":1}"
      },
      "urlArgsStr": "test={\"val\":1}",
      "postArgs": {},
      "postArgsRaw": {},
      "args": {
        "test": {
          "val": 1
        }
      },
      "argsRaw": {
        "test": "{\"val\":1}"
      },
      "subUri": "",
      "anchor": "1",
      "server": "",
      "protocol": ""
    }
  );
  a_unitest.equal(
    new fcf.RouteInfo("test.test:50//./test/?test={\"val\":1}#1", "root"),
    {
      "url": "/test.test:50/test?test={\"val\":1}#1",
      "referer": "/test.test:50/test",
      "uri": "/test.test:50/test",
      "urlArgs": {
        "test": {
          "val": 1
        }
      },
      "urlArgsRaw": {
        "test": "{\"val\":1}"
      },
      "urlArgsStr": "test={\"val\":1}",
      "postArgs": {},
      "postArgsRaw": {},
      "args": {
        "test": {
          "val": 1
        }
      },
      "argsRaw": {
        "test": "{\"val\":1}"
      },
      "subUri": "",
      "anchor": "1",
      "server": "",
      "protocol": ""
    }
  );
  a_unitest.equal(
    new fcf.RouteInfo("test.test:50//./test/?test={\"val\":1}#1", "server"),
    {
      "url": "http://test.test:50/test?test={\"val\":1}#1",
      "referer": "http://test.test:50/test",
      "uri": "/test",
      "urlArgs": {
        "test": {
          "val": 1
        }
      },
      "urlArgsRaw": {
        "test": "{\"val\":1}"
      },
      "urlArgsStr": "test={\"val\":1}",
      "postArgs": {},
      "postArgsRaw": {},
      "args": {
        "test": {
          "val": 1
        }
      },
      "argsRaw": {
        "test": "{\"val\":1}"
      },
      "subUri": "",
      "anchor": "1",
      "server": "test.test",
      "port":  50,
      "protocol": "http"
    }
  );
  a_unitest.equal(
    new fcf.RouteInfo("/test.test:50//./test/?test={\"val\":1}#1", "server"),
    {
      "url": "http://test.test:50/test?test={\"val\":1}#1",
      "referer": "http://test.test:50/test",
      "uri": "/test",
      "urlArgs": {
        "test": {
          "val": 1
        }
      },
      "urlArgsRaw": {
        "test": "{\"val\":1}"
      },
      "urlArgsStr": "test={\"val\":1}",
      "postArgs": {},
      "postArgsRaw": {},
      "args": {
        "test": {
          "val": 1
        }
      },
      "argsRaw": {
        "test": "{\"val\":1}"
      },
      "subUri": "",
      "anchor": "1",
      "server": "test.test",
      "port":  50,
      "protocol": "http"
    }
  );
  a_unitest.equal(
    new fcf.RouteInfo("test.test:50//./test/?test={\"val\":1}#1"),
    {
      "url": "test.test:50/test?test={\"val\":1}#1",
      "referer": "test.test:50/test",
      "uri": "test.test:50/test",
      "urlArgs": {
        "test": {
          "val": 1
        }
      },
      "urlArgsRaw": {
        "test": "{\"val\":1}"
      },
      "urlArgsStr": "test={\"val\":1}",
      "postArgs": {},
      "postArgsRaw": {},
      "args": {
        "test": {
          "val": 1
        }
      },
      "argsRaw": {
        "test": "{\"val\":1}"
      },
      "subUri": "",
      "anchor": "1",
      "server": "",
      "protocol": ""
    }
  );
  a_unitest.equal(
    new fcf.RouteInfo("test?test={\"val\":1}#1"),
    {
      "url": "test?test={\"val\":1}#1",
      "referer": "test",
      "uri": "test",
      "urlArgs": {
        "test": {
          "val": 1
        }
      },
      "urlArgsRaw": {
        "test": "{\"val\":1}"
      },
      "urlArgsStr": "test={\"val\":1}",
      "postArgs": {},
      "postArgsRaw": {},
      "args": {
        "test": {
          "val": 1
        }
      },
      "argsRaw": {
        "test": "{\"val\":1}"
      },
      "subUri": "",
      "anchor": "1",
      "server": "",
      "protocol": ""
    }
  );
  a_unitest.equal(
    new fcf.RouteInfo("test?test={\"val\":1}#1", "root"),
    {
      "url": "/test?test={\"val\":1}#1",
      "referer": "/test",
      "uri": "/test",
      "urlArgs": {
        "test": {
          "val": 1
        }
      },
      "urlArgsRaw": {
        "test": "{\"val\":1}"
      },
      "urlArgsStr": "test={\"val\":1}",
      "postArgs": {},
      "postArgsRaw": {},
      "args": {
        "test": {
          "val": 1
        }
      },
      "argsRaw": {
        "test": "{\"val\":1}"
      },
      "subUri": "",
      "anchor": "1",
      "server": "",
      "protocol": ""
    }
  );

});
