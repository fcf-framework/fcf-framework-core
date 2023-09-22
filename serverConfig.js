module.exports = {
  tokenize: {
    objects: {
      "Date":           "Date",
      "Array":          "Array",
      "Math":           "Math",
      "RegExp":         "RegExp",
      "fcf.UNDEFINED":  true,
      "fcf.NULL":       true,
      "fcf.NAN":        true,
      "fcf.BOOLEAN":    true,
      "fcf.NUMBER":     true,
      "fcf.STRING":     true,
      "fcf.DATE":       true,
      "fcf.OBJECT":     true,
      "fcf.ARRAY":      true,
      "fcf.ITERABLE":   true,
      "fcf.NUMBERED":   true,
    },
    functions: [
      {
        object: "",
        allow: ["parseFloat", "parseInt", "isNaN", "Error", "String", "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent", "isFinite", "Number"],
      },
      {
        object: "fcf",
        allow: ["isServer", "escapeQuotes", "str", "unescape", "replaceAll", "decodeHtml", "encodeHtml", "stripTags",
                "ltrim", "rtrim", "trim", "pad", "id", "uuid", "base64Encode", "base64Decode", "isObject", "isIterable",
                "isNumbered", "isNature", "isContains", "isContainsNature", "count", "empty", "clone", "equal", "compare",
                "styleToString", "load", "getParamCount", "parseObjectAddress", "resolveEx", "resolve", "stackToString",
                "errorToString", "parseStack", "getDirectory", "getExtension", "get", "has", "getShortFileName",
                "getFileName", "resolvePath", "getPath", "parseDate", "dateFormat", "buildUrl", "t", "getContext", "RouteInfo", "Exception"],
      },
      {
        object: "JSON",
        allow: ["parse", "stringify"],
      },
      {
        object: "Math",
        allow: ["abs", "acos", "acosh", "asin","asinh", "atan", "atan2", "atanh", "cbrt", "ceil",
                "clz32", "cos", "cosh", "exp", "expm1", "floor", "fround", "hypot", "imul", "log",
                "log1p", "log2", "log10", "max", "min", "pow", "random", "round", "sign", "sin",
                "sinh", "sqrt", "tan", "tanh", "trunc"],
      },
      {
        object: "*",
        allow: ["toString"],
      },
      {
        object: "*",
        class:  "Array",
        allow: ["at", "concat", "entries", "flat", "flatMap", "includes", "indexOf", "keys", "lastIndexOf", "slice", "values", "join"],
      },
      {
        object: "Array",
        allow: ["of", "isArray", "from", "constructor"],
      },
      {
        object: "*",
        class:  "Date",
        allow: ["getDate", "getDay", "getFullYear", "getHours", "getMilliseconds", "getMinutes",
                "getMonth", "getSeconds", "getTime", "getTimezoneOffset", "getUTCDate", "getUTCDay",
                "getUTCFullYear", "getUTCHours", "getUTCMilliseconds", "getUTCMinutes", "getUTCMonth",
                "getUTCSeconds", "getYear", "toDateString", "toISOString", "toJSON", "toLocaleDateString",
                "toLocaleString", "toLocaleTimeString", "toTimeString", "toUTCString"],
      },
      {
        object: "Date",
        allow: ["parse", "now", "UTC", "constructor"],
      },
      {
        object: "RegExp",
        allow:  ["constructor"]
      },
      {
        object: "*",
        class:  "RegExp",
        allow:  ["exec", "test"],
      },
      {
        object: "*",
        class:  "String",
        allow: ["anchor", "at", "big", "blink", "bold", "charAt", "charCodeAt", "codePointAt", "concat",
                "endsWith", "fixed", "fontcolor", "fontsize", "includes", "indexOf", "isWellFormed",
                "italics", "lastIndexOf", "link", "localeCompare", "match", "matchAll", "normalize",
                "padEnd", "padStart", "repeat", "replace", "replaceAll", "search", "slice", "small",
                "split", "startsWith", "strike", "sub", "substr", "substring", "sup", "toLocaleLowerCase",
                "toLocaleUpperCase", "toLowerCase", "toUpperCase", "toWellFormed", "trim", "trimEnd", "trimStart"],
      },
      {
        object: "String",
        allow:  ["fromCharCode", "fromCodePoint"],
      }
    ],
  }
};
