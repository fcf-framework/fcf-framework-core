fcf.module({
  name: "fcf-framework-core:NProcess/NProcess.js" ,
  module:() => {
    let Namesapce = fcf.prepare(fcf, "NProcess");

    function indexOfSpace(a_str, a_startPos) {
      if (a_startPos === -1)
        return -1;
      if (!a_startPos || isNaN(a_startPos))
        a_startPos = 0;
      for(var i = a_startPos; i < a_str.length; ++i) {
        var code = a_str.charCodeAt(i);
        if (code >= 0 && code <= 32)
          return i;
      }
      return -1;
    }


    Namesapce.commandToString = (a_command, a_arguments) => {
      a_command = Array.isArray(a_command)      ? a_command :
                  !fcf.empty(a_command)         ? [a_command] :
                                                  undefined;
      a_arguments = Array.isArray(a_arguments)  ? a_arguments :
                    !fcf.empty(a_arguments)     ? [a_arguments] :
                                                  undefined;
      return a_command.concat(a_arguments)
            .map((a_val)=>{
              a_val = fcf.str(a_val);
              return indexOfSpace(a_val) != -1 || a_val.indexOf("\"") != -1 || a_val.indexOf("'") != -1
                      ? `"${fcf.escapeQuotes(a_val)}"`
                      : a_val;
            })
            .join(" ");
    }

    Namesapce.commandFromString = (a_command) => {
      let command = "";
      let args = [];
      let sc = 0;
      let isq = false;
      let isdq = false;
      let arg = "";
      let isargs = false;

      for (let i = 0; i < a_command.length; ++i) {
        let c = a_command[i];
        let cn = a_command.charCodeAt(i);

        if (sc % 2 == 0 && c == "'") {
          if (!isq) {
            isq = true;
          } else {
            isq = false;
          }
        } else if (sc % 2 == 0 && c == "\"") {
          if (!isdq) {
            isdq = true;
          } else {
            isdq = false;
          }
        } else if (cn >= 0 && cn <= 32 && arg.length) {
          if (isargs) {
            args.push(arg);
          } else {
            command = arg;
          }

          arg = "";
          isargs = true;
        } else if (c == "\\") {
          ++sc;
          if (sc % 2 == 0) arg += c;
        } else {
          arg += c;
          sc = 0;
        }
      }

      if (arg.length) {
        if (!command) {
          command = arg;
        } else {
          args.push(arg);
        }
      }

      return {
        command: command,
        args: args
      };
    };

    return Namesapce;
  }
});
