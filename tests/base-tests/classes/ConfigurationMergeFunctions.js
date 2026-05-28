fcf.module({
  name: ":base-tests/classes/ConfigurationMergeFunctions.js",
  module: ()=>{

    fcf.test("Class fcf.Configuration (merge)", (a_unitest)=> {
      {
        const config = new fcf.Configuration({
          merge: {
            "plugins": "fcf.append",
            "metadata.tags": "fcf.append" // You can specify deep paths through a dot
          }
        });

        config.append({
          plugins: ["auth"],
          metadata: { tags: ["v1"] }
        });

        config.append({
          plugins: ["logger"],
          metadata: { tags: ["stable"] }
        });

        a_unitest.equal(config.plugins, ["auth", "logger"]);
        a_unitest.equal(config.metadata.tags, ["v1", "stable"]);
      }
      {
        // Регистрируем кастомную функцию для примера
        (typeof global !== 'undefined' ? global : window).myCustomMerge = (a_curr, a_src) => {
          return (a_curr || "") + " | " + (a_src || "");
        };

        const config = new fcf.Configuration({
          mergeParamNames: ["ex_merge"],
        });

        config.append({
          ex_merge: {
            "version_string": "myCustomMerge",
          },
          version_string: "1.0" 
        });
        config.append({ version_string: "2.0" });

        fcf.log.log("APP", "Version:", config.version_string);

      }
    });
  }
});
