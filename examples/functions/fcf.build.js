#!/usr/bin/env node

//
// This is solely for importing a module from the current directory.
const libPath = require('path');
const libModule = require("module");
let splitter    = process.platform == "win32" ? ";" : ":";
let paths       = !process.env.NODE_PATH ? [] : process.env.NODE_PATH.split(splitter);
paths.unshift(libPath.join(__dirname, '../../..'));
process.env.NODE_PATH = paths.join(splitter);
libModule.Module._initPaths();

let fcf = require("fcf-framework-core");

// The example of assembling values of type number.
{
  let description = {
    type:    fcf.NUMBER,
  };

  let type = fcf.type(description);

  let value = fcf.build(type, 1);
  fcf.log.log("APP", value);
}

// Example of assembly of an invalid value for the number type.
{
  let description = {
    type:    fcf.NUMBER,
  };

  let type = fcf.type(description);

  try {
    let value = fcf.build(type, "1");
  } catch (e){
    fcf.log.err("APP", e.message);
  }
}

// Example of an invalid value for the number type with conversion support
{
  let description = {
    type:    fcf.NUMBER,
    convert: true,
  };

  let type = fcf.type(description);

  let value = fcf.build(type, "1");
  fcf.log.log("APP", value);
}

// Example of constructing an enum value.
{
  let description = {
    type:    fcf.ENUM,
    items:   ["none", "first", "second"],
  };

  let type = fcf.type(description);

  let value = fcf.build(type, "none");
  fcf.log.log("APP", value);
}

// Example of constructing an enum value
// with substitution in case of a type mismatch.
{
  let description = {
    type:    fcf.ENUM,
    items:   ["none", "first", "second"],
    default: "none" // We specify a default value.
                    // This value will be substituted in the
                    // event of a mismatch in the input data.
                    // In the event of an error, an exception is not thrown in the `build` method;
                    // instead, the value from the `default` property is substituted.
  };

  let type = fcf.type(description);

  let value = fcf.build(type, "error_value");
  fcf.log.log("APP", value);
}


// An example of value construction with exception handling.
{
  let description = {
    type:    fcf.ENUM,
    items:   ["none", "first", "second"],
  };

  let type = fcf.type(description);

  try {
    let value = fcf.build(type, "error_value");
  } catch (e){
    fcf.log.err("APP", e.message);
  }
}

{
let fcf = require("fcf-framework-core");

let type = fcf.type("object",
                    {
                      fields: {
                        id: { type: "number", require: true }, // Mark these fields as required, indicating flag require = true.
                        tags: { type: "array", item: "string" },
                        settings: {
                          type: "object",
                          fields: {
                            active: { type: "boolean", default: true }
                          },
                          default: { active: true } // If this property was a mistake or it was absent, the default value is set.
                        }
                      },
                      undeclared: false // We prohibit the presence of unannounced fields in this structure.
                    }
                  );

let input = { id: 1, tags: ["admin", "user"] };
let result = fcf.build(type, input);
fcf.log.log("APP", "These settings fields are not passed:");
fcf.log.log("APP", result);

input = { id: 1, settings: { active: "error_value"} };
result = fcf.build(type, input);
fcf.log.log("APP", "Transmission of invalid data:");
fcf.log.log("APP", result);

input = { id: 1, tags: ["admin", "user"], settings: {active: false} };
result = fcf.build(type, input);
fcf.log.log("APP", "Transmission of valid data:");
fcf.log.log("APP", result);

}
