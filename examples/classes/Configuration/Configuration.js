//
// This is solely for importing a module from the current directory.
const libPath = require('path');
const libModule = require("module");
let splitter    = process.platform == "win32" ? ";" : ":";
let paths       = !process.env.NODE_PATH ? [] : process.env.NODE_PATH.split(splitter);
paths.unshift(libPath.join(__dirname, '../../../..'));
process.env.NODE_PATH = paths.join(splitter);
libModule.Module._initPaths();

const fcf = require("fcf-framework-core");

/**
 * Example 0: Using the constructor without parameters
 * Creates a new configuration object with default settings.
 */
{
  fcf.log.log("APP", "--- Example 0: Empty constructor ---");

  const config = new fcf.Configuration();

  config.append({
    theme: "dark",
    version: 1
  });

  fcf.log.log("APP", "Theme:", config.theme);
  fcf.log.log("APP", "Version:", config.version);
}

/**
 * Example 1: Passing merge rules directly via constructor
 * We immediately say: "if you see the 'plugins' field,
 * use fcf.append" to merge it with the current value.
 */
{
  fcf.log.log("APP", "--- Example 1: Direct 'merge' rules ---");

  const config = new fcf.Configuration({
    merge: {
      "plugins": "fcf.append",
      "metadata.tags": "fcf.append" // Deep paths can be specified via dot notation
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

  fcf.log.log("APP", "Plugins:", config.plugins); 
  fcf.log.log("APP", "Tags:", config.metadata.tags); 
}

/**
 * Example 2: Using the mergeParamNames parameter
 * mergeParamNames specifies property names that will be treated as
 * a configuration object for merging.
 */
{
  fcf.log.log("APP", "--- Example 2: mergeParamNames + merge ---");

  // Register a custom function for the example
  (typeof global !== 'undefined' ? global : window).myCustomMerge = (a_cur, a_src) => {
    return fcf.str(a_cur) + " | " + fcf.str(a_src);
  };

  const config = new fcf.Configuration({
    // We specify that the 'ex_merge' field contains a configuration object
    // with field merge rules.
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

/**
 * Example 3: Using merge with an external file (via 'file' property).
 * This demonstrates how fcf can automatically load a file
 * containing the merge function if it is not found in the global scope.
 */
{
  fcf.log.log("APP", "--- Example 3: Merge via external file ---");

  const config = new fcf.Configuration({
    merge: {
      "counters": {
        function: "fcf.sumNumbers", 
        file: "merge_helpers.js" // Path in FCF format, 
                                 // relative paths are allowed 
                                 // since loading is performed via fcf.require
      }
    }
  });

  // Suppose fcf.sumNumbers is defined in the file above
  // For testing, we create it right here to make the example working
  fcf.sumNumbers = (a_cur, a_src) => (a_cur || 0) + (a_src || 0);

  config.append({ counters: 10 });
  config.append({ counters: 5 });

  fcf.log.log("APP", "Counters:", config.counters);
}

/**
 * Example 4: Full combination: enableDefaultParams + merge + mergeParamNames.
 * The most powerful scenario: take default framework parameters and apply our own merge rules.
 */
{
  fcf.log.log("APP", "--- Example 4: Full Power (Defaults + Merge + ParamNames) ---");

  const config = new fcf.Configuration({
    enableDefaultParams: true,                           // Load base settings (aliases, translations, etc.)
    mergeParamNames:     ["aliases_merge_instructions"], // Specify that aliases_merge_instructions 
                                                        // contains merge rules
  });

  // There might already be some aliases in defaults. Let's add our own.
  config.append({
    aliases_merge_instructions:{      // Object containing field merge rules
      "web_aliases": "fcf.append"     // Use append to merge aliases
    },
    web_aliases: {
      "my_app:home": "/index.html"
    }
  });

  config.append({
    web_aliases: {
      "my_app:about": "/about.html"
    }
  });
  // Contains both default and our new aliases
  fcf.log.log("APP", "Config keys:", Object.keys(config));
  fcf.log.log("APP", "Merged Aliases:", config.web_aliases);
}