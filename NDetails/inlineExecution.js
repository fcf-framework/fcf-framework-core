(function() {
  let   STATE_END             = 0;
  const S_WAIT                = STATE_END++;
  const S_BACK                = STATE_END++;
  const S_NUMBER_START        = STATE_END++;
  const S_NUMBER_READ         = STATE_END++;
  const S_STRING              = STATE_END++;
  const S_ESTRING              = STATE_END++;
  const S_KEY_START           = STATE_END++;
  const S_KEY_READ            = STATE_END++;
  const S_OBJECT_START        = STATE_END++;
  const S_OBJECT_SIMPLE_READ  = STATE_END++;
  const S_OBJECT_RCLOSE       = STATE_END++;
  const S_OBJECT_CCLOSE       = STATE_END++;
  const S_OBJECT_NEXT         = STATE_END++;
  const S_ARRAY_START         = STATE_END++;
  const S_ARRAY_NEXT          = STATE_END++;
  const S_DOBJECT_START       = STATE_END++;
  const S_DOBJECT_NEXT        = STATE_END++;
  const S_DOBJECT_KEY         = STATE_END++;
  const S_COMMAND_READ        = STATE_END++;
  const S_UCOMMAND_READ       = STATE_END++;
  const S_BLOCK_OPEN          = STATE_END++;
  const S_BLOCK_CLOSE         = STATE_END++;
  const S_BLOCK_SELECT        = STATE_END++;
  const S_BLOCK_SELECTA       = STATE_END++;

  const KEYWORDS = {
    "new": 1,
    "typeof": 1,
    "NaN": 1,
    "Infinity": 1,
    "undefined": 1,
    "false": 1,
    "true": 1,
  };

  const UCOMMANDS = {
    "-": "!-",
    "!": "!",
    "~": "~",
  };

  const COMMANDS = {
    "*":  { "": "*", "*": {"": "**"} },
    "/":  { "": "/" },
    "%":  { "": "%" },
    "+":  { "": "+" },
    "-":  { "": "-" },
    "^":  { "": "^" },
    "|":  { "": "|", "|": {"": "||"} },
    "&":  { "": "&", "&": {"": "&&"} },
    "<":  { "": "<", "=": {"": "<="}, "<": {"": "<<"} },
    ">":  { "": ">", "=": {"": ">="}, ">": {"": ">>", ">": {"": ">>>"}} },
    "!":  { "=": {"": "!=", "=": {"": "!=="}} },
    "=":  { "=": {"": "==", "=": {"": "==="}} },
    "i":  { "n": {"": "in", "s": {"t": {"a": {"n": {"c": {"e": {"o": {"f": {"": "instanceof"}}}}}}}}} },
  };

  const WEIGHTS = {
    "**": 14,
    "*": 13,
    "/": 13,
    "%": 13,
    "+": 12,
    "-": 12,
    "<<": 11,
    ">>": 11,
    ">>>": 11,
    "<": 10,
    "<=": 10,
    ">": 10,
    ">=": 10,
    "instanceof": 9,
    "in": 9,
    "==": 9,
    "!=": 9,
    "===": 9,
    "!==": 9,
    "&": 8,
    "^": 7,
    "|": 6,
    "&&": 5,
    "||": 4,
  };

  const ARGS = {
    "?":          [3, 3],
    "!-":         [1, 1],
    "!":          [1, 1],
    "~":          [1, 1],
    "b":          [0, 1],
    "bi":         [1, 1],
    "v":          [1, 1],
    "i":          [1, 1],
    "n":          [1, 1],
    "t":          [1, 1],
    "cmd":        [1, 1],
    "c":          [0, Infinity],
    "o":          [1, Infinity],
    "d":          [0, Infinity],
    "instanceof": [2, 2],
    "in":         [2, 2],
    "di":         [2, 2],
    "a":          [0, Infinity],
    "k":          [1, 1],
    "**":         [2, 2],
    "*":          [2, 2],
    "/":          [2, 2],
    "%":          [2, 2],
    "+":          [2, 2],
    "-":          [2, 2],
    "<<":         [2, 2],
    ">>":         [2, 2],
    ">>>":        [2, 2],
    "<":          [2, 2],
    "<=":         [2, 2],
    ">":          [2, 2],
    ">=":         [2, 2],
    "==":         [2, 2],
    "!=":         [2, 2],
    "===":        [2, 2],
    "!==":        [2, 2],
    "&":          [2, 2],
    "^":          [2, 2],
    "|":          [2, 2],
    "&&":         [2, 2],
    "||":         [2, 2],
  };

  const CHAR0 = '0'.charCodeAt(0);
  const CHAR9 = '9'.charCodeAt(0);
  const CHARa = 'a'.charCodeAt(0);
  const CHARz = 'z'.charCodeAt(0);
  const CHARA = 'A'.charCodeAt(0);
  const CHARZ = 'Z'.charCodeAt(0);
  const CHAR$ = '$'.charCodeAt(0);
  const CHAR_ = '_'.charCodeAt(0);

  const PROHIBITED_METHODS = {"__defineGetter__": 1, "__defineSetter__": 1, "__lookupGetter__": 1, "__lookupSetter__": 1};

  module.exports = fcf.NDetails.inlineExecution = new (class {
    execute(a_command, a_args) {
      let instructions = typeof a_command == "object" ? a_command : this.parse(a_command);
      let info = {
        env:  fcf.getConfiguration()._tokenizeEnvironment,
        args: a_args,
        command: a_command
      };
      return this._execute(info, instructions);
    }
    _resolve(a_path, a_env) {
      for (let p of a_path) {
        if (a_env === null && typeof a_env !== "object") {
          return {c: false};
        }
        a_env = a_env[p];
      }
      return {r: a_env, c: true };
    }
    _execute(a_info, a_op) {
      switch (a_op.t) {
        case "b":
          return this._execute(a_info, a_op.a[0]);
        case "bi":
          return this._execute(a_info, a_op.a[0]);
        case "v":
          return a_op.a[0];
        case "cmd":
          return this.execute(a_op.a[0], a_info.args);
        case "n":
        case "o":
          {
            let newComplete = false;
            let isNew       = a_op.t == "n";
            let items       = a_op.t == "n" ? a_op.a[0].a : a_op.a;
            let sources     = [a_info.args, a_info.env];
            let lstObject;
            let object;
            let found;
            let call  = items.find((a_item)=>{ return a_item.t == "c" });
            if (!call && isNew){
              items = fcf.clone(items);
              items.push({t:"c", a:[]});
              call = true;
            }
            let calls;
            let callsAll;
            let directCall;
            let lstKey;
            let envInfo;

            found = items[0].t != "i" ? 0 : -1;
            if (call) {
              calls = fcf.getConfiguration()._tokenizeFunctions;
              callsAll = [];
            }
            if (found == -1) {
              if (call) {
                for(let i = 0; i < items.length; ++i) {
                  lstKey = this._execute(a_info, items[i]);
                  if (items[i+1].t == "i"){
                    if (calls.items["*"])
                      callsAll.push(calls.items["*"].functions)
                    calls = typeof calls.items[lstKey] == "object" ? calls.items[lstKey] : undefined;
                  } else {
                    if (calls.functions[lstKey] || calls.functions["*"]){
                      found = i;
                    }
                    break;
                  }
                  if (!calls)
                    break;
                }
              }
              if (found == -1){
                let fullFound = -1;
                let shortFound = -1;
                lstObject = undefined;
                let isEnv = false;
                for(let source of sources) {
                  envInfo = !call && isEnv ? fcf.getConfiguration()._tokenizeEnvironmentInfo : undefined;
                  isEnv = true;
                  object = source;
                  for (let i = 0; i < items.length && items[i].t == "i"; ++i) {
                    if ((typeof object !== "object" && typeof object !== "string") || object === null) {
                      shortFound = -1;
                      fullFound = -1;
                      envInfo = undefined;
                      break;
                    }
                    lstKey = this._execute(a_info, items[i]);
                    lstObject = object;
                    let exists = typeof object == "object" && lstKey in object                       ? true :
                                 typeof object == "string" && (lstKey == "length" || !isNaN(lstKey)) ? true :
                                                                                                       false;
                    if (envInfo) {
                      if (i == 0) {
                        envInfo = envInfo.parts[lstKey];
                      } else if (envInfo.parts[lstKey]){
                        envInfo = envInfo.parts[lstKey];
                      }
                    }
                    if (exists) {
                      fullFound = i;
                    } else {
                      fullFound = -1;
                    }
                    object = object[lstKey];
                    shortFound = i;
                  }
                  if (shortFound != -1 && found == -1) {
                    found = shortFound;
                  }
                  if (fullFound != -1){
                    found = fullFound;
                    break;
                  }
                }
              }
            } else {
              object = this._execute(a_info, items[0]);
            }
            if (found == -1) {
              throw new fcf.Exception("ACCESS_FAILED_FIELD_TOKENIZE", {command: a_info.command});
            }
            if (!call && envInfo && envInfo.access === false) {
              throw new fcf.Exception("ACCESS_FAILED_FIELD_TOKENIZE", {command: a_info.command});
            }
            ++found;
            for (let i = found; i < items.length; ++i) {
              if (items[i].t == "c") {
                let args = [];
                for(let arg of items[i].a) {
                  args.push(this._execute(a_info, arg));
                }
                let callInfo;
                let callInfoAll;
                let globalObject = typeof global === "object" ? global : window;
                let directCall = false;

                if (calls) {
                  if (calls.functions[lstKey]){
                    callInfo = calls.functions[lstKey][calls.functions[lstKey].length-1];
                    directCall = true;
                  } else if (calls.functions["*"]){
                    callInfo = calls.functions["*"][calls.functions["*"].length-1];
                    directCall = true;
                  }
                }

                if (!callInfo) {
                  for(let c of callsAll) {
                    if (typeof c[lstKey] == "object") {
                      for(let ci of c[lstKey]) {
                        if (ci.class){
                          if (ci.class == "String") {
                            if (typeof lstObject == "string") {
                              callInfo = ci;
                            }
                          } else {
                            if (typeof ci.class == "string") {
                              let classItem = fcf.resolve(globalObject, ci.class);
                              try {
                                if (lstObject instanceof classItem){
                                  callInfo = ci;
                                }
                              } catch(e){
                              }
                            } else if (typeof ci.class == "function") {
                               callInfo = ci;
                            }
                          }
                        } else {
                          callInfo = ci;
                        }
                      }
                    }
                    if (c["*"]) {
                      for(let ci of c["*"]) {
                        if (ci.class){
                          if (ci.class == "String") {
                            if (typeof lstObject == "string" && !PROHIBITED_METHODS[lstKey]) {
                              callInfoAll = ci;

                            }
                          } else {
                            if (typeof ci.class == "string" && !PROHIBITED_METHODS[lstKey]) {
                              let classItem = fcf.resolve(globalObject, ci.class);
                              try {
                                if (lstObject instanceof classItem){
                                  callInfoAll = ci;
                                }
                              } catch(e){}
                            } else if (typeof ci.class == "function" && !PROHIBITED_METHODS[lstKey]){
                              callInfoAll = ci;
                            }
                          }
                        } else {
                          if (!PROHIBITED_METHODS[lstKey]) {
                            callInfoAll = ci;
                          }
                        }
                      }
                    }
                  }
                }
                if (!callInfo && callInfoAll){
                  callInfo = callInfoAll;
                }
                if (!callInfo){
                  throw new fcf.Exception("ACCESS_FAILED_FIELD_TOKENIZE", {command: a_info.command});
                }
                if (isNew && !newComplete){
                  lstObject = object;
                  if (directCall && callInfo.object) {
                    object    = (callInfo.object[1] == "" ? globalObject : fcf.resolve(globalObject, callInfo.object[1]))[lstKey];
                  }
                  object = new object(...args);
                  newComplete = true;
                } else {
                  let lst = object;
                  if (directCall && callInfo.object) {
                    lstObject = callInfo.object[1] == "" ? globalObject : fcf.resolve(globalObject, callInfo.object[1]);
                    object    = lstObject[lstKey];
                  }
                  if (object === undefined || object === null){
                    throw new fcf.Exception("ACCESS_FAILED_FIELD_TOKENIZE", {command: a_info.command});
                  }
                  object = object.apply(lstObject, args);
                  lstObject = lst;
                }
              } else if (items[i].t == "i") {
                if (!call) {
                  if ((typeof object != "object" && typeof object != "string") || object === null) {
                    throw new fcf.Exception("ACCESS_FAILED_FIELD_TOKENIZE", {command: a_info.command});
                  }
                }
                lstKey = this._execute(a_info, items[i]);
                if (calls) {
                  if (calls.items["*"]){
                    callsAll.push(calls.items["*"].functions)
                  }
                  calls = typeof calls.items[lstKey] == "object" ? calls.items[lstKey] : undefined;
                }
                lstObject = object;
                if (object !== null) {
                  object = object[lstKey];
                }
              } else {
                lstObject = object;
                object = this._execute(a_info, items[i]);
              }
            }
            if (isNew && !newComplete){
              object = new object();
            }
            return object;
          }
        case "d":
          {
            let object = {};
            for(let di of a_op.a) {
              object[this._execute(a_info, di.a[0])] = this._execute(a_info, di.a[1]);
            }
            return object;
          }
          break;
        case "a":
          {
            let arr = [];
            for(let itm of a_op.a) {
              arr.push(this._execute(a_info, itm));
            }
            return arr;
          }
          break;
        case "i":
          return typeof a_op.a[0] != "object" ? a_op.a[0] : this._execute(a_info, a_op.a[0]);
        case "instanceof":
          return this._execute(a_info, a_op.a[0]) instanceof this._execute(a_info, a_op.a[1]);
        case "in":
          return this._execute(a_info, a_op.a[0]) in this._execute(a_info, a_op.a[1]);
        case "t":
          return typeof this._execute(a_info, a_op.a[0]);
        case "?":
          return this._execute(a_info, a_op.a[0]) ? this._execute(a_info, a_op.a[1]) : this._execute(a_info, a_op.a[2]);
        case "!-":
          return -this._execute(a_info, a_op.a[0]);
        case "!":
          return !this._execute(a_info, a_op.a[0]);
        case "~":
          return ~this._execute(a_info, a_op.a[0]);
        case "**":
          return this._execute(a_info, a_op.a[0]) ** this._execute(a_info, a_op.a[1]);
        case "*":
          return this._execute(a_info, a_op.a[0]) * this._execute(a_info, a_op.a[1]);
        case "/":
          return this._execute(a_info, a_op.a[0]) / this._execute(a_info, a_op.a[1]);
        case "%":
          return this._execute(a_info, a_op.a[0]) % this._execute(a_info, a_op.a[1]);
        case "+":
          return this._execute(a_info, a_op.a[0]) + this._execute(a_info, a_op.a[1]);
        case "-":
          return this._execute(a_info, a_op.a[0]) - this._execute(a_info, a_op.a[1]);
        case "<<":
          return this._execute(a_info, a_op.a[0]) << this._execute(a_info, a_op.a[1]);
        case ">>":
          return this._execute(a_info, a_op.a[0]) >> this._execute(a_info, a_op.a[1]);
        case ">>>":
          return this._execute(a_info, a_op.a[0]) >>> this._execute(a_info, a_op.a[1]);
        case "<":
          return this._execute(a_info, a_op.a[0]) < this._execute(a_info, a_op.a[1]);
        case "<=":
          return this._execute(a_info, a_op.a[0]) <= this._execute(a_info, a_op.a[1]);
        case ">":
          return this._execute(a_info, a_op.a[0]) > this._execute(a_info, a_op.a[1]);
        case ">=":
          return this._execute(a_info, a_op.a[0]) >= this._execute(a_info, a_op.a[1]);
        case "==":
          return this._execute(a_info, a_op.a[0]) == this._execute(a_info, a_op.a[1]);
        case "!=":
          return this._execute(a_info, a_op.a[0]) != this._execute(a_info, a_op.a[1]);
        case "===":
          return this._execute(a_info, a_op.a[0]) === this._execute(a_info, a_op.a[1]);
        case "!==":
          return this._execute(a_info, a_op.a[0]) !== this._execute(a_info, a_op.a[1]);
        case "&":
          return this._execute(a_info, a_op.a[0]) & this._execute(a_info, a_op.a[1]);
        case "^":
          return this._execute(a_info, a_op.a[0]) ^ this._execute(a_info, a_op.a[1]);
        case "|":
          return this._execute(a_info, a_op.a[0]) | this._execute(a_info, a_op.a[1]);
        case "&&":
          return this._execute(a_info, a_op.a[0]) && this._execute(a_info, a_op.a[1]);
        case "||":
          return this._execute(a_info, a_op.a[0]) || this._execute(a_info, a_op.a[1]);
        default:
          throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_info.command});
          break;
      }
    }

    _popStack(a_command, a_stack) {
      if (a_stack.length == 1 ||
          !ARGS[a_stack[a_stack.length-1].t] ||
          a_stack[a_stack.length-1].a.length < ARGS[a_stack[a_stack.length-1].t][0]) {
        if (!a_stack[a_stack.length-1].r) {
          throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
        }
      }
      a_stack.pop();
      if (a_stack[a_stack.length-1].u) {
        this._popStack(a_command, a_stack);
      }
    }

    _pushArg(a_command, a_item, a_arg) {
      let mc = ARGS[a_item.t][1];
      if (a_item.a.length >= mc){
        throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
      }
      a_item.a.push(a_arg);
    }

    _isVarChar(a_char, a_isFirst) {
      const cn = a_char !== undefined ? a_char.charCodeAt(0) : undefined;
      return cn > 181  ||
             (!a_isFirst && cn >= CHAR0 && cn <= CHAR9) ||
             (cn >= CHARa && cn <= CHARz) ||
             (cn >= CHARA && cn <= CHARZ) ||
             cn === CHAR$ || cn === CHAR_;
    }

    parse(a_command){
      a_command = fcf.str(a_command);
      let   state           = S_WAIT;
      let   stack           = [{t: "b", b: true, a: []}];
      const cn0             = "0".charCodeAt(0);
      const cn9             = "9".charCodeAt(0);
      const cnd             = ".".charCodeAt(0);
      const cnq             = "'".charCodeAt(0);
      const cndq            = "\"".charCodeAt(0);
      const lengthWithZero  = a_command.length+1;
      let isBreak;
      let lstState = -1;
      let switches = [];
      let nswitches = [];
      for(let i = 0; i < lengthWithZero; ++i) {
        do {
          let c = a_command[i];
          let cn = a_command.charCodeAt(i);
          isBreak = true;
          if (state != S_WAIT && lstState == S_WAIT) {
            if (switches.length){
              if (!switches[switches.length-1][state]){
                throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
              } else {
                --switches[switches.length-1][state];
              }
            }
            if (nswitches.length){
              for(let j = 0; j < nswitches.length; ++j) {
                if (nswitches[j][state] && stack[stack.length-1].t == nswitches[j][state]){
                  throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
                }
              }
              nswitches = [];
            }
          }
          lstState = state;
          switch (state) {
            case S_WAIT:
              if (cn >= 0 && cn <= 32) {
                continue;
              } else if (c == "(") {
                state   = S_BLOCK_OPEN;
                isBreak = false;
                continue;
              } else if (c == ")") {
                for(let i = stack.length - 1; i >= 0; --i) {
                  if (stack[i].t == "c") {
                    state   = S_OBJECT_CCLOSE;
                    break;
                  } else if (stack[i].t == "b") {
                    state   = S_BLOCK_CLOSE;
                    break;
                  }
                }
                isBreak = false;
                continue;
              } else if (c == ",") {
                let found;
                for(let i = stack.length - 1; i >= 0; --i) {
                  if (stack[i].t == "a") {
                    while(stack[stack.length - 1].t != "a") {
                      this._popStack(a_command, stack);
                    }
                    found = true;
                    state = S_ARRAY_NEXT;
                    isBreak = false;
                    break;
                  } else if (stack[i].t == "d") {
                    while(stack[stack.length - 1].t != "d") {
                      this._popStack(a_command, stack);
                    }
                    found = true;
                    state = S_DOBJECT_NEXT;
                    isBreak = false;
                    break;
                  } else if (stack[i].t == "c") {
                    while(stack[stack.length - 1].t != "c") {
                      this._popStack(a_command, stack);
                    }
                    let ns = {};
                    ns[S_COMMAND_READ] = "c";
                    nswitches.push(ns);
                    found = true;
                    break;
                  }
                }
                if (!found) {
                  throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
                }
                continue;
              } else if (c == "?") {
                state = S_BLOCK_SELECT;
                isBreak = false;
                continue;
              } else if (c == "{") {
                state = S_DOBJECT_START;
                continue;
              } else if (c == "}") {
                state = S_DOBJECT_NEXT;
                isBreak = false;
                continue;
              } else if (c == "[") {
                state = S_ARRAY_START;
                isBreak = false;
                continue;
              } else if (c == "]") {
                let found = false;
                for(let i = stack.length - 1; i >= 1; --i) {
                  if (stack[i].t == "i" || stack[i].t == "a"){
                    found = stack[i].t;
                    break;
                  }
                }
                if (found == "i") {
                  state = S_OBJECT_RCLOSE;
                  isBreak = false;
                } else if (found == "a") {
                  state = S_ARRAY_NEXT;
                  isBreak = false;
                } else {
                  throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
                }
                continue;
              } else if (c == ":") {
                for(let i = stack.length - 1; i >= 0; --i) {
                  if (i == 0) {
                    throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
                  }
                  if (stack[i].t == "?") {
                    state = S_BLOCK_SELECTA;
                    isBreak = false;
                    break;
                  } else if (stack[i].t == "d"){
                    state = S_DOBJECT_NEXT;
                    isBreak = false;
                    break;
                  }
                }
                continue;
              } else if (cn == cnq || cn == cndq) {
                state   = S_STRING;
                isBreak = false;
                continue;
              } else if (c == "`") {
                state   = S_ESTRING;
                isBreak = false;
                continue;
              } else if (cn >= cn0 && cn <= cn9) {
                if (stack[stack.length - 1].a.length + 1 > ARGS[stack[stack.length - 1].t][1]) {
                  throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
                }
                state   = S_NUMBER_START;
                isBreak = false;
                continue;
              } else if (a_command[i] == "i" && a_command[i+1] == "n" && (!this._isVarChar(a_command[i+2]) || (a_command[i+2] == "s" && a_command[i+3] == "t" && a_command[i+4] == "a" && a_command[i+5] == "n" && a_command[i+6] == "c" && a_command[i+7] == "e" && a_command[i+8] == "o" && a_command[i+9] == "f" && !this._isVarChar(a_command[i+10])))) {
                state   = S_COMMAND_READ;
                isBreak = false;
              } else if (this._isVarChar(c, true)) {
                if (stack[stack.length - 1].t == "di" && !stack[stack.length - 1].a.length) {
                  state   = S_KEY_START;
                  isBreak = false;
                } else {
                  state   = S_OBJECT_START;
                  isBreak = false;
                }
              } else if (isNaN(cn)) {
                break;
              } else if (stack[stack.length - 1].a.length != 0) {
                if (stack[stack.length - 1].c && stack[stack.length - 1].a.length != 2 && UCOMMANDS[c]) {
                  state = S_UCOMMAND_READ;
                  isBreak = false;
                  continue;
                } else if (stack[stack.length - 1].t == "di" && stack[stack.length - 1].a.length == 1 && UCOMMANDS[c]) {
                  state = S_UCOMMAND_READ;
                  isBreak = false;
                  continue;
                } else if (stack[stack.length - 1].t == "?" && UCOMMANDS[c]) {
                  state = S_UCOMMAND_READ;
                  isBreak = false;
                  continue;
                }
                if (stack[stack.length - 1].t == "c" && UCOMMANDS[c]) {
                  state = S_UCOMMAND_READ;
                  isBreak = false;
                  continue;
                }
                if (stack[stack.length - 1].t == "a" && UCOMMANDS[c]) {
                  state = S_UCOMMAND_READ;
                  isBreak = false;
                  continue;
                }
                state   = S_COMMAND_READ;
                isBreak = false;
                continue;
              } else if (c in UCOMMANDS) {
                state = S_UCOMMAND_READ;
                isBreak = false;
                continue;
              } else {
                throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
              }
              break;
            case S_BLOCK_SELECT:
              {
                let fill = false;
                let item = stack[stack.length - 1];
                while(!item.b) {
                  this._popStack(a_command, stack);
                  item = stack[stack.length - 1];
                }
                let v = {t: "?", b: true, a: []};
                this._pushArg(a_command, v, item.a[item.a.length-1]);
                item.a[item.a.length-1] = v;
                stack.push(v);
                state = S_WAIT;
              }
              break;
            case S_BLOCK_SELECTA:
              {
                let fill = false;
                let item = stack[stack.length - 1];
                while(item.t != "?" || (item.t == "?" && item.a.length == 3)) {
                  fill = true;
                  this._popStack(a_command, stack);
                  item = stack[stack.length - 1];
                }
                state = S_WAIT;
              }
              break;
            case S_BLOCK_OPEN:
              {
                let v = {t: "b", b: true, a: []};
                let o = {t: "o", a: [v]};
                this._pushArg(a_command, stack[stack.length - 1], o);
                stack.push(o);
                stack.push(v);
                state = S_WAIT;
              }
              break;
            case S_BLOCK_CLOSE:
              if (!stack[stack.length-1].a.length) {
                throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
              }
              while(stack[stack.length-1].t != "b") {
                this._popStack(a_command, stack);
              }
              this._popStack(a_command, stack);
              state = S_OBJECT_NEXT;
              break;
            case S_BACK:
              state   = S_WAIT;
              isBreak = false;
              continue;
              break;
            case S_UCOMMAND_READ:
              {
                let v = {t: UCOMMANDS[c], u: true, a: []};
                this._pushArg(a_command, stack[stack.length - 1], v);
                if (c == "-" && a_command[i - 1] == "-") {
                  throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
                }

                stack.push(v);
                state = S_WAIT;
              }
              break;
            case S_COMMAND_READ:
              let lastCommand;
              let lastIndex = i;
              let commands = COMMANDS;
              let j = i;
              while(commands) {
                if (!commands[a_command[j]]) {
                  break;
                }
                if (commands[a_command[j]][""]){
                  lastCommand = commands[a_command[j]][""];
                  lastIndex = j;
                }
                commands = commands[a_command[j]];
                ++j;
              }
              i = lastIndex;
              if (!lastCommand) {
                throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
              }
              let newItm = {t: lastCommand, c: true, a: []};
              let weight = WEIGHTS[lastCommand];
              let stackItem = stack[stack.length - 1];
              while(true) {
                if (stack[stack.length-1].c && weight <= WEIGHTS[stack[stack.length-1].t]){
                  this._popStack(a_command, stack);
                  stackItem = stack[stack.length-1];
                } else {
                  break;
                }
              }
              let curItm = stackItem.a[stackItem.a.length-1];
              this._pushArg(a_command, newItm, curItm);
              stackItem.a[stackItem.a.length-1] = newItm;
              stack.push(newItm);
              state = S_WAIT;
              break;
            case S_NUMBER_START:
              {
                let v = {t: "v", a: [""]};
                this._pushArg(a_command, stack[stack.length - 1], v);
                stack.push(v);
                state = S_NUMBER_READ;
                isBreak = false;
                break;
              }
            case S_NUMBER_READ:
              if ((cn >= cn0 && cn <= cn9) || (stack[stack.length - 1].a[0].length && cn == cnd && !stack[stack.length - 1].dot)) {
                if (cn == cnd) {
                  stack[stack.length - 1].dot = true;
                }
                stack[stack.length - 1].a[0] += c;
              } else {
                delete stack[stack.length - 1].dot;
                stack[stack.length - 1].a[0] = parseFloat(stack[stack.length - 1].a[0]);
                this._popStack(a_command, stack);
                state = S_BACK;
                isBreak = false;
              }
              break;
            case S_KEY_START:
              {
                let v = {t: "v", a: [""]};
                v.a[0] += c;
                stack[stack.length - 1].a.push(v);
                stack.push(v);
                state = S_KEY_READ;
              }
              break;
            case S_KEY_READ:
              if (this._isVarChar(c)){
                stack[stack.length - 1].a[0] += c;
              } else {
                this._popStack(a_command, stack);
                state = S_WAIT;
                isBreak = false;
              }
              break;
            case S_ARRAY_START:
              {
                let v = {t: "a", e: false, a: []};
                let o = {t: "o", a: [v]};
                this._pushArg(a_command, stack[stack.length - 1], o);
                stack.push(o);
                stack.push(v);
                state = S_WAIT;
              }
              break;
            case S_ARRAY_NEXT:
              {
                if (c == "]") {
                  for(let i = stack.length-1; i >= 0; --i ) {
                    if (stack[i]) {
                      if (stack[i].t == "a") {
                        stack[i].e = true;
                        break;
                      }
                      this._popStack(a_command, stack);
                    }
                  }
                  this._popStack(a_command, stack);
                  state = S_OBJECT_NEXT;
                } else if (c == ",") {
                  let ns = {};
                  ns[S_COMMAND_READ] = "a";
                  nswitches.push(ns);
                  for(let i = stack.length-1; i >= 0; --i ) {
                    if (stack[i]) {
                      if (stack[i].t == "a") {
                        break;
                      }
                      this._popStack(a_command, stack);
                    }
                  }
                  state = S_WAIT;
                }
              }
              break;
            case S_DOBJECT_START:
              {
                let v = {t: "d", e: false, a: [{t:"di", a:[]}]};
                this._pushArg(a_command, stack[stack.length - 1], v);
                stack.push(v);
                stack.push(v.a[0]);
                let s = {};
                s[S_NUMBER_START] = 1;
                s[S_STRING] = 1;
                s[S_KEY_START] = 1;
                s[S_DOBJECT_NEXT] = Infinity;
                switches.push(s);
                state = S_WAIT;
                isBreak = false;
              }
              break;
            case S_DOBJECT_NEXT:
              {
                let item;
                for(let i = stack.length-1; i >= 0; --i ) {
                  if (stack[i].t == "d") {
                    item = stack[i];
                    break;
                  }
                }
                if (c == "}") {
                  if (item.a[item.a.length - 1].a.length == 0){
                    item.a[item.a.length - 1].r = true;
                    item.a.pop();
                  }
                  for(let i = stack.length-1; i >= 0; --i ) {
                    if (stack[i]) {
                      if (stack[i].t == "d") {
                        break;
                      }
                      this._popStack(a_command, stack);
                    }
                  }
                  this._popStack(a_command, stack);
                  if (!item){
                    throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
                  }
                  item.e = true;
                  state = S_WAIT;
                  switches.pop();
                } else if (c == ",") {
                  let v = {t:"di", a:[]};
                  for(let i = stack.length-1; i >= 0; --i ) {
                    if (stack[i]) {
                      if (stack[i].t == "d") {
                        break;
                      }
                      this._popStack(a_command, stack);
                    }
                  }
                  stack.push(v);
                  this._pushArg(a_command, item, v);
                  let s = {};
                  s[S_NUMBER_START] = 1;
                  s[S_STRING]       = 1;
                  s[S_KEY_START]    = 1;
                  s[S_DOBJECT_NEXT] = Infinity;
                  switches.push(s);
                  state = S_WAIT;
                  isBreak = true;
                } else if (c == ":") {
                  if (item.a[item.a.length - 1].a.length != 1){
                    throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
                  }
                  state = S_WAIT;
                  switches.pop();
                }
              }
              break;
            case S_OBJECT_START:
              {
                let v = {t: "o", a: []};
                this._pushArg(a_command, stack[stack.length - 1], v);
                stack.push(v);
                state = S_OBJECT_SIMPLE_READ;
                isBreak = false;
                break;
              }
              break;
            case S_OBJECT_SIMPLE_READ:
              {
                let item = stack[stack.length - 1];
                let name = "";
                for(; i < a_command.length && this._isVarChar(a_command[i]); ++i) {
                  name += a_command[i];
                }
                this._pushArg(a_command, item, { t: "i", a: [name] });
                state = S_OBJECT_NEXT;
                isBreak = false;
                break;
              }
              break;
            case S_OBJECT_NEXT:
              {
                let item = stack[stack.length - 1];
                for(; i < a_command.length && a_command.charCodeAt(i) <= 32 ; ++i);
                if (item.a.length == 1 && item.a[0].t == "i" && item.a[0].a[0] in KEYWORDS) {
                  let keyword = item.a[0].a[0];
                  if (keyword == "typeof"){
                    item.t = "t";
                    item.u = true;
                    item.a = [];
                  } else if (keyword == "new") {
                    item.t = "n";
                    item.u = true;
                    item.a = [];
                  } else {
                    item.t = "v";
                    item.a= [(
                      keyword === "NaN"       ? NaN :
                      keyword === "Infinity"  ? Infinity :
                      keyword === "undefined" ? undefined :
                      keyword === "false"     ? false :
                                                true
                    )];
                    this._popStack(a_command, stack);
                  }
                  state = S_WAIT;
                  isBreak = false;
                } else if (a_command[i] == ".") {
                  ++i;
                  for(; i < a_command.length && a_command.charCodeAt(i) <= 32 ; ++i);
                  if (!this._isVarChar(a_command[i])) {
                    throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
                  }
                  state = S_OBJECT_SIMPLE_READ;
                  isBreak = false;
                } else if (a_command[i] == "[") {
                  let arg = {t: "i", b: true, e: false, a: []};
                  this._pushArg(a_command, item, arg);
                  stack.push(arg);
                  state = S_WAIT;
                } else if (a_command[i] == "(") {
                  let arg = {t: "c", b: true, e: false, a: []};
                  this._pushArg(a_command, item, arg);
                  stack.push(arg);
                  state = S_WAIT;
                } else {
                  this._popStack(a_command, stack);
                  state = S_WAIT;
                  isBreak = false;
                }
              }
              break;
            case S_OBJECT_RCLOSE:
              {
                while (stack[stack.length - 1].t != "i") {
                  this._popStack(a_command, stack);
                }
                this._popStack(a_command, stack);
                state = S_OBJECT_NEXT;
              }
              break;
            case S_OBJECT_CCLOSE:
              {
                let item = stack[stack.length - 1];
                item.e = true;
                while (item.t != "c") {
                  this._popStack(a_command, stack);
                  item = stack[stack.length - 1];
                }
                this._popStack(a_command, stack);
                state = S_OBJECT_NEXT;
              }
              break;
            case S_ESTRING:
            case S_STRING:
              {
                let v = {t: "v", a: [""]};
                let rootv = v;
                let c = a_command[i];
                let eq = c;
                let sc = 0;
                ++i;
                c = a_command[i];
                const SPEC_CHARS = {
                  "n": "\n",
                  "b": "\b",
                  "r": "\r",
                  "n": "\n",
                  "\"": "\"",
                  "'": "'",
                  "f": "\f",
                  "t": "\t",
                };
                function specChar(i) {
                  let c = a_command[i];
                  if (c in SPEC_CHARS) {
                    v.a[0] += SPEC_CHARS[c];
                  } else if (c.charCodeAt(0) >= CHAR0 && c.charCodeAt(0) <= "7".charCodeAt(0)) {
                    let ss = "";
                    let sn  = -1;
                    for(let j = 0; j < 4 && (i+j) < a_command.length; ++j) {
                      let sss = ss;
                      let c = a_command[i+j];
                      let cn = c.charCodeAt(0);
                      if (cn < CHAR0 || cn > "7".charCodeAt(0)) {
                        break;
                      }
                      sss += c;
                      let ssn = parseInt(sss, 8);
                      if (ssn < 0 || ssn > 255) {
                        break;
                      }
                      ss = sss;
                      sn = ssn;
                    }
                    if (sn != -1){
                      v.a[0] += String.fromCharCode(sn)
                    }
                    if (ss.length) {
                      i += ss.length - 1;
                    }
                  } else if (c == "u" || c == "x") {
                    let l = 0;
                    let maxLen = c == "x" ? 2 : 4;
                    for(let c = a_command.charCodeAt((i+1) + l);
                        l <= maxLen &&
                          ((i+1) + l) < a_command.length &&
                          (
                            (c >= CHAR0 && c <= CHAR9) ||
                            (c >= CHARa && c <= 'f'.charCodeAt(0)) ||
                            (c >= CHARA && c <= 'F'.charCodeAt(0))
                          )
                          ;
                        ++l);
                    if (l) { --l };
                    let n = parseInt(a_command.substr(i+1, l), 16);
                    if (!isNaN(n)) {
                      v.a[0] += String.fromCharCode(n)
                    }
                    i += l;
                  } else {
                    v.a[0] += c;
                  }
                  return i;
                }
                while (i < a_command.length && !(c == eq && sc % 2 == 0)) {
                  if (c == "\\") {
                    if (sc % 2 == 1) {
                      v.a[0] += c;
                    }
                    ++sc;
                  } else if (sc % 2 == 1) {
                    i = specChar(i);
                    sc = 0;
                  } else if (c == "$" && a_command[i+1] == "{" && (sc % 2 == 0) && state == S_ESTRING) {
                    let isc = 0;
                    v.t = "+";
                    let container = {
                      t: "+",
                      a: [
                        {
                          t: "cmd",
                          a: [""],
                        },
                        {
                          t: "v",
                          a: [""],
                        },
                      ],
                    };
                    v.a[0] = {
                      t: "v",
                      a: [ v.a[0] ]
                    };
                    v.a[1] = container;
                    v = container.a[0];
                    for(i += 2; i < a_command.length; ++i) {
                      c = a_command[i];
                      if (c == "\\") {
                        if (isc % 2 == 1) {
                          v.a[0] += c;
                        }
                        ++isc;
                      } else if (c == "}" && (isc % 2) == 0) {
                        break;
                      } else if ((isc % 2) == 1) {
                        i = specChar(i);
                        isc = 0;
                      } else {
                        v.a[0] += c;
                      }
                    }
                    v = container.a[1];
                    sc = 0;
                  } else {
                    sc = 0;
                    v.a[0] += c;
                  }
                  ++i;
                  c = a_command[i];
                }
                if (i == a_command.length) {
                  throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
                }
                let o = {t: "o", a: [rootv]};
                this._pushArg(a_command, stack[stack.length - 1], o);
                stack.push(o);
                state = S_OBJECT_NEXT;
              }
              break;
          }
        } while(!isBreak);
      }

      if (!stack.length) {
        throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
      }
      for(let i = 1; i < stack.length; ++i) {
        if (stack[i].a.length < ARGS[stack[i].t][0] || stack[i].e === false) {
          throw new fcf.Exception("INVALID_COMMAND_TOKENIZE_INTERPETER", {command: a_command});
        }
      }
      return stack[0];
    }
  })();
})();
