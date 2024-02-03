(function() {
  var fcf = typeof global !== 'undefined' && global.fcf ? global.fcf :
            typeof window !== 'undefined' && window.fcf ? window.fcf :
                                                          {};
  fcf.NDetails   = fcf.NDetails   || {};
  fcf.namespaces = fcf.namespaces || {};

  if (typeof module !== 'undefined')
    module.exports = fcf;
  if (typeof global !== 'undefined')
    global.fcf = fcf;
  if (typeof window !== 'undefined')
    window.fcf = fcf;

  /// @fn boolean _isServer
  /// @brief Determines where the code is executed on the server or on the client
  /// @result boolean - Returns true if the code is running on the server side
  fcf.isServer = () => {
    return _isServer;
  }
  const _isServer = typeof module === "object" && typeof module.filename !== "undefined";



  //////////////////////////////////////////////////////////////////////////////
  // SERVER SIDE INCLUDES
  //////////////////////////////////////////////////////////////////////////////



  let libResolver, libPath, libFS, libUtil, libState, libLogger;
  if (_isServer) {
    libResolver          = require("./NDetails/resolver.js");
    libPath              = require("path");
    libFS                = require("fs");
    libUtil              = require("util")
    libInlineInterpreter = require("./NDetails/inlineExecution.js");
    libLoad              = require("./NDetails/load.js");
    libState             = require("./NDetails/state.js");
    libLogger            = require("./NDetails/logger.js");
  }



  //////////////////////////////////////////////////////////////////////////////
  // STRING FUNCTIONS
  //////////////////////////////////////////////////////////////////////////////



  function _autoParse(a_value) {
    if ( typeof a_value == "string" && a_value.length){
      let s = 0;
      for(; s < a_value.length && a_value.charCodeAt(s) <= 32; ++s);
      let l = a_value.length-1;
      for(; l >= 0 && a_value.charCodeAt(l) <= 32; --l);
      if (
        l >= 0 &&
        (
           !isNaN(a_value) ||
           ((l - s >= 1) && a_value[s] == "\"" && a_value[l] == "\"") ||
           (a_value[s] == "{" && a_value[l] == "}") ||
           (a_value[s] == "[" && a_value[l] == "]") ||
           ((l - s == 3) && a_value[s] == "t" && a_value[s+1] == "r" && a_value[s+2] == "u" && a_value[s+3] == "e" ) ||
           ((l - s == 4) && a_value[s] == "f" && a_value[s+1] == "a" && a_value[s+2] == "l" && a_value[s+3] == "s" && a_value[s+4] == "e" ) ||
           ((l - s == 3) && a_value[s] == "n" && a_value[s+1] == "u" && a_value[s+2] == "l" && a_value[s+3] == "l" )
        ) )
      {
        try {
          let res =  JSON.parse(a_value);
          return res;
        } catch(e) {
          return a_value;
        }
      } else {
        return a_value;
      }
    } else {
      return a_value;
    }
  }



  /// @fn string fcf.str(mixed a_data)
  /// @brief Converts data to a string
  /// @details NaN, undefined and null values are represented as an empty string
  /// @param mixed a_data - source data
  /// @result string
  fcf.str = (a_data, a_fullMode) => {
    return typeof a_data == "string"                    ? a_data :
           a_data === undefined                         ? "" :
           a_data === null                              ? "" :
           typeof a_data === "number" && isNaN(a_data)  ? "" :
           typeof a_data == "object"                    ? (
                                                           a_data instanceof fcf.Exception                     ? fcf.errorToString(a_data, a_fullMode) :
                                                           a_data instanceof Error                             ? fcf.errorToString(a_data, a_fullMode) :
                                                           a_data.sqlMessage && a_data.sqlState && a_data.code ? a_data.sqlMessage :
                                                                                                                 JSON.stringify(a_data, undefined, 2)
                                                          ) :
                                                          a_data.toString();
  }



  /// @fn string fcf.escapeQuotes(string a_str, string|[string] a_quote = undefined)
  /// @brief Escapes single and double quotes with \
  /// @param string a_str - Source string
  /// @param string|[string] a_quote = undefined - If the parameter is specified and contains the value
  ///                                              of the escaped character or an array of escaped characters,
  ///                                              then only the specified character and the \ character are escaped.
  /// @result string - String with escaped characters
  fcf.escapeQuotes = (a_str, a_quote) => {
    let result = "";
    if (Array.isArray(a_quote)) {
      for (let i = 0; i < a_str.length; ++i) {
        let c = a_str[i];
        if (c === "\\"){
          result += "\\\\";
        } else if (a_quote.indexOf(c) != -1){
          result += "\\";
          result += c;
        } else {
          result += c;
        }
      }
    } else {
      for (let i = 0; i < a_str.length; ++i) {
        let c = a_str[i];
        if (c === "\\"){
          result += "\\\\";
        } else if (a_quote && c === a_quote){
          result += "\\";
          result += a_quote;
        } else if (!a_quote && c === "\""){
          result += "\\\"";
        } else if (!a_quote && c === "'"){
          result += "\\'";
        } else {
          result += c;
        }
      }
    }
    return result;
  }



  /// @fn string|object fcf.unescape(string|object a_data)
  /// @brief Performs unescaping of a string or strings in the passed object
  /// @param string|object a_data - Source data (an object or a string)
  /// result string|object - Unescaped data
  fcf.unescape = (a_data) => {
    if (typeof a_data == "object" && a_data !== null) {
      a_data = fcf.clone(a_data);
      if (Array.isArray(a_data)) {
        for (let key = 0; key < a_data.length; ++key)
          a_data[key] = fcf.unescape(a_data[key]);
      } else {
        for (let key in a_data)
          a_data[key] = fcf.unescape(a_data[key]);
      }
      return a_data;
    } else if (typeof a_data == "string"){
      let result = "";
      let counter = 0;
      for(let i = 0; i < a_data.length; ++i) {
        let c = a_data[i];
        if (c == "\\") {
          ++counter;
          if (counter%2 == 0)
            result += c;
        } else {
          counter = 0;
          result += c;
        }
      }
      return result;
    }
  }



  /// @fn string fcf.replaceAll(string a_str, string a_search, string a_replacement)
  /// @brief Performs replacement of all searched substrings in a string
  /// @param string a_str - Source string
  /// @param string a_search - Search substring
  /// @param string a_replacement - replacement
  /// @result string - New string
  fcf.replaceAll = (a_str, a_search, a_replacement) => {
    a_str = fcf.str(a_str);
    if (a_str.indexOf(a_search) == -1)
      return a_str;
    return a_str.split(a_search).join(a_replacement);
  }



  /// @fn string fcf.decodeHtml(string a_str)
  /// @brief Performs decoding of special characters in an HTML string
  /// @param string a_str - Source string
  /// @result string - Decoding result string
  fcf.decodeHtml = (a_str) => {
    a_str = fcf.str(a_str);
    let zn = "0".charCodeAt(0);
    let nn = "9".charCodeAt(0);
    a_str = fcf.str(a_str);
    let result = "";
    for(let i = 0; i < a_str.length; ++i){
      let c = a_str[i];
      if (c == "&") {
        if (a_str[i+1] == "#"){
          let code = "";
          let p = i+2;
          for(; p < a_str.length; ++p) {
            let c  = a_str[p];
            let cn = a_str.charCodeAt(p);
            if (cn >= zn && cn <= nn){
              code += c;
            } else {
              if (c != ";"){
                --p;
              }
              break;
            }
          }
          if (code.length){
            result += String.fromCharCode(parseInt(code));
            i = p;
            continue;
          }
        } else {
          let p    = i+1;
          let inst = "";
          for(; p < a_str.length; ++p) {
            let c = a_str[p];
            if (c == "&"){
              --p;
              break;
            }
            inst += c;
            if (inst in _decodeHtml_map)
              break;
            if (inst.length == _decodeHtml_mapMaxLength)
              break;
          }
          i = p;
          if (inst in _decodeHtml_map) {
            if (a_str[i+1] == ";")
              ++i;
            result += _decodeHtml_map[inst];
          } else {
            result += "&";
            result += inst;
          }
          continue;
        }
        result += c;
      } else {
        result += c;
      }
    }

    return result;
  }
  const _decodeHtml_map = {
    'quot': '"', 'amp': '&', 'apos': '\'', 'lt': '<', 'gt': '>', 'nbsp': '\u00a0', 'iexcl': '¡', 'cent': '¢', 'pound': '£',
    'curren': '¤', 'yen': '¥', 'brvbar': '¦', 'sect': '§', 'uml': '¨', 'copy': '©', 'ordf': 'ª', 'laquo': '«', 'not': '¬',
    'shy': '\u00ad', 'reg': '®', 'macr': '¯', 'deg': '°', 'plusmn': '±', 'sup2': '²', 'sup3': '³', 'acute': '´', 'micro': 'µ',
    'para': '¶', 'middot': '·', 'cedil':'¸', 'sup1':'¹', 'ordm':'º', 'raquo':'»', 'frac14':'¼', 'frac12':'½', 'frac34':'¾',
    'iquest':'¿', 'Agrave':'À', 'Aacute':'Á', 'Acirc':'Â', 'Atilde':'Ã', 'Auml':'Ä', 'Aring':'Å', 'AElig':'Æ', 'Ccedil':'Ç',
    'Egrave':'È', 'Eacute':'É', 'Ecirc':'Ê', 'Euml':'Ë', 'Igrave':'Ì', 'Iacute':'Í', 'Icirc':'Î', 'Iuml':'Ï', 'ETH':'Ð', 'Ntilde':'Ñ',
    'Ograve':'Ò', 'Oacute':'Ó', 'Ocirc':'Ô', 'Otilde':'Õ', 'Ouml':'Ö', 'times':'×', 'Oslash':'Ø', 'Ugrave':'Ù', 'Uacute':'Ú',
    'Ucirc':'Û', 'Uuml':'Ü', 'Yacute':'Ý', 'THORN':'Þ', 'szlig':'ß', 'agrave':'à', 'aacute':'á', 'atilde':'ã', 'auml':'ä',
    'aring':'å', 'aelig':'æ', 'ccedil':'ç', 'egrave':'è', 'eacute':'é', 'ecirc':'ê', 'euml':'ë', 'igrave':'ì', 'iacute':'í',
    'icirc':'î', 'iuml':'ï', 'eth':'ð', 'ntilde':'ñ', 'ograve':'ò', 'oacute':'ó', 'ocirc':'ô', 'otilde':'õ', 'ouml':'ö',
    'divide':'÷', 'oslash':'ø', 'ugrave':'ù', 'uacute':'ú', 'ucirc':'û', 'uuml':'ü', 'yacute':'ý', 'thorn':'þ', 'yuml':'ÿ',
    'bull':'•', 'infin':'∞', 'permil':'‰', 'sdot':'⋅', 'dagger':'†', 'mdash':'—', 'perp':'⊥', 'par':'∥', 'euro':'€', 'trade':'™',
    'alpha':'α', 'beta':'β', 'gamma':'γ', 'delta':'δ', 'epsilon':'ε', 'zeta':'ζ', 'eta':'η', 'theta':'θ', 'iota':'ι', 'kappa':'κ',
    'lambda':'λ', 'mu':'μ', 'nu':'ν', 'xi':'ξ', 'omicron':'ο', 'pi':'π', 'rho':'ρ', 'sigma':'σ', 'tau':'τ', 'upsilon':'υ',
    'phi':'φ', 'chi':'χ', 'psi':'ψ', 'omega':'ω', 'Alpha':'Α', 'Beta':'Β', 'Gamma':'Γ', 'Delta':'Δ', 'Epsilon':'Ε', 'Zeta':'Ζ',
    'Eta':'Η', 'Theta':'Θ', 'Iota':'Ι', 'Kappa':'Κ', 'Lambda':'Λ', 'Mu':'Μ', 'Nu':'Ν', 'Xi':'Ξ', 'Omicron':'Ο', 'Pi':'Π', 'Rho':'Ρ',
    'Sigma':'Σ', 'Tau':'Τ', 'Upsilon':'Υ', 'Phi':'Φ', 'Chi':'Χ', 'Psi':'Ψ', 'Omega':'Ω'
  };
  const _decodeHtml_mapMaxLength = 7;



  /// @fn string fcf.encodeHtml(string a_str)
  /// @brief Performs encoding of special characters ( " ' > < &) HTML code constructs
  /// @param string a_str - Source string
  /// @result string - Encoded string
  fcf.encodeHtml = (a_str) => {
    let result = "";
    a_str = fcf.str(a_str);
    for(let i = 0; i < a_str.length; ++i) {
      let c = a_str[i];
      switch(c){
        case "<":  result += "&lt;";    break;
        case ">":  result += "&gt;";    break;
        case "\"": result += "&quot;";  break;
        case "\'": result += "&apos;";  break;
        case "&":  result += "&amp;";   break;
        default:   result += c;         break;
      }
    }
    return result;
  }



  /// @fn string fcf.stripTags(string a_str)
  /// @brief Removing HTML tags from a string
  /// @param string a_str - Source string
  /// @result string - String with tags removed
  fcf.stripTags = (a_str) => {
    return fcf.str(a_str).replace(_regStripTags, "");
  }
  const _regStripTags = new RegExp("(<[^>]*>)", "g");



  /// @fn string fcf.ltrim(string a_str, string|false|[string|false] a_arr = [false])
  /// @brief Removes the given characters from the beginning of a string
  /// @param string a_str - Source string
  /// @param string|false|[string|false] a_arr = [false]- Array of characters for which deletion will be performed or single string delimiter
  ///                                                     If the array element is false, characters with code <= 32 are removed
  /// @result string - New string
  fcf.ltrim = (a_str, a_arr) => {
    a_str = fcf.str(a_str);
    let pos = _ltrimPos(a_str, a_arr);
    return pos != 0 ? a_str.substr(pos) : a_str;
  }



  /// @fn string fcf.ltrim(string a_str, a_arr = [false])
  /// @brief Removes the given characters from the end of a string
  /// @param string a_str - Source string
  /// @param string|false|[string|false] a_arr = [false]- Array of characters for which deletion will be performed or single string delimiter
  ///                                                     If the array element is false, characters with code <= 32 are removed
  /// @result string - New string
  fcf.rtrim = (a_str, a_arr) => {
    a_str = fcf.str(a_str);
    let pos = _rtrimPos(a_str, a_arr);
    return pos != a_str.length ? a_str.substr(0, pos) : a_str;
  }



  /// @fn string fcf.ltrim(string a_str, a_arr = [false])
  /// @brief Removes the given characters from the beginning and end of a string
  /// @param string a_str - Source string
  /// @param string|false|[string|false] a_arr = [false]- Array of characters for which deletion will be performed or single string delimiter
  ///                                                     If the array element is false, characters with code <= 32 are removed
  /// @result string - New string
  fcf.trim = (a_str, a_arr) => {
    a_str = fcf.str(a_str);
    let posBeg = _ltrimPos(a_str, a_arr);
    let posEnd = _rtrimPos(a_str, a_arr);
    return posBeg != 0 || posEnd != a_str.length
            ? a_str.substr(posBeg, posEnd - posBeg)
            : a_str;
  }

  function _rtrimPos(a_str, a_arr) {
    if (!a_str.length)
      return 0;
    if (!Array.isArray(a_arr)) {
      a_arr = [a_arr];
    }
    let pos = a_str.length - 1;
    for(; pos >= 0; --pos) {
      let found = false;
      for(let i = 0; i < a_arr.length; ++i){
        if (!a_arr[i]) {
          let cn  = a_str.charCodeAt(pos);
          if (cn >= 0 && cn <= 32){
            found = true;
            break;
          }
        } else if (a_str.charAt(pos) == a_arr[i]){
          found = true;
          break;
        }
      }
      if (!found)
        break;
    }
    return pos+1;
  }

  function _ltrimPos(a_str, a_arr) {
    let pos = 0;
    if (!Array.isArray(a_arr)) {
      a_arr = [a_arr];
    }
    for(; pos < a_str.length; ++pos) {
      let found = false;
      for(let i = 0; i < a_arr.length; ++i){
        if (!a_arr[i]) {
          let cn  = a_str.charCodeAt(pos);
          if (cn >= 0 && cn <= 32){
            found = true;
            break;
          }
        } else if (a_str.charAt(pos) === a_arr[i]) {
          found = true;
          break;
        }
      }
      if (!found)
        break;
    }
    return pos;
  }



  /// @fn string fcf.pad(string a_str, number a_len, string a_fill = " ", string a_align = "left")
  /// @brief Pads a string to a given length
  /// @param string a_str - Source string
  /// @param number a_len - The length to which you want to pad the original string
  /// @param string a_fill = " " - The string which will be filled with empty space
  /// @param string a_align = "left" - String alignment a_str
  ///                                   - "l"|"left"   - Alignment is done to the left
  ///                                   - "r"|"right"  - Alignment is done to the right
  ///                                   - "c"|"center" - Alignment is done in the center
  /// @result string - Result string
  fcf.pad = (a_str, a_len, a_fill, a_align) => {
    if (isNaN(a_len))
      return a_str;
    let fillLen = a_len - a_str.length;
    if (fillLen <= 0)
      return a_str;
    if (!a_fill)
      a_fill = " ";
    if (typeof a_align !== "string")
      a_align = "l";
    let leftLen =  a_align[0] == "r" ? fillLen :
                   a_align[0] == "c" ? Math.floor(fillLen / 2) :
                                       0;
    let rightLen = a_align[0] == "r" ? 0 :
                   a_align[0] == "c" ? Math.floor(fillLen / 2) + (fillLen % 2) :
                                       fillLen;
    let result = "";
    for (let i = 0; i < leftLen; ++i) {
      result += a_fill[i%a_fill.length];
    }
    result += a_str;
    for (let i = 0; i < rightLen; ++i) {
      result += a_fill[i%a_fill.length];
    }
    return result;
  }



  /// @fn string fcf.id(number a_size = 32, boolean a_safeFirstChar = true)
  /// @brief Creates a string from random characters in hex format
  /// @param number a_size default = 32 - Generated string size
  /// @param boolean a_safeFirstChar default = true - If false, then the first character takes
  ///    values from 0-f. If true, then the first character takes values from a-f.
  /// @result string - String with random hex characters
  fcf.id = (a_size, a_safeFirstChar) => {
    a_size = a_size || 32;
    a_safeFirstChar = a_safeFirstChar === undefined ? true : a_safeFirstChar;
    let result = "";
    for(let i = 0; i < a_size; ++i) {
      result += i || !a_safeFirstChar ? (Math.floor(Math.random()*16)).toString(16)
                                      : "abcdef"[(Math.floor(Math.random()*6))];
    }
    return result;
  }



  /// @fn string uuid()
  /// @brief Creates a UUID string (v4)
  /// @result string - UUID string
  fcf.uuid = () => {
    let res = "";
    for(let i = 0; i < 36; ++i) {
      if (i == 8 || i == 13 || i == 18 || i == 23) {
        res += "-";
      } else if (i == 14) {
        res += "4";
      } else if (i == 19) {
        res += ((Math.random() * 16 | 0) & 0x3 | 0x8).toString(16);
      } else {
        res += (Math.random() * 16 | 0).toString(16);
      }
    }
    return res;
  }



  /// @fn string fcf.decodeBase64(string a_base64String)
  /// @brief Decodes a string from base64 format
  /// @param string a_base64String - Source base64 string
  /// @result string - Result string
  fcf.decodeBase64 = function (a_input) {
    function utf8Decode (utftext) {
      let string = "";
      let i = 0;
      let c = 0;
      let c1 = 0;
      let c2 = 0;
      while ( i < utftext.length ) {
        c = utftext.charCodeAt(i);
        if (c < 128) {
          string += String.fromCharCode(c);
          i++;
        } else if((c > 191) && (c < 224)) {
          c2 = utftext.charCodeAt(i+1);
          string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          i += 2;
        } else {
          c2 = utftext.charCodeAt(i+1);
          c3 = utftext.charCodeAt(i+2);
          string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
        }
      }
      return string;
    }

    let output = "";
    let chr1, chr2, chr3;
    let enc1, enc2, enc3, enc4;
    let i = 0;
    a_input = fcf.str(a_input).replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < a_input.length) {
      enc1 = _keyBase64.indexOf(a_input.charAt(i++));
      enc2 = _keyBase64.indexOf(a_input.charAt(i++));
      enc3 = _keyBase64.indexOf(a_input.charAt(i++));
      enc4 = _keyBase64.indexOf(a_input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    output = utf8Decode(output);
    return output;
  }



  /// @fn string fcf.encodeBase64(string a_input)
  /// @brief Encodes a string in base64 format
  /// @param string a_input - Source string
  /// @result string - Result base64 string
  fcf.encodeBase64  = function (a_input) {
    function utf8Encode (a_string) {
      a_string = a_string.replace(/\r\n/g,"\n");
      let utftext = "";
      for (let n = 0; n < a_string.length; n++) {
        let c = a_string.charCodeAt(n);
        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }
      return utftext;
    }

    let output = "";
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    let i = 0;
    a_input = utf8Encode(fcf.str(a_input));
    while (i < a_input.length) {
      chr1 = a_input.charCodeAt(i++);
      chr2 = a_input.charCodeAt(i++);
      chr3 = a_input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output +
              _keyBase64.charAt(enc1) + _keyBase64.charAt(enc2) +
              _keyBase64.charAt(enc3) + _keyBase64.charAt(enc4);
    }

    return output;
  }

  const _keyBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";



  //////////////////////////////////////////////////////////////////////////////
  // DATA FUNCTIONS
  //////////////////////////////////////////////////////////////////////////////



  /// @fn boolean fcf.isObject(mixed a_value)
  /// @brief Checks if the argument is an object and not null
  /// @param mixed a_value Checked value
  /// @result boolean - Returns true if the argument is an object and is not null
  fcf.isObject = (a_value) => {
    return typeof a_value === "object" && a_value !== null;
  }



  /// @fn boolean fcf.isIterable(mixed a_value)
  /// @brief Checks if an argument is iterable (but not a string)
  /// @param mixed a_value Checked value
  /// @result boolean - Returns true if the argument iterable
  fcf.isIterable = (a_value) => {
    return typeof a_value === "object" && a_value !== null
                  ? typeof a_value[Symbol.iterator] === 'function'
                  : false;
  }



  /// @fn boolean fcf.isNumbered(mixed a_value)
  /// @brief Checks if an argument is numbered (but not a string)
  /// @param mixed a_value Checked value
  /// @result boolean - Returns true if the argument numbered
  fcf.isNumbered = (a_value) => {
    if (typeof a_value !== "object" || a_value === null)
      return false;
    if (typeof a_value[Symbol.iterator] !== 'function' || typeof a_value.length !== "number")
      return false;
    if (a_value.length > 0) {
      return 0 in a_value;
    } else {
      for(let v of a_value) {
        return false;
      }
      return true;
    }
  }



  /// @var integer fcf.UNDEFINED = 0
  /// @brief Nature type of variable. Undefined value
  Object.defineProperty(fcf,
                        "UNDEFINED",
                        { value: 0, writable: false });

  /// @var integer fcf.NULL = 1
  /// @brief Nature type of variable. Null value
  Object.defineProperty(fcf,
                        "NULL",
                        { value: 1, writable: false });

  /// @var integer fcf.NAN = 2
  /// @brief Nature type of variable. NaN value
  Object.defineProperty(fcf,
                        "NAN",
                        { value: 2, writable: false });

  /// @var integer fcf.BOOLEAN = 3
  /// @brief Nature type of variable. Boolean value
  Object.defineProperty(fcf,
                        "BOOLEAN",
                        { value: 3, writable: false });

  /// @var integer fcf.NUMBER = 4
  /// @brief Nature type of variable. Number value
  Object.defineProperty(fcf,
                        "NUMBER",
                        { value: 4, writable: false });

  /// @var integer fcf.STRING = 5
  /// @brief Nature type of variable. String value
  Object.defineProperty(fcf,
                        "STRING",
                        { value: 5, writable: false });

  /// @var integer fcf.DATE = 6
  /// @brief Nature type of variable. Date value
  Object.defineProperty(fcf,
                        "DATE",
                        { value: 6, writable: false });

  /// @var integer fcf.OBJECT = 7
  /// @brief Nature type of variable. Object value (Excluding null and date)
  Object.defineProperty(fcf,
                        "OBJECT",
                        { value: 7, writable: false });

  /// @var integer fcf.ARRAY = 8
  /// @brief Nature type of variable. Array value
  Object.defineProperty(fcf,
                        "ARRAY",
                        { value: 8, writable: false });

  /// @var integer fcf.ITERABLE = 9
  /// @brief Nature type of variable. Iterable object
  Object.defineProperty(fcf,
                        "ITERABLE",
                        { value: 9, writable: false });

  /// @var integer fcf.NUMBERED = 10
  /// @brief Nature type of variable. Numbered object (Excluding string)
  Object.defineProperty(fcf,
                        "NUMBERED",
                        { value: 10, writable: false });



  /// @fn boolean fcf.isNature(mixed a_value, string|fcf.UNDEFINED..fcf.NUMBERED|[string|fcf.UNDEFINED..fcf.NUMBERED] a_nature, boolean a_softMode = false)
  /// @brief Checks if a value matches the nature type
  /// @param mixed a_value - Checked value
  /// @param string|integer|[string|integer] a_nature - The nature type or an array of nature types.
  ///   nature can take an integer value or a string value:
  ///     - fcf.UNDEFINED=0 | "undefined" - Undefined value
  ///     - fcf.NULL=1 | "null" - Null value
  ///     - fcf.NAN=2 | "nan" - NaN value
  ///     - fcf.BOOLEAN=3 | "boolean" - Boolean value
  ///     - fcf.NUMBER=4 | "number" - Number value
  ///     - fcf.STRING=5 | "string" - String value
  ///     - fcf.DATE=6 | "date" - Date value
  ///     - fcf.OBJECT=7 | "object" - Object value (Excluding null and date)
  ///     - fcf.ARRAY=8 | "array" - Array value
  ///     - fcf.ITERABLE=9 | "iterable" - Iterable object (Excluding string)
  ///     - fcf.NUMBERED=10 | "numbered" - Numbered object (Excluding string)
  /// @param boolean a_softMode = false - If it is true when checking a string containing a number or a date
  ///                                     for compliance with the fcf.NUMBER or fcf.DATE types, the function will return true
  /// @result boolean - Returns true if there is a match with type nature
  fcf.isNature = (a_value, a_nature, a_softMode) => {
    let l = Array.isArray(a_nature) ? a_nature.length : 1;
    for(let i = 0; i < l; ++i) {
      let nature = Array.isArray(a_nature) ? a_nature[i] : a_nature;
      if (typeof nature == "string") {
        nature = nature == "numbered" ? fcf.NUMBERED :
                 nature == "iterable" ? fcf.ITERABLE :
                 nature == "array"    ? fcf.ARRAY :
                 nature == "object"   ? fcf.OBJECT :
                 nature == "date"     ? fcf.DATE :
                 nature == "string"   ? fcf.STRING :
                 nature == "number"   ? fcf.NUMBER :
                 nature == "boolean"  ? fcf.BOOLEAN :
                 nature == "nan"      ? fcf.NAN :
                 nature == "null"     ? fcf.NULL :
                                        fcf.UNDEFINED;
      }
      switch(nature) {
        case fcf.NUMBERED:
          if (fcf.isNumbered(a_value))
            return true;
          break;
        case fcf.ITERABLE:
          if (fcf.isIterable(a_value))
            return true;
          break;
        case fcf.ARRAY:
          if (Array.isArray(a_value))
            return true;
          break;
        case fcf.OBJECT:
          if (typeof a_value == "object" && a_value !== null && !(a_value instanceof Date))
            return true;
          break;
        case fcf.DATE:
          if (a_value instanceof Date)
            return true;
          if (a_softMode && typeof a_value == "string" && !isNaN(new Date(a_value).getTime()))
            return true;
          break;
        case fcf.STRING:
          if (typeof a_value === "string")
            return true;
          break;
        case fcf.NUMBER:
          if (typeof a_value === "number" && !isNaN(a_value))
            return true;
          if (a_softMode && !isNaN(a_value) && !isNaN(parseFloat(a_value)) )
            return true;
          break;
        case fcf.BOOLEAN:
          if (typeof a_value === "boolean")
            return true;
          break;
        case fcf.NAN:
          if (typeof a_value === "number" && isNaN(a_value))
            return true;
          break;
        case fcf.NULL:
          if (a_value === null)
            return true;
          break;
        case fcf.UNDEFINED:
          if (a_value === undefined)
            return true;
          break;
      }
    }
    return false;
  }



  /// @fn boolean fcf.empty(mixed a_object)
  /// @brief Checks if the object is empty.
  ///        The following are considered empty: empty arrays (all empty enumerated objects),
  ///        fieldless objects, empty strings, and the following values: new Date(NaN), NaN , null, undefined.
  /// @param mixed a_object Checked object
  /// @result boolean Returns true if the object is empty
  fcf.empty = (a_object) => {
    if (a_object === undefined || a_object === null) {
      return true;
    } else if (typeof a_object === "number") {
      return isNaN(a_object);
    } else if (typeof a_object === "string") {
      return a_object === "";
    } else if (a_object instanceof Error) {
      return false;
    } else if (a_object instanceof Date) {
      return isNaN(a_object.getTime());
    } else if (fcf.isIterable(a_object)) {
      for(let v of a_object)
        return false;
      return true;
    } else if (typeof a_object === "object") {
      for(var k in a_object)
        return false;
      return true;
    }
    return false;
  }



  /// @fn boolean fcf.has(object a_object, mixed a_key)
  /// @brief Checks if an object contains an element with a given key. Also performed for Map and Set objects
  /// @param mixed a_object - Checked object
  /// @param mixed a_key - Checked key
  /// @result boolean - Returns true if the object contains the given key
  fcf.has = (a_object, a_key) => {
    if (typeof a_object !== "object" || a_object === null) {
      return false;
    }
    if (fcf.isIterable(a_object) && typeof a_object.has == "function") {
      return a_object.has(a_key);
    }
    if (fcf.isNumbered(a_object)) {
      a_key = parseInt(a_key);
      return a_key >= 0 && a_key < a_object.length;
    }
    return a_key in a_object;
  }



  /// @fn mixed fcf.get(object a_object, mixed a_key)
  /// @brief Get an element stored in an object by key. Also performed for Map and Set objects
  /// @param object a_object - Source object
  /// @param mixed a_key - Source key
  /// @result mixed - Returns the element stored in the object,
  ///                 if the element is not found in the object, undefined is returned
  fcf.get = (a_object, a_key) => {
    if (typeof a_object !== "object" || a_object === null) {
      return;
    }
    if (a_object instanceof Set) {
      return a_object.has(a_key) ? a_key : undefined;
    }
    if (a_object instanceof Map) {
      return a_object.get(a_key);
    }
    return a_object[a_key];
  }



  /// @fn bool fcf.equal(mixed a_left, mixed a_right, boolean a_strict = false)
  /// @brief Compares two values for equality
  ///        The objects being compared can be simple types, arrays, objects, Date, Map and Set
  ///        When comparing two NaN, the function will return true
  /// @param mixed a_left - First comparison value
  /// @param mixed a_right - Second comparison value
  /// @param boolean a_strict = false - If true, then strict comparison is used for comparison ===
  /// @result boolean - Returns true if two values are equal
  fcf.equal = (a_left, a_right, a_strict) => {
    if (!_equalObject(a_left, a_right, a_strict))
      return false;
    if (typeof a_left == "object")
      return _equalObject(a_right, a_left, a_strict);
    return true;
  }
  function _equalObject(a_left, a_right, a_strict) {
    if (Array.isArray(a_left)) {
      if (!Array.isArray(a_right))
        return false;
      if (a_left.length != a_right.length)
        return false;
      for (let i = 0; i < a_left.length; ++i) {
        if (!fcf.equal(a_left[i], a_right[i], a_strict))
          return false;
      }
    } else if (a_left instanceof Date || a_right instanceof Date) {
      if (!(a_left instanceof Date) || !(a_right instanceof Date)){
        return false;
      } else {
        if (isNaN(a_left.getTime()) && isNaN(a_right.getTime()))
          return true;
        return a_left.getTime() == a_right.getTime();
      }
    } else if (typeof a_left === "object" && a_left !== null ){
      if (typeof a_right !== "object" || a_right == null)
        return false;
      if (Array.isArray(a_right))
        return false;
      if (a_strict && a_left.constructor != a_right.constructor) {
        return false;
      }
      let fastResult;
      fastResult = fcf.each(a_left, (a_key, a_value)=>{
        if (a_value !== undefined && !fcf.has(a_right, a_key))
          return false;
        if (!_equalObject(a_value, fcf.get(a_right, a_key), a_strict))
          return false;
      }).result();
      if (fastResult !== undefined)
        return fastResult;
      fastResult = fcf.each(a_right, (a_key, a_value)=>{
        if (a_value !== undefined && !fcf.has(a_left, a_key)){
          return false;
        }
      }).result();
      if (fastResult !== undefined)
        return false;
    } else {
      if (typeof a_left == "number" && isNaN(a_left) && typeof a_right == "number" && isNaN(a_right)){
        return true;
      }
      if (a_strict){
        if (a_left !== a_right) {
          return false;
        }
      } else {
        if (a_left != a_right) {
          return false;
        }
      }
    }
    return true;
  }



  /// @fn integer fcf.compare(mixed a_left, mixed a_right, boolean a_strict = false)
  /// @brief Compares two values
  ///        The objects being compared can be simple types, arrays, objects, Date, Map and Set
  ///        When comparing two NaN, the function will return 0
  /// @param mixed a_left - First comparison value
  /// @param mixed a_right - Second comparison value
  /// @param boolean a_strict = false - If it is true, then when comparing for equality, strict equality is used ===, if it is false, comparison == is used
  /// @result integer - Returns 0 if two values are equal;
  ///                   Returns 1 if a_left > a_right;
  ///                   Returns -1 if a_left < a_right;
  fcf.compare = (a_left, a_right, a_strict) => {
    let c = _compareObject(a_left, a_right, a_strict);
    if (c)
      return c;
    c = _compareObject(a_right, a_left, a_strict);
    return c == 0 ? 0 :
           c < 0  ? 1 :
                   -1;
  }
  function _compareObject(a_left, a_right, a_strict) {
    if (Array.isArray(a_left)) {
      if (!Array.isArray(a_right)) {
        return 1;
      }
      if (a_left.length != a_right.length) {
        return a_left.length < a_right.length ? -1 : 1;
      }
      for (let i = 0; i < a_left.length; ++i) {
        let c = fcf.compare(a_left[i], a_right[i], a_strict);
        if (c) {
          return c;
        }
      }
      return 0;
    } else if (typeof a_left === "object" && a_left !== null && !(a_left instanceof Date)) {
      if (typeof a_right !== "object" || a_right == null) {
        return 1;
      }
      if (Array.isArray(a_right)) {
        return -1;
      }
      if (a_strict){
        if (a_left.constructor > a_right.constructor) {
          return 1;
        } else if (a_left.constructor < a_right.constructor) {
          return -1;
        }
      }
      let fastResult;
      fastResult = fcf.each(a_left, (a_key, a_value)=>{
        if (a_value !== undefined && !fcf.has(a_right, a_key)) {
          return 1;
        }
        let c = fcf.compare(a_value, fcf.get(a_right, a_key), a_strict);
        if (c)
          return c;
      }).result();

      if (fastResult)
        return fastResult;

      fastResult = fcf.each(a_right, (a_key, a_value)=>{
        if (a_value !== undefined && !fcf.has(a_left, a_key))
          return -1;
      }).result();

      if (fastResult)
        return -1;

      return 0;
    } else {
      if (!a_strict) {
        if (a_left === undefined || a_left === null || a_left === 0 || a_left === false) {
          if (a_right === undefined || a_right === null || a_right === 0 || a_right === false){
            return 0;
          } else if (typeof a_right == "string") {
            let tr = fcf.trim(a_right);
            if (tr == "" || tr == "0")
              return 0;
          }
        }
        if (a_right === undefined || a_right === null || a_right === 0 || a_right === false) {
          if (a_left === undefined || a_left === null || a_left === 0 || a_left === false){
            return 0;
          } else if (typeof a_left == "string") {
            let tr = fcf.trim(a_left);
            if (tr == "" || tr == "0")
              return 0;
          }
        }
      }
      let t1 = a_left instanceof Date ? "date" : typeof a_left;
      let t2 = a_right instanceof Date ? "date" : typeof a_right;
      if (!a_strict && (typeof a_left == "number" || typeof a_right == "number")) {
        if (typeof a_left != "number") {
          a_left = parseFloat(a_left);
          t1 = "number";
        }
        if (isNaN(a_left)) {
          t1 = "nan";
        };
        if (typeof a_right != "number") {
          a_right = parseFloat(a_left);
          t2 = "number";
        }
        if (isNaN(a_right)) {
          t2 = "nan";
        };
      }
      let tc1 = _compareWeights[t1];
      let tc2 = _compareWeights[t2];
      if (t1 == "nan" && t2 == "nan") {
        return 0;
      } else if (!a_strict && a_left == a_right) {
        return 0;
      } else if (tc1 == tc2){
        if (a_left instanceof Date){
          a_left = a_left.getTime();
          a_right = a_right.getTime();
          if (isNaN(a_left) && isNaN(a_right))
            return 0;
        }
        if (a_left == a_right)
          return 0;
        if (a_left < a_right)
          return -1;
        return 1;
      } else if (tc1 > tc2){
        return 1
      } else {
        return -1;
      }
    }
  }
  const _compareWeights = {
    "undefined": 0,
    "null":      1,
    "nan":       2,
    "boolean":   3,
    "number":    4,
    "string":    5,
    "date":      6,
    "object":    7,
    "array":     8,
  };



  /// @fn number fcf.count(object a_object, function a_cb = undefined)
  /// @brief Safely determines the number of elements in an object or a string
  /// @param object a_object - Source object
  /// @param function a_cb = undefined - If a functor is given, then the child
  ///     element is taken into account if the function returns true
  ///     - Function signature: boolean a_cb(mixed a_key, mixed a_value)
  /// @result integer - Number of counted elements in an object or a string
  fcf.count = (a_object, a_cb) => {
    if (!a_cb) {
      if (typeof a_object == "object" && a_object !== null) {
        if (fcf.isNumbered(a_object)) {
          return a_object.length;
        } else if (a_object instanceof Map || a_object instanceof Set) {
          return a_object.size;
        } else {
          let count = 0;
          for(let k in a_object)
            ++count;
          return count;
        }
      } else if (typeof a_object == "string") {
        return a_object.length;
      } else {
        return 0;
      }
    } else {
      let res = 0;
      fcf.each(a_object, (a_key, a_val)=>{
        if (a_cb(a_key, a_val)) {
          ++res;
        }
      });
      return res;
    }
  }



  /// @fn fcf.Actions->mixed fcf.each(mixed a_obj, function a_cb(mixed a_key, mixed a_value) )
  /// @brief Iterates over the elements of the argument a_obj
  /// @details The function is used for unified enumeration of
  ///          objects, enumerated objects (but not strings).
  /// @details Iteration is performed until the last element or until the a_cb
  ///          functor returns a result other than undefined, Promise->!undefined or fcf.Actions->!undefined
  /// @param mixed a_obj - Iterable object
  /// @param function a_cb(mixed a_key, mixed a_value) - Functor, can be asynchronous.
  ///                     - Example:
  ///                       await fcf.each([1,2,3], async (a_key, a_value)=>{ ... }));
  /// @result mixed - Returns a fcf.Actions object with value of a last result.
  fcf.each = (a_obj, a_cb) => {
    let asyncResult;
    let result = undefined;
    if (fcf.isNumbered(a_obj) && (a_obj && typeof a_obj == "object" && typeof a_obj.forEach != "function")) {
      for(let i = 0; i < a_obj.length; ++i) {
        result = a_cb(i, a_obj[i]);
        if (result instanceof Promise || result instanceof fcf.Actions) {
          let index   = i + 1;
          let currentResult = result;
          result  = asyncResult ? asyncResult : fcf.actions();
          let actions = fcf.actions();
          let act     = undefined;
          result.then((a_res, a_act) => { act = a_act; });
          function doAction(){
            actions.then(()=>{
              if (index < a_obj.length)
                return a_cb(index, a_obj[index]);
            })
            .then((a_res)=>{
              ++index;
              if (a_res === undefined && index < a_obj.length) {
                doAction();
              } else {
                act.complete(a_res);
              }
            })
            .catch((e)=>{
              act.error(e);
            });
          }
          currentResult.then((a_res)=>{
            if (a_res === undefined) {
              doAction();
            } else {
              act.complete(a_res);
            }
          })
          .catch((e)=>{
            act.error(e);
          });
          break;
        } else if (result !== undefined) {
          break;
        }
      }
    } else if (typeof a_obj === "object" && a_obj !== null) {
      let asyncEnable = false;
      let asyncKeys = [];
      let index = 0;
      if (typeof a_obj.forEach === "function") {
        let breakLoop = false;
        a_obj.forEach((a_value, a_key)=>{
          if (breakLoop) {
            return;
          }
          if (asyncEnable) {
            asyncKeys.push([a_key, a_value]);
          } else {
            result = a_cb(a_key, a_value);
            if (result instanceof Promise || result instanceof fcf.Actions) {
              asyncEnable = true;
            } else if (result !== undefined) {
              breakLoop = true;
              return true;
            }
          }
        });
      } else {
        for(let k in a_obj) {
          if (asyncEnable) {
            asyncKeys.push([k, a_obj[k]]);
          } else {
            result = a_cb(k, a_obj[k]);
            if (result instanceof Promise || result instanceof fcf.Actions) {
              asyncEnable = true;
            } else if (result !== undefined) {
              break;
            }
          }
        }
      }

      if (asyncEnable) {
        let currentResult = result;
        result            = asyncResult ? asyncResult : fcf.actions();
        let actions       = fcf.actions();
        let act           = undefined;
        result.then((a_res, a_act) => { act = a_act; });
        function doAction(){
          actions.then(() => {
            if (index < asyncKeys.length)
              return a_cb(asyncKeys[index][0], asyncKeys[index][1]);
          })
          .then((a_res) => {
            ++index;
            if (a_res === undefined && index < asyncKeys.length) {
              doAction();
            } else {
              act.complete(a_res);
            }
          })
          .catch((e)=>{
            act.error(e);
          });

        }
        currentResult.then((a_res) => {
          if (a_res === undefined) {
            doAction();
          } else {
            act.complete(a_res);
          }
        })
        .catch((e)=>{
          act.error(e);
        });
      }
    }

    return (result instanceof fcf.Actions ? result : fcf.actions().result(result)).options({quiet: true}).exception();
  }



  /// @fn object fcf.append(object|array a_dstObject, object|array a_srcObject1, object|array a_srcObject2, ...)
  /// @fn object fcf.append(boolean a_recursionCopy, object a_dstObject, object a_srcObject1, object a_srcObject2, ...)
  /// @brief Copies properties from a_srcObjectN objects to the receiving object
  /// @param boolean a_recursionCopy - If the parameter is not used or is equal to false,
  ///                                  then only the fields are copied into the a_dstObject element from the a_srcObjectN objects.
  ///                                  If the parameter is used and equals true, then nested nested elements are copied recursively,
  ///                                  i.e. the object is supplemented with new objects.
  /// @param object|array a_dstObject - Receiving object
  /// @param object|array a_srcObject - Source objects
  /// @result object|array - Results a_dstObject
  fcf.append = (...args) => {
    let startArg = typeof args[0] === "boolean" ? 1 : 0;
    let req      = typeof args[0] === "boolean" && args[0];

    if (Array.isArray(args[startArg])) {
      for(let j = startArg + 1; j < args.length; ++j) {
        if (req) {
          if (Array.isArray(args[j])) {
            for(let i = 0; i < args[j].length; ++i) {
              let itm = args[j][i] === null            ? null :
                        args[j][i] instanceof Date     ? new Date(args[j][i]) :
                        Array.isArray(args[j][i])      ? fcf.append(true, [], args[j][i]) :
                        typeof args[j][i] === "object" ? fcf.append(true, new args[j][i].__proto__.constructor(), args[j][i]) :
                                                         args[j][i];
              args[startArg].push(itm);
            }
          } else {
            fcf.each(args[j], (a_key, a_value)=>{
              let itm = a_value === null            ? null :
                        a_value instanceof Date     ? new Date(a_value) :
                        Array.isArray(a_value)      ? fcf.append(true, [], a_value) :
                        typeof a_value === "object" ? fcf.append(true, new a_value.__proto__.constructor(), a_value) :
                                                      a_value;
              args[startArg].push(itm);
            });
          }
        } else {
          if (Array.isArray(args[j])) {
            for(let i = 0; i < args[j].length; ++i){
              args[startArg].push(args[j][i]);
            }
          } else {
            fcf.each(args[j], (a_key, a_value)=>{
              args[startArg].push(a_value);
            });
          }
        }
      }
    } else if (args[startArg] instanceof Set) {
      for(let j = startArg + 1; j < args.length; ++j) {
        if (typeof args[j] !== "object" || args[j] === null)
          continue;
        if (args[j] instanceof Set) {
          for(let key of args[j]) {
            args[startArg].add(key);
          }
        } else {
          fcf.each(args[j], (a_key, a_value) => {
            args[startArg].add(a_value);
          });
        }
      }
    } else if (args[startArg] instanceof Map) {
      for(let j = startArg + 1; j < args.length; ++j) {
        if (typeof args[j] !== "object" || args[j] === null)
          continue;
        if (req) {
          if (args[j] instanceof Map) {
            for(let pair of args[j]) {
              args[startArg].set(pair[0], cloneValue(pair[1]));
            }
          } else {
            fcf.each(args[j], (a_key, a_value) => {
              args[startArg].set(a_key, cloneValue(a_value));
            });
          }
        } else {
          if (args[j] instanceof Map) {
            for(let pair of args[j]) {
              args[startArg].set(pair[0], pair[1]);
            }
          } else {
            fcf.each(args[j], (a_key, a_value) => {
              args[startArg].set(a_key, a_value);
            });
          }
        }
      }
    } else if (typeof args[startArg] === "object" && args[startArg] !== null) {
      for(let j = startArg + 1; j < args.length; ++j) {
        if (typeof args[j] !== "object" || args[j] === null)
          continue;
        if (req) {
          if (!Array.isArray(args[j]) && !(args[j] instanceof Map) && !(args[j] instanceof Set)) {
            for(let key of Object.getOwnPropertyNames(args[j])) {
              args[startArg][key] = cloneValue(args[j][key]);
            }
          } else {
            fcf.each(args[j], (a_key, a_value) => {
              args[startArg][a_key] = cloneValue(a_value);
            });
          }
        } else {
          if (!Array.isArray(args[j]) && !(args[j] instanceof Map) && !(args[j] instanceof Set)) {
            for(let key of Object.getOwnPropertyNames(args[j])) {
              args[startArg][key] = args[j][key];
            }
          } else {
            fcf.each(args[j], (a_key, a_value)=>{
              args[startArg][a_key] = a_value;
            });
          }
        }
      }
    }
    return args[startArg];
  }

  const cloneValue = (a_source) => {
    if (a_source === null) {
      return null;
    } else if (a_source instanceof Date) {
      return new Date(a_source);
    } else if (Array.isArray(a_source)) {
      return fcf.append(true, [], a_source);
    } else if (typeof a_source === "object") {
      let base;
      try {
        base = new a_source.__proto__.constructor();
      } catch(e) {
        base = {};
      }
      return fcf.append(true, base, a_source);
    } else {
      return a_source;
    }
  }


  /// @fn mixed fcf.clone(mixed a_value)
  /// @brief Creates a copy of an object
  /// @param mixed a_value - Source value
  /// @result mixed - Returns a clone of a_value
  fcf.clone = (a_object) => {
    if (a_object === null) {
      return null;
    } else if (Array.isArray(a_object)) {
      return fcf.append(true, [], a_object);
    } else if (a_object instanceof Date) {
      return new Date(a_object);
    } else if (typeof a_object == "object") {
      let base;
      try {
        base = new a_object.__proto__.constructor();
      } catch(e){
        base = {};
      }
      return fcf.append(true, base, a_object);
    } else {
      return a_object;
    }
  }



  /// @fn [string|object] fcf.parseObjectAddress(string a_path, boolean a_exMode = false)
  /// @brief Converts a string with the address of an object to an array with information about the elements
  /// @details The address format can take the following form:
  ///             - Dot separated fields: "field.subfield.subsubfield"
  ///             - Fields enclosed in brackets: "field[\"subfield\"][\"subsubfield\"]"
  ///             - The address containing the array is enclosed in double quotes: "field[[\"subarray\"]][0]"
  /// @param string a_path - Object path
  /// @param boolean a_exMode = false - If it is true, then the function returns an array of objects with information
  ///                                   about the elements, each element contains the part field - the name of the field and
  ///                                   the array field which is true if an array is given
  /// @result [string|object] - Returns an array with fields.
  ///                             - If the a_exMode option is true, then each element contains an object with fields:
  ///                               - string part - field name
  ///                               - boolean array - is true if the element is an array
  ///                             - If the a_exMode argument is false then the array elements are strings with field names
  fcf.parseObjectAddress = (a_path, a_exMode) => {
    if (Array.isArray(a_path)){
      let result = [];
      for(let part of a_path) {
        if (a_exMode){
          result.push(typeof part == "object" ? part : {part: part, array: false});
        } else {
          result.push(typeof part == "object" ? part.part : part);
        }
      }
      return result;
    }
    // 0 - simple
    // 1 - in []   || [[]]
    // 2 - in [""] || [[""]]
    // 3 - in [''] || [['']]
    let state  = 0;
    let isa    = false;
    let result = [];
    let buf    = "";
    let i      = 0;
    while(i < a_path.length) {
      switch(state){
        case -1:
          {
            while(i < a_path.length) {
              if (a_path.charCodeAt(i) <= 32) {
                ++i;
                break;
              } if (a_path[i] == "."){
                state = 0;
                ++i;
                break;
              } else if (a_path[i] == "["){
                ++i;
                while(i < a_path.length) {
                  if (a_path.charCodeAt(i) <= 32){
                    ++i;
                    continue;
                  }
                  if (a_path[i] == "[" && !isa){
                    isa = true;
                    ++i;
                    continue;
                  } else if (a_path[i] == "\""){
                    ++i;
                    state = 2;
                    break;
                  } else if (a_path[i] == "'"){
                    ++i;
                    state = 3;
                    break;
                  } else {
                    state = 1;
                    break;
                  }
                };
                break;
              } else {
                state = 0;
                break;
              }
            }
          }
          break;
        case 0:
          {
            let start = true;
            while(true) {
              if (a_path[i] == "."){
                let rpos = buf.length-1;
                while(rpos >= 0 && buf.charCodeAt(rpos) <= 32) {
                  --rpos;
                }
                if (rpos != buf.length-1) {
                  buf = buf.substring(0, rpos+1);
                }
                if (a_exMode)
                  result.push({part: buf, array: isa});
                else
                  result.push(buf);
                isa = false;
                buf = "";
                state = -1;
                break;
              } else if (a_path[i] == "["){
                let rpos = buf.length-1;
                while(rpos >= 0 && buf.charCodeAt(rpos) <= 32) {
                  --rpos;
                }
                if (rpos != buf.length-1) {
                  buf = buf.substring(0, rpos+1);
                }
                if (buf.length || result.length){
                  if (a_exMode)
                    result.push({part: buf, array: isa});
                  else
                    result.push(buf);
                }
                isa = false;
                buf = "";
                state = -1;
                break;
              } else if ((i+1) >= a_path.length){
                buf += a_path[i];
                let rpos = buf.length-1;
                while(rpos >= 0 && buf.charCodeAt(rpos) <= 32) {
                  --rpos;
                }
                if (rpos != buf.length-1) {
                  buf = buf.substring(0, rpos+1);
                }
                if (a_exMode)
                  result.push({part: buf, array: isa});
                else
                  result.push(buf);
                isa = false;
                buf = "";
                ++i;
                break;
              }
              if (start){
                if (a_path.charCodeAt(i) > 32) {
                  buf += a_path[i];
                  start = false;
                }
              } else {
                buf += a_path[i];
              }
              ++i;
            }
          }
          break;
        case 1:
          {
            while(true) {
              if (a_path[i] == "]"){
                let rpos = buf.length-1;
                while(rpos >= 0 && buf.charCodeAt(rpos) <= 32) {
                  --rpos;
                }
                if (rpos != buf.length-1) {
                  buf = buf.substring(0, rpos+1);
                }
                if (a_exMode)
                  result.push({part: buf, array: isa});
                else
                  result.push(buf);
                buf = "";
                state = -1;
                if (isa){
                  ++i;
                  while(true){
                    if (i >= a_path.length){
                      break;
                    }
                    if (a_path[i] == "]"){
                      ++i;
                      break;
                    }
                    ++i;
                  }
                } else {
                  ++i;
                }
                isa = false;
                break;
              } else if ((i+1) >= a_path.length) {
                buf += a_path[i];
                let rpos = buf.length-1;
                while(rpos >= 0 && buf.charCodeAt(rpos) <= 32) {
                  --rpos;
                }
                if (rpos != buf.length-1) {
                  buf = buf.substring(0, rpos+1);
                }
                if (a_exMode)
                  result.push({part: buf, array: isa});
                else
                  result.push(buf);
                isa = false;
                buf = "";
                ++i;
                break;
              }
              buf += a_path[i];
              ++i;
            }
          }
          break;
        case 2:
        case 3:
          {
            let sc = 0;
            let stopChar = state == 2 ? "\"" : "'";
            while(true) {
              if (a_path[i] == stopChar && !(sc % 2)) {
                if (a_exMode)
                  result.push({part: buf, array: isa});
                else
                  result.push(buf);
                buf = "";
                state = -1;
                while(i < a_path.length){
                  if (a_path[i] == "]"){
                    ++i;
                    break;
                  }
                  ++i;
                }
                if (isa){
                  while(i < a_path.length){
                    if (a_path[i] == "]"){
                      ++i;
                      break;
                    }
                    ++i;
                  }
                }
                isa = false;
                break;
              }
              if ((i+1) >= a_path.length) {
                buf += a_path[i];
                if (a_exMode)
                  result.push({part: buf, array: isa});
                else
                  result.push(buf);
                isa = false;
                buf = "";
                state = -1;
                ++i;
                break;
              }
              if (a_path[i] == "\\"){
                if (sc % 2) {
                  buf += a_path[i];
                }
                ++sc;
              } else {
                buf += a_path[i];
                sc = 0;
              }
              ++i;
            }
          }
          break;
      }
    }
    if (!result.length) {
      if (a_exMode) {
        result.push({part: "", array: false});
      } else {
        result.push("");
      }
    }
    return result;
  }



  /// @fn string fcf.normalizeObjectAddress(string|[string] a_path)
  /// @brief Normalizes the address of an object
  /// @param string|[string] a_path - Address of the object.
  /// @result string Normalized object address
  fcf.normalizeObjectAddress = (a_path) => {
    var arr = fcf.parseObjectAddress(a_path, true);
    var result = "";
    for(var i = 0; i < arr.length; ++i) {
      let key;
      let isa;
      if (typeof arr[i] == "object") {
        key = arr[i].part;
        isa = arr[i].array;
      } else {
        key = arr[i];
        isa = false;
      }
      key = fcf.escapeQuotes(key, "\"");
      if (!isa) {
        result += "[\"" + key + "\"]";
      } else {
        result += "[[\"" + key + "\"]]";
      }
    }
    return result;
  }



  /// @fn mixed fcf.resolve(object a_obj, string|[string] a_path, boolean a_quiet = true)
  /// @brief Returns a subobject at the given path
  /// @param object a_obj - Root object
  /// @param string|[string] a_obj - Path to returned subobject
  /// @param a_quiet = true - If equality is false, then arriving at an element is no exception,
  ///                         If the equality is false, then the arrival to the element is not disappeared is thrown with the code ACCESS_FAILED_FIELD_TOKENIZE,
  /// @result mixed - subobject data
  /// @example
  ///   JS:
  ///     var root = { object: { subobject: { value: "123" } } } };
  ///     var value  = fcf.resolve(root, "object.subobject.value");
  ///     console.log(value);
  ///   Console output:
  ///     123
  fcf.resolve = (a_obj, a_path, a_quiet) => {
    if (typeof a_obj !== "object") {
      return;
    }
    let path = fcf.parseObjectAddress(a_path);
    for(let i = 0; i < path.length; ++i) {
      a_obj = a_obj[path[i]];
      if (a_obj === undefined) {
        if (a_quiet !== undefined && !a_quiet && i != path.length - 1) {
          throw new fcf.Exception("ACCESS_FAILED_FIELD_TOKENIZE", {command: a_path});
        }
        return;
      }
    }
    return a_obj;
  }



  /// @fn object fcf.resolveEx(object a_obj, string|[string|object] a_path, boolean a_createObj = false)
  /// @brief Returns a subobject information at the given path
  /// @param object a_obj - Root object
  /// @param string|[string] a_obj - Path to returned subobject
  /// @param boolean a_createObj = false - If true, then if there are no nested objects, they are created.
  /// @result object - a subobject information
  ///                   - object object - Object containing subobject
  ///                   - string key - Subobject name
  /// @example
  ///   JS:
  ///     var root = { object: { subobject: { value: "123" } } } };
  ///     var ref  = fcf.resolveEx(root, "object.subobject.value");
  ///     console.log(ref)
  ///   Console output:
  ///     {
  ///       object: { value: "123" },
  ///       key: "value"
  ///     }
  fcf.resolveEx = (a_obj, a_path, a_createObj) => {
    let result = {
      key: undefined,
      object: undefined,
    };
    if (typeof a_obj !== "object"){
      return result;
    }
    let pathArr = fcf.parseObjectAddress(a_path, true);
    let cur = a_obj;
    for(var i = 0; i < pathArr.length-1; ++i) {
      let key = pathArr[i].part;
      if (cur[key] === undefined || cur[key] === null) {
        if (a_createObj) {
          if (pathArr[i].array){
            cur[key] = [];
          } else {
            cur[key] = {};
          }
        } else {
          return result;
        }
      }
      cur = cur[key];
    }
    result.key = pathArr[pathArr.length-1].part;
    result.object = cur;

    return result;
  }



  /// @fn object fcf.prepare(object a_object, string|[string|object] a_objectPath)
  /// @brief Creates an object at the path specified in the argument if the object does not exist.
  ///        And returns the specified object.
  /// @param object a_object - The object in which the elements are created
  /// @param string|[string|object] a_objectPath - Object path
  /// @result object - Object at path a_objectPath from object a_object
  fcf.prepare = (a_root, a_objectPath) => {
    a_objectPath = typeof a_objectPath == "string" ? fcf.parseObjectAddress(a_objectPath, true) :
                   Array.isArray(a_objectPath)     ? a_objectPath :
                                                     false;
    if (!a_objectPath)
      return a_root;
    for (let part of a_objectPath) {
      if (typeof part == "object") {
        if (!(part.part in a_root))
          a_root[part.part] = part.array ? [] : {};
        a_root = a_root[part.part];
      } else {
        if (!(part in a_root))
          a_root[part] = {};
        a_root = a_root[part];
      }
    }
    return a_root;
  }



  /// @fn string fcf.getDirectory(string a_path)
  /// @brief Returns the path of a directory
  /// @param string a_path - Source path
  /// @result string
  fcf.getDirectory = (a_path) => {
    let i = a_path.length - 1;
    for(; i >= 0; --i){
      let c = a_path[i];
      if (c == "\\" || c == "/"){
        break;
      }
    }
    return i == -1 ? "" : a_path.substring(0, i);
  }



  /// @fn string fcf.getExtension(string a_path)
  /// @brief Returns an extension for a file path
  /// @param string a_path - Source path
  /// @result string
  fcf.getExtension = (a_path) => {
    if (typeof a_path !== "string")
      return "";
    a_path = a_path.split("?")[0].split("#")[0];
    var arr = a_path.split(".");
    return arr.length > 1 ? arr[arr.length-1] : "";
  }



  /// @fn string fcf.getExtension(string a_path)
  /// @brief Returns a filename without a path extension
  /// @param string a_path - Source path
  /// @result string
  fcf.getShortFileName = (a_path) => {
    if (!a_path)
      return "";
    var offset = -1;
    for (var p = 0; p < a_path.length; ++p) {
      var c = a_path.charAt(p);
      if (c == ":" || c == "/" || c == "\\")
        offset = p;
    }
    let arr = a_path.substr(offset == -1 ? 0 : offset+1).split(".");
    if (arr.length > 1)
      arr.pop();
    return arr.join(".");
  }



  /// @fn string fcf.getExtension(string a_path)
  /// @brief Returns a filename
  /// @param string a_path - Source path
  /// @result string
  fcf.getFileName = (a_path) => {
    a_path = fcf.rtrim(a_path, "/");
    if (!a_path)
      return "";
    var offset = 0;
    for (var p = 0; p < a_path.length; ++p) {
      var c = a_path.charAt(p);
      if (c == ":" || c == "/" || c == "\\")
        offset = p;
    }

    if (offset)
      offset += 1;

    return a_path.substr(offset);
  }



  /// @fn string fcf.resolvePath(string a_uri, object a_aliases = undefined)
  /// @brief Converts a URI alias string to a real path in FCF notation.
  /// @details The data from the aliases configuration and the a_aliases argument is used as aliases
  /// @param string a_uri - Transformable string
  /// @param object a_aliases - Aliases object. The alias is the key and the value is the path.
  /// @result string - Result string
  fcf.resolvePath = function(a_uri, a_aliases) {
    if (a_uri[0] != "@")
      return a_uri;
    let pos;
    pos = Math.min( (pos = a_uri.indexOf("+")) != -1 ? pos : Infinity,
                    (pos = a_uri.indexOf("?")) != -1 ? pos : Infinity,
                    (pos = a_uri.indexOf("#")) != -1 ? pos : Infinity,
                    (pos = a_uri.indexOf("/")) != -1 ? pos : Infinity,
                    (pos = a_uri.indexOf("\\")) != -1 ? pos : Infinity,
                    (pos = a_uri.indexOf(".wrapper.js")) != -1 ? pos : Infinity,
                    (pos = a_uri.indexOf(".wrapper.min.js")) != -1 ? pos : Infinity);
    let prefix   = pos != Infinity ? a_uri.substring(1, pos) : a_uri.substring(1);
    let suffix   = pos != Infinity ? a_uri.substring(pos) : "";
    if (typeof a_aliases == "object" && prefix in a_aliases){
      a_uri = a_aliases[prefix] + suffix;
    } else if (prefix in fcf.getConfiguration().aliases) {
      a_uri = fcf.getConfiguration().aliases[prefix] + suffix;
    } else {
      throw new fcf.Exception("RESOLVE_PATH_ERROR", {path: a_uri});
    }
    return a_uri;
  }



  /// @fn string fcf.normalizePath(string a_path, boolean a_isServerPath = fcf.isServer())
  /// @brief Normalizes the resource path (FS/HTTP/HTTPS). Removes paths ./ and performs an offset .. inside the package's relative path
  /// @param string a_path - Path
  /// @param boolean a_isServerPath = fcf.isServer() - If it is true, then the path contains the FS address,
  ///                                                  If it is false, the path contains the WEB (HTTP/HTTPS) address
  /// @result string - Normalized path
  fcf.normalizePath = (a_path, a_isServerPath) => {
    let prefixPosEnd = 0;
    let pos;
    a_isServerPath = a_isServerPath !== undefined ? a_isServerPath : _isServer;
    if (a_path[0] == "/") {
      prefixPosEnd = 1;
    } else if ((pos = a_path.indexOf(":")) != -1) {
      if ((a_isServerPath || a_isServerPath === "*") && a_path[pos+1] == "\\" && pos == 1) {
        prefixPosEnd = pos + 2;
      } else if ((!a_isServerPath || a_isServerPath === "*") && (a_path.indexOf("http://") == 0 || a_path.indexOf("https://") == 0)) {
        a_isServerPath = false;
        prefixPosEnd = a_path.indexOf("/", a_path.indexOf("://") + 3);
        if (prefixPosEnd == -1) {
          prefixPosEnd = a_path.length;
        } else {
          prefixPosEnd += 1;
        }
      } else {
        let subitem  = a_path.substring(0, pos);
        if (subitem.indexOf("/") == -1 && subitem.indexOf("\\") == -1) {
          prefixPosEnd = pos + 1;
        }
      }
    }
    let prefix = a_path.substring(0, prefixPosEnd);
    let body    = a_path.substring(prefixPosEnd);
    let suffix  = "";
    if (!a_isServerPath){
      if ((pos = body.indexOf("?")) != -1 || (pos = body.indexOf("#")) != -1){
        suffix = body.substring(pos);
        body = body.substring(0, pos);
      }
    }
    body = fcf.replaceAll(body, "\\", "/");
    let bodyArr = body.split("/");
    let resultBodyArr = [];
    for(let itm of bodyArr) {
      if (itm == "." || itm == ""){
        continue;
      } else if (itm == "..") {
        resultBodyArr.pop();
      } else {
        resultBodyArr.push(itm);
      }
    }
    return prefix + resultBodyArr.join("/") + suffix;
  }



  /// @fn string fcf.normalizeSubpath(string a_path)
  /// @brief Normalizes the relative subpath. Removes paths. and performs an offset .. inside the relative path
  /// @param string a_path - Path
  /// @result string - Normalized path
  fcf.normalizeSubpath = (a_path)=>{
    let body    = fcf.replaceAll(a_path, "\\", "/");
    let bodyArr = body.split("/");
    let resultBodyArr = [];
    for(let itm of bodyArr) {
      if (itm == "." || itm == ""){
        continue;
      } else if (itm == "..") {
        resultBodyArr.pop();
      } else {
        resultBodyArr.push(itm);
      }
    }
    return resultBodyArr.join("/");
  }



  /// @fn {module, subpath} fcf.getPathInfo(string a_path, a_isServerPath = fcf.isServer(), boolean a_quiet = false)
  /// @brief Returns the module and the subpath by the path
  /// @param string a_path - source path
  /// @param a_isServerPath = fcf.isServer() - If true then a_path contains the path on the server, otherwise a_path is the network address
  /// @param boolean a_quiet = false - If the parameter is equal to false if the path does not contain
  ///                                  the application catalog or the path to the module is excluded by
  ///                                  fcf.Exception with the GET_PATH_INFO_ERROR code.
  ///                                  If the argument is equal to true, then an empty object returns.
  /// @result {module, subpath} - Returns an object containing the name of the module and the subpath in this module.
  fcf.getPathInfo = (a_path, a_isServerPath, a_quiet) => {
    a_isServerPath = a_isServerPath === undefined ? fcf.isServer() : a_isServerPath;
    let path = fcf.resolvePath(a_path);
    path = fcf.normalizePath(path, a_isServerPath);
    if (path.indexOf("/") == -1 && path.indexOf("\\") == -1 && path.indexOf(":") == -1) {
      return { module: "", subpath: path};
    }
    let cwd = fcf.isServer() ? fcf.normalizePath(process.cwd()) : undefined;
    if ((!a_isServerPath || a_isServerPath === "*") && (path.indexOf("http://") != -1 || path.indexOf("https://") != -1)) {
      if (!_isServer) {
        let pos = window.location.href.indexOf("://");
        if (pos != -1 && (pos = window.location.href.indexOf("/", pos+3)) != -1 && path.indexOf(window.location.href.substring(0, pos)) != -1){
          path = path.substring(pos);
        } else {
          return {};
        }
      } else {
        return {};
      }
    }
    let pos = path.indexOf(":");
    if (pos == 1)
      pos = -1;
    let mod = pos != -1 ? path.substring(0, pos) : "";
    if (mod.indexOf("/") != -1 || mod.indexOf("\\") != -1) {
      mod = undefined;
      pos = -1;
    }
    if (pos != -1) {
      return {module: mod, subpath: path.substring(pos+1)};
    }
    let rootPath = fcf.getPath(path);
    if (!a_isServerPath || a_isServerPath === "*") {
      let sources = fcf.getConfiguration().sources;
      for(let modName in sources) {
        if (!sources[modName].webPackagePath)
          continue;
        if ((pos = rootPath.indexOf(sources[modName].webPackagePath)) == 0) {
          return {module: modName, subpath: rootPath.substring(sources[modName].webPackagePath.length+1)};
        }
      }
    }
    let modDirs;
    if (_isServer) {
      let splitter = process.platform == "win32" ? ";" : ":" ;
      modDirs = [];
      for(let mod of require.main.paths) {
        fcf.append(modDirs, mod.split(splitter).filter((v)=>{ return v != "" && v != "." }))
      }
      fcf.append(modDirs, process.env.NODE_PATH.split(splitter).filter((v)=>{ return v != "" && v != "." }));
    } else {
      modDirs = [fcf.getConfiguration().webModuleDirectory];
    }
    for(let modDir of modDirs) {
      modDir = fcf.normalizePath(modDir);
      if (_isServer && (a_isServerPath || a_isServerPath === "*") && cwd == modDir) {
        continue;
      }
      if ((pos = rootPath.indexOf(modDir)) == 0){
        mod = rootPath.substring(modDir.length+1).split("/")[0].split("\\")[0];
        if (_isServer && (a_isServerPath || a_isServerPath === "*") && (cwd == modDir+"/"+mod || cwd == modDir+"\\"+mod)) {
          mod = undefined;
          pos = -1;
        } else if (!mod) {
          mod = undefined;
          pos = -1;
        } else {
          return {module: mod, subpath: rootPath.substring(modDir.length + 1 + mod.length + 1)};
        }
      }
    }
    if (_isServer && (a_isServerPath || a_isServerPath === "*") && path.indexOf(cwd) == 0) {
      return {module: "", subpath: path.substr(process.cwd().length + 1)};
    }
    if (!a_isServerPath || a_isServerPath === "*" || (path[0] != "/" && path.indexOf(":\\") != 1)) {
      return {module: "", subpath: fcf.ltrim(path, "/")};
    }
    if (!a_quiet) {
      throw new fcf.Exception("GET_PATH_INFO_ERROR", {path: a_path})
    }
    return {};
  }



  ///@fn string fcf.getPath(string a_uri, string a_aliases, a_innerServerPath = fcf.isServer());
  ///@fn string fcf.getPath(string a_uri, string a_innerServerPath = fcf.isServer());
  ///@details Translates a relative URI in FCF notation into a real resource path
  ///@param string a_uri - Relative URI in FCF
  ///@param object a_aliases - Additional aliases for converting URIs
  ///@param object a_innerServerPath = fcf.isServer()- If it is true, then the path is converted to a file path
  ///                                                  on the server side, if it is false, the result will be a URI on the browser side
  ///@result string - Converted URI
  fcf.getPath = (a_uri, a_aliases, a_innerServerPath) => {
    if (typeof a_aliases !== "object") {
      a_innerServerPath = a_aliases;
      a_aliases = undefined;
    }
    a_innerServerPath = a_innerServerPath !== undefined ? a_innerServerPath : _isServer;
    a_uri = fcf.str(a_uri);
    a_uri = fcf.resolvePath(a_uri, a_aliases);
    a_uri = fcf.normalizePath(a_uri, a_innerServerPath);

    if (a_innerServerPath) {
      let winDSPos = a_uri.indexOf(":\\");
      if (a_uri[0] == "/" || (winDSPos != -1 && winDSPos < 2))
        return fcf.normalizePath(a_uri);
    } else {
      if (a_uri.indexOf("://") != -1)
        return a_uri;
    }

    let modulePos    = a_uri.indexOf(":");
    let moduleName   = modulePos != -1 ? a_uri.substring(0, modulePos) : "";
    let relativePath = modulePos != -1 ? a_uri.substring(modulePos + 1) : a_uri;
    if (moduleName.indexOf("/") != -1 || moduleName.indexOf("\\") != -1) {
      modulePos = -1;
      relativePath = a_uri;
      moduleName = "";
    }

    const configuration = fcf.getConfiguration();

    if (moduleName != "") {
      if (a_innerServerPath){
        let modulePath = libResolver.resolveModule(moduleName);
        a_uri = fcf.normalizePath(libPath.join(modulePath, relativePath));
      } else {
        let prefix = "";
        let srcInfo = configuration.sources[moduleName];
        if (typeof srcInfo == "string"){
          srcInfo = {webPackagePath: srcInfo};
        }
        if (srcInfo && srcInfo.webPackagePath){
          prefix += srcInfo.webPackagePath;
        } else {
          prefix += configuration.webModuleDirectory + "/" + moduleName;
        }
        if (prefix && relativePath && relativePath[0] != "/" && relativePath[0] != "\\"){
          prefix += "/";
        }
        a_uri = prefix + relativePath;
      }
    } else {
      if (a_innerServerPath){
        a_uri = fcf.normalizePath(libPath.join(process.cwd(), relativePath));
      } else {
        a_uri = "/" + fcf.ltrim(relativePath, ["/", "\\", ":"]);
      }
    }

    return a_uri;
  }



  // @fn string fcf.styleToString(string a_name, a_mixed a_value)
  // @fn string fcf.styleToString(object a_descriptions)
  // @brief Converts the a_name and a_value parameters to a string of the format `a_name : a_value`.
  //        For dimension values, automatically adds the ending "px";
  // @param string a_name - Style Name.
  // @param string a_value - Style value.
  //                         For dimension values ("left", "top", "bottom", "right",
  //                         "width", "min-width", "max-width", "height", "min-height",
  //                         "max-height"), automatically adds the ending "px";
  // @param {a_name: a_value} a_descriptions - Object with property description
  // @result Returns a string of the format `a_name : a_value`.
  fcf.styleToString = (a_name, a_value) => {
    let result = "";
    if (typeof a_name == "object" && a_name !== null){
      let first = true;
      for(let key in a_name) {
        if (first) {
          first = false;
        } else {
          result += "; ";
        }
        result += fcf.styleToString(key, a_name[key]);
      }
    } else {
      if (a_value === undefined || a_value === null || a_value === "")
        return result;
      if (["left", "top", "bottom", "right", "width", "min-width", "max-width", "height", "min-height", "max-height"].indexOf(a_name) != -1) {
        if (!isNaN(a_value)) {
          a_value = a_value + "px";
        }
      }
      result = a_name + ": " + a_value;
    }
    return result;
  }



  //////////////////////////////////////////////////////////////////////////////
  // FUNCTIONS AND CLASSES OF BASIC FUNCTIONALITY
  //////////////////////////////////////////////////////////////////////////////



  /// @fn fcf.Actions->mixed fcf.load(string a_urlOrFile, object a_options)
  /// @brief Loads the specified resource by URL.
  /// @param string a_urlOrFile - Resource URL or file path on a server
  /// @param object a_options - Additional options
  ///                             - string|object|FormData body - Data passed in the body of the request.
  ///                                                             The request body can be a FormData object, but only for browser requests.
  ///                             - string method = "GET" - HTTP request method (GET|POST|...)
  ///                             - bool async = true - If true, the asynchronous request is executed.
  ///                                                   If false, the synchronous request is executed,
  ///                                                   but for http requests sent from the server,
  ///                                                   this parameter will be ignored (an asynchronous call will always be performed)
  ///                             - bool|"auto" external = false - By default, the fcf.load function on the server side
  ///                                                              loads only local files, and if you need to make an http request from the server side,
  ///                                                              you need to set the external parameter to true or "auto".
  ///                                                              - If the parameter is false - the request on the server side is performed only for the local file
  ///                                                              - If the parameter is true - the request on the server side is performed only for the http resource
  ///                                                              - If the parameter is equal to "auto" - a request on the server side is performed
  ///                                                                to a local file or http resource, depending on the a_urlOrFile parameter
  ///                             - object header - HTTP request header options
  ///                             - string format = "raw" - Response format (raw|json|auto).
  ///                                                             - raw - The function returns a string received from the server
  ///                                                             - json - The function returns data received in JSON format
  ///                                                             - auto - If the data can be read as JSON, then the corresponding data is returned,
  ///                                                                      otherwise the string received from the server is returned
  fcf.load = (a_url, a_options) => {
    if (typeof a_url === "object") {
      a_options = a_url;
      a_url = a_options.url || a_options.path;
    }
    a_url = fcf.resolvePath(a_url);
    a_options = typeof a_options == "object" ? a_options : {};
    if ( a_options.external === true ||
         !_isServer ||
         (a_options.external === "auto" && a_url.indexOf("http://") == 0 && a_url.indexOf("https://") == 0)
       ) {
      a_url = new fcf.RouteInfo(a_url).url;
    }
    let isServerMode =  _isServer && a_options.external === "auto" ? a_url.indexOf("http://") == -1 && a_url.indexOf("https://") == -1 :
                        _isServer && a_options.external            ? false :
                                                                     _isServer;

    a_options = a_options || {};
    let type = a_options.format;

    if (!_isServer && (a_url.indexOf("://") == -1 || a_url.indexOf(window.location.href) == 0)) {
      let ext = fcf.getExtension(new fcf.RouteInfo(a_url).uri).toLowerCase();
      if (ext == "js" || ext == "css") {
        let module = fcf.getPathInfo(a_url, isServerMode).module;
        if (module && fcf.getConfiguration().sources[module] && fcf.getConfiguration().sources[module].version){
          a_url = fcf.buildUrl(a_url, {version: fcf.getConfiguration().sources[module].version});
        }
      }
    }

    return fcf.actions()
    .then((a_res, a_act) => {
      if (_isServer) {
        if (!isServerMode) {
          let options = fcf.clone(a_options);
          options.header = options.header || {};
          let serverName = (new fcf.RouteInfo(a_url)).server;
          let isSendContext = a_url[0] == "@" || a_url[0] == "/" || (serverName && serverName == fcf.getConfiguration().host) ;
          if (isSendContext) {
            let ctxt = fcf.append({}, fcf.getContext());
            delete ctxt.route;
            delete ctxt.args;
            delete ctxt.safeEnv;
            options.header["fcf-context"] = fcf.encodeBase64(JSON.stringify(ctxt));
          }
          libLoad(a_url, options)
          .then((a_data)=>{
            a_act.complete(a_data);
          })
          .catch((a_error)=>{
            a_act.error(a_error);
          })
        } else if (a_options.async === undefined || !!a_options.async) {
          libFS.readFile(fcf.getPath(a_url), 'utf8', (a_error, a_data) => {
            if (a_error) {
              a_act.error(a_error);
            }
            a_act.complete(a_data);
          });
        } else {
          try {
            a_act.complete(libFS.readFileSync(fcf.getPath(a_url), 'utf8'));
          } catch(e){
            a_act.error(e);
          }
        }
      } else {
        let url = fcf.getPath(a_url);
        let method = (a_options.method || "GET").toUpperCase();
        if (method == "GET") {
          url = fcf.buildUrl(url, a_options.data);
        }
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = () => {
          if (xmlHttp.readyState == 4) {
            if (xmlHttp.status == 200) {
              a_act.complete(xmlHttp.responseText);
            } else {
              let error = xmlHttp.responseText;
              try {
                error = JSON.parse(error);
              } catch(e) {
              }
              if (typeof error !== "object" || !error._templateMessage) {
                error = new fcf.Exception("HTTP_REQUEST_ERROR", {code: xmlHttp.status});
              } else {
                error = new fcf.Exception(error);
              }
              a_act.error(error);
            }
          }
        };
        xmlHttp.open(method, url, a_options.async !== undefined ? a_options.async : true);
        let serverName = (new fcf.RouteInfo(url)).server;
        let isSendContext = url[0] == "@" || url[0] == "/" ||  (serverName && serverName == window.location.hostname) ;
        if (isSendContext) {
          let ctxt = fcf.append({}, fcf.getContext());
          delete ctxt.route;
          delete ctxt.args;
          delete ctxt.safeEnv;
          xmlHttp.setRequestHeader("fcf-context", fcf.encodeBase64(JSON.stringify(ctxt)));
        }
        if (typeof a_options.header == "object") {
          for(let k in a_options.header) {
            xmlHttp.setRequestHeader(k, a_options.header[k]);
          }
        }
        if (method !== "GET") {
          let foundContentType = false;
          if (typeof a_options.header === "object") {
            for(let k in a_options.header) {
              if (k.toLowerCase() == "content-type"){
                foundContentType = true;
                break;
              }
            }
          }
          if (a_options.body instanceof FormData) {
            if (!foundContentType)
              xmlHttp.setRequestHeader("Content-Type", "multipart/form-data");
            xmlHttp.send(a_options.body);
          } else if (typeof a_options.body == "string"){
            if (!foundContentType)
              xmlHttp.setRequestHeader("Content-Type", "text/plain");
            xmlHttp.send(a_options.body);
          } else if (a_options.body !== undefined && a_options.body !== null) {
            if (!foundContentType)
              xmlHttp.setRequestHeader("Content-Type", "application/json");
            xmlHttp.send(JSON.stringify(a_options.body));
          } else {
            xmlHttp.send(null);
          }
        } else {
          xmlHttp.send(null);
        }
      }
    })
    .then((a_res) => {
      if (a_options.format === "auto") {
        a_res = _autoParse(a_res);
      } else if (a_options.format === "json") {
        a_res = JSON.parse(a_res);
      }
      return a_res;
    })
    .catch((a_error)=>{
      return new fcf.Exception("REQUEST_ERROR", {url: a_url}, a_error);
    })
  }



  fcf.getParamCount = (a_function) => {
    if ("length" in a_function)
      return a_function.length;
    let str = a_function.toString();
    let pos = str.indexOf("(");
    let startPos = pos;
    let end = str.indexOf(")");
    if (pos == -1 || end == -1 || pos >= end)
      return 0;
    let counter = 0;
    while(true){
      pos = str.indexOf(",", pos+1);
      if (pos == -1 || pos >= end)
        break
      if (!counter)
        counter = 2;
      else
        ++counter;
    }
    if (counter == 0){
      pos = startPos+1;
      while(pos < end){
        let c = str.charCodeAt(pos);
        if (c > 32)
          return 1;
        ++pos
      }
    }
    return counter;
  }



  /// @fn fcf.Actions fcf.actions(a_options = {deferred: false, noexcept: false})
  /// @fn fcf.Actions fcf.actions(a_cb, a_options = {deferred: false, noexcept: false})
  /// @fn fcf.Actions fcf.actions(Promise a_promise, a_options = {deferred: false, noexcept: false})
  /// @fn fcf.Actions fcf.actions(fcf.Actions a_actions, a_options = {deferred: false, noexcept: false})
  /// @brief Creates a new fcf.Actions object
  /// @param function a_cb - Deferred action callback. The function can be asynchronous.
  ///       - Has the following s:
  ///           - mixed () - Callback without completion confirmation.
  ///                        The callback is considered executed when the function has completed its execution.
  ///                        If the function returns a Promise (which is asynchronous) or an fcf.Actions object,
  ///                        then the operation completes when the Promise or fcf.Actions is executed.
  ///           - mixed (fcf.Actions.Act a_act) - Callback with completion confirmation.
  ///                        The callback is considered executed when the fcf.Actions.Act.complete(mixed a_result)
  ///                        or fcf.Actions.Act.error(Error a_error) method is called on the a_act object
  /// @param object a_object = {deferred: false, noexcept: false}. Optional additional options
  ///           - boolean deferred = false - If the flag is true, then the added callbacks will not be executed
  ///                        until the fcf.Actions.startup() method is called.
  ///           - boolean noexcept = false - If the flag is true, then if the callback ends with an error,
  ///                        the queue execution is not stopped and the handlers passed to catch are not called.
  ///           - mixed errorResult = undefined - The result returned by the result() method in case of an error
  ///           - boolean quiet = false - If true, then raw error messages are not printed to the console.
  /// @result fcf.Actions - Returns a new object
  fcf.actions = (a_cb, a_options) => {
    return new fcf.Actions(a_cb, a_options);
  }



  /// @class fcf.Actions
  /// @brief The analogue of the Promise class with extended functionality.
  /// @details a) Has the ability to get the current result:
  ///              SERVER SIDE EXAMPLE : let mod = fcf.require("module").result().
  ///          b) Has additional each & asyncEach methods.
  ///          c) Task processing callbacks can have an additional action-act
  ///             argument to complete the operation.
  fcf.Actions = class Actions{

    /// @method constructor(a_options = {deferred: false, noexcept: false, errorResult: undefined})
    /// @method constructor(a_cb, a_options = {deferred: false, noexcept: false})
    /// @param function a_cb - Action callback. The function can be asynchronous.
    ///       - Has the following s:
    ///           - mixed () - Callback without completion confirmation.
    ///                        The callback is considered executed when the function has completed its execution.
    ///                        If the function returns a Promise (which is asynchronous) or an fcf.Actions object,
    ///                        then the operation completes when the Promise or fcf.Actions is executed.
    ///           - mixed (fcf.Actions.Act a_act) - Callback with completion confirmation.
    ///                        The callback is considered executed when the fcf.Actions.Act.complete(mixed a_result)
    ///                        or fcf.Actions.Act.error(Error a_error) method is called on the a_act object
    /// @param object a_object = {deferred: false, noexcept: false}. Optional additional options
    ///           - boolean deferred = false - If the flag is true, then the added callbacks will not be executed
    ///                        until the fcf.Actions.startup() method is called.
    ///           - boolean noexcept = false - If the flag is true, then if the callback ends with an error,
    ///                        the queue execution is not stopped and the handlers passed to catch are not called.
    ///           - mixed errorResult = undefined - The result returned by the result() method in case of an error
    ///           - boolean quiet = false - If true, then raw error messages are not printed to the console.
    /// @example
    ///   let actions = new fcf.Actions(async () => {
    ///     ...
    ///     return "result_value";
    ///   });
    /// @example
    ///   let actions = new fcf.Actions((a_act)=>{
    ///     ...
    ///     a_act.complete("result_value");
    ///   });
    /// @example
    ///   let actions = new fcf.Actions(async (a_act)=>{
    ///     console.log("constructor call")
    ///     ...
    ///     a_act.complete("result_value");
    ///   }, { deferred: true });
    ///   ...
    ///   actions.then(async (a_lastResult)=>{
    ///     console.log("callcack call: " + a_lastResult)
    ///     ...
    ///   })
    ///   ...
    ///   console.log("startup call")
    ///   await actions.startup();
    ///   console.log("end")
    ///
    ///   // stdout: startup call
    ///   // stdout: constructor call
    ///   // stdout: callcack call: result_value
    ///   // stdout: end
    constructor(a_cb, a_options) {
      if (typeof a_cb == "object"){
        a_options = a_cb;
        a_cb = undefined;
      }
      this._flags    = (a_options && !!a_options.deferred ? ACTIONS_FLAGS_DEFERRED : 0) |
                       (a_options && !!a_options.noexcept ? ACTIONS_FLAGS_NOEXCEPT : 0) |
                       (a_options && !!a_options.quiet    ? ACTIONS_FLAGS_QUIET : 0);
      this._stack    = [];
      if (a_options && a_options.context)
        fcf.setContext(a_options.context);
      this._state    = fcf.getState();
      this._errorcbs = [];
      if (a_options && a_options.errorResult)
        this._errorResult = a_options.errorResult;
      if (typeof a_cb == "function") {
        this.then(a_cb, undefined, true);
      }
    }



    /// @method fcf.Actions then(function a_cb, function a_cberror = undefined)
    /// @brief Adds a callback to the execution queue.
    /// @details When the a_cb function is called, this is set to fcf.Actions object
    /// @param function a_cb - Action callback. The function can be asynchronous.
    ///       - Has the following s:
    ///           - mixed a_cb(mixed a_lastResult) - Callback without completion confirmation.
    ///                        The callback is considered executed when the function has completed its execution.
    ///                        If the function returns a Promise (which is asynchronous) or an fcf.Actions object,
    ///                        then the operation completes when the Promise or fcf.Actions is executed.
    ///           - mixed a_cb(mixed a_lastResult, fcf.Actions.Act a_act) - Callback with completion confirmation.
    ///                        The callback is considered executed when the fcf.Actions.Act.complete(mixed a_result)
    ///                        or fcf.Actions.Act.error(Error a_error) method is called on the a_act object
    /// @param function a_cberror - Error handler
    ///       - Has the following :
    ///         - a_cberror(Error a_error)
    /// @result fcf.Actions - Self object
    /// @example
    ///   await (new fcf.Actions())
    ///   .then(async (a_lastResult)=>{
    ///     let result;
    ///     ...
    ///     return result;
    ///   });
    /// @example
    ///   await (new fcf.Actions())
    ///   .then((a_lastResult, a_act)=>{
    ///     let error;
    ///     let result;
    ///     ...
    ///     if (error)
    ///       a_act.error(error);
    ///     else
    ///       a_act.complete(result);
    ///   });
    then(a_cb, a_cberror, _a_skipResult) {
      if (typeof Promise !== "undefined" && a_cb instanceof Promise){
        let self = this;
        a_cb.catch((e)=>{
          self.error(e);
        });
        this.then(()=>{
          return a_cb;
        })
      } else if (a_cb instanceof fcf.Actions){
        this.then(()=>{
          return a_cb;
        })
      } else {
        if (a_cb) {
          this._stack.push({cb: a_cb, args: undefined, autoComplete: fcf.getParamCount(a_cb) < (_a_skipResult ? 1 : 2), skipResult: _a_skipResult });
          this._execute();
        }
      }

      if (a_cberror)
        this.catch(a_cberror);
      return this;
    }



    /// @method fcf.Actions each(object|array|function a_obj, function a_cb)
    /// @brief Executes a_cb one by one for each element from a_obj
    /// @details When the a_cb function is called, this is set to fcf.Actions object
    /// @param object|array|function a_obj - An object for whose elements the a_cb callback will be called one by one
    ///          a_obj can be a function, in which case its result is the iterated object.
    ///          The function call is made just before the callbacks are executed.
    /// @param function a_cb - Action callback for each a_obj element. The function can be asynchronous.
    ///       - Has the following s:
    ///           - mixed a_cb(mixed a_key, mixed a_value, mixed a_lastResult) -
    ///                        Callback without completion confirmation.
    ///                        The callback is considered executed when the function has completed its execution.
    ///                        If the function returns a Promise (which is asynchronous) or an fcf.Actions object,
    ///                        then the operation completes when the Promise or fcf.Actions is executed.
    ///           - mixed a_cb(mixed a_key, mixed a_value, mixed a_lastResult, fcf.Actions.Act a_act) -
    ///                        Callback with completion confirmation.
    ///                        The callback is considered executed when the fcf.Actions.Act.complete(mixed a_result)
    ///                        or fcf.Actions.Act.error(Error a_error) method is called on the a_act object
    /// @result fcf.Actions - Self object
    /// @example
    ///   await (new fcf.Actions())
    ///   .each(["one", "two", "three"], async (a_key, a_value, a_lastResult, a_act)=>{
    ///     console.log(a_key, " : ", a_value)
    ///     a_act.complete(a_lastResult);
    ///   })
    ///   .then(()=>{
    ///     console.log("end")
    ///   })
    ///
    ///  // stdout: 0 : one
    ///   // stdout: 1 : two
    ///   // stdout: 2 : three
    ///   // stdout: end
    /// @example
    ///   let array;
    ///   await (new fcf.Actions())
    ///   .then(()=>{
    ///     array = ["one", "two", "three"];
    ///   })
    ///   .each(()=>{ return array; }, async (a_key, a_value, a_lastResult, a_act)=>{
    ///     console.log(a_key, " : ", a_value)
    ///     a_act.complete(a_lastResult);
    ///   })
    ///   .then(()=>{
    ///     console.log("end")
    ///   })
    ///
    ///   // stdout: 0 : one
    ///   // stdout: 1 : two
    ///   // stdout: 2 : three
    ///   // stdout: end
    each(a_obj, a_cb) {
      if (typeof a_obj != "function"){
        if (typeof a_obj == "object" && a_obj !== null) {
          fcf.each(a_obj, (a_key, a_value)=>{
            this._stack.push({cb: a_cb, args: [a_key, a_value], autoComplete: fcf.getParamCount(a_cb) < 4});
          });
        }
        this._execute();
      } else {
        this.then((a_res) => {
          a_obj = a_obj();
          let reverse = [];
          fcf.each(a_obj, (a_key, a_value)=>{
            reverse.unshift([a_key, a_value]);
          });
          for(let pair of reverse) {
            this._stack.unshift({cb: a_cb, args: pair, autoComplete: fcf.getParamCount(a_cb) < 4});
          }
          this._execute();
          return a_res;
        })
      }
      return this;
    }



    /// @method fcf.Actions asyncEach(object|array|function a_obj, function a_cb)
    /// @brief Executes multiple a_cb at the same time for each element from a_obj
    /// @details When the a_cb function is called, this is set to fcf.Actions object
    /// @param object|array|function a_obj - An object for whose elements the a_cb callback will be called one by one
    ///          a_obj can be a function, in which case its result is the iterated object.
    ///          The function call is made just before the callbacks are executed.
    /// @param function a_cb - Action callback for each a_obj element. The function can be asynchronous.
    ///       - Has the following s:
    ///           - mixed a_cb(mixed a_key, mixed a_value, mixed a_lastResult) -
    ///                        Callback without completion confirmation.
    ///                        The callback is considered executed when the function has completed its execution.
    ///                        If the function returns a Promise (which is asynchronous) or an fcf.Actions object,
    ///                        then the operation completes when the Promise or fcf.Actions is executed.
    ///           - mixed a_cb(mixed a_key, mixed a_value, mixed a_lastResult, fcf.Actions.Act a_act) -
    ///                        Callback with completion confirmation.
    ///                        The callback is considered executed when the fcf.Actions.Act.complete(mixed a_result)
    ///                        or fcf.Actions.Act.error(Error a_error) method is called on the a_act object
    /// @result fcf.Actions - Self object
    /// @example
    ///   await (new fcf.Actions())
    ///   .asyncEach(["one", "two", "three"], async (a_key, a_value, a_lastResult, a_act)=>{
    ///     ...
    ///     setTimeout(()=>{
    ///       console.log(a_key, " : ", a_value);
    ///       a_act.complete(a_lastResult);
    ///     }, 100 - a_key);
    ///   })
    ///   .then(()=>{
    ///     console.log("end")
    ///   })
    ///
    ///   // stdout: 2 : three
    ///   // stdout: 1 : two
    ///   // stdout: 0 : one
    ///   // stdout: end
    asyncEach(a_obj, a_cb) {
      let self = this;

      this.then((a_value, a_act) => {
        a_obj = typeof a_obj == "function" ? a_obj() : a_obj;
        let autoComplete = fcf.getParamCount(a_cb) < 4;
        let size         = fcf.count(a_obj);
        let counter      = 0;
        let error        = false;

        if (size == 0) {
          a_act.complete();
          return;
        }

        let brk = false;
        fcf.each(a_obj, (k, a_itemValue)=>{
          if (brk)
            return false;
          let act = {
            _complete: false,
            complete: function(a_value){
              if (_isServer)
                fcf.setState(self._state);
              if (this._complete || error || self._error)
                return;

              ++counter;

              self._result = a_value;

              if (counter == size){
                this._complete = true;
                a_act.complete(a_value);
              }
            },
            error: function(a_error){
              if (_isServer)
                fcf.setState(self._state);
              if (self._flags & ACTIONS_FLAGS_NOEXCEPT){
                this.complete();
                return;
              }

              if (this._complete || error || self._error)
                return;

              self._result = undefined;
              this._complete = true;
              error = true;
              a_act.error(a_error);
            },
          };

          let args = [k, a_itemValue, self._result];
          if (!autoComplete)
            args.push(act);

          let forceExit = false;
          let res;
          try {
            let asyncPrefix = a_cb.toString().substr(0, 5);
            if (asyncPrefix == "async" && a_cb.toString().charCodeAt(5) <= 32){
              res = a_cb.apply(self, args).catch((e)=>{
                forceExit = true;
                brk = true;
                act.error(e)
              });
            } else {
              res = a_cb.apply(self, args)
            }
          } catch(e) {
            brk = true;
            act.error(e);
            return;
          }

          if (forceExit)
            return;

          if (autoComplete && ((typeof Promise !== "undefined" && res instanceof Promise) || res instanceof fcf.Actions)) {
            res
            .then((a_value)=>{
              act.complete(a_value);
            })
            .catch((a_error)=>{
              act.error(a_error);
            });
          } else if (autoComplete) {
            act.complete(res);
          }
        });
      });
      return this;
    }



    /// @method fcf.Actions catch(function a_cb)
    /// @brief Adds an error handler callback.
    /// @details If the callback returns or throws an error object,
    ///          then it replaces the current fcf.Actions error
    ///          When the handler is called when an error occurs,
    ///          exceptions thrown from the handler are not processed and go out
    /// @param function a_cb - Error handler callback
    ///       - Has the following :
    ///           undefined|Error a_cb(Error a_error)
    /// @result fcf.Actions - Self object
    /// @example
    ///   (new fcf.Actions())
    ///   .then(()=>{
    ///     throw new Error("Some error");
    ///   })
    ///   .catch((a_error)=>{
    ///     console.error(a_error.message);
    ///   });
    ///
    ///   // stderr: Some error
    catch(a_cb) {
      if (!this._stack)
        return;
      this._flags |= ACTIONS_FLAGS_CATCH;
      let cerror;
      if (a_cb) {
        if (this._error) {
          try {
            let e = a_cb.call(this, this._error);
            if (e instanceof Error) {
              this._error = e;
            }
          } catch(e) {
            this._error = e;
            cerror = e;
          }
        }
        this._errorcbs.push(a_cb);
      }
      if (cerror) {
        throw cerror;
      }
      return this;
    }



    /// @method fcf.Actions finally(function a_cb)
    /// @brief Adds a callback to the run queue that is also called will be called on error
    /// @details When the handler is called when an error occurs,
    ///          exceptions thrown from the handler are not processed and go out
    /// @param function a_cb - Action callback. The function can be asynchronous.
    ///       - Has the following s:
    ///           - mixed a_cb(mixed a_lastResult) - Callback without completion confirmation.
    ///                        The callback is considered executed when the function has completed its execution.
    ///                        If the function returns a Promise (which is asynchronous) or an fcf.Actions object,
    ///                        then the operation completes when the Promise or fcf.Actions is executed.
    ///           - mixed a_cb(mixed a_lastResult, fcf.Actions.Act a_act) - Callback with completion confirmation.
    ///                        The callback is considered executed when the fcf.Actions.Act.complete(mixed a_result)
    ///                        or fcf.Actions.Act.error(Error a_error) method is called on the a_act object
    /// @result fcf.Actions - Self object
    /// @example
    ///   (new fcf.Actions())
    ///   .then(()=>{
    ///     ...
    ///   })
    ///   .finally(function (a_lastResult){
    ///     if (this.error()){
    ///       ...
    ///     } else {
    ///       ...
    ///     }
    ///   });
    finally(a_cb) {
      if (a_cb) {
        this._stack.push({cb: a_cb, args: undefined, finally: true, autoComplete: fcf.getParamCount(a_cb) < 2 });
        if (this._error) {
          try {
            a_cb.call(this, undefined, {complete: ()=>{}, error: ()=>{}});
          } catch (e) {
            this._error = e;
          }
        } else {
          this._execute();
        }
      }
      return this;
    }



    /// @method fcf.Actions startup()
    /// @brief Starts execution of scheduled tasks if the fcf.Actions
    ///        object was created with the deferred flag set to true
    /// @result fcf.Actions - Self object
    startup() {
      this._flags &= ~ACTIONS_FLAGS_DEFERRED;
      this._execute();
      return this;
    }



    /// @method Error error()
    /// @brief Returns the current error set in the object
    /// @result Error - Error object

    /// @method fcf.Actions error(Error a_error)
    /// @brief Sets an error for the fcf.Actions object
    /// @param Error a_error - Installable error
    /// @result fcf.Actions - Self object
    error(a_error) {
      if (!arguments.length) {
        return this._error;
      }
      if (!this._error) {
        this._error = a_error;
        this._callErrors();
      } else {
        this._error = a_error;
      }
      return this;
    }



    /// @method mixed result()
    /// @brief Returns the current result set in the object
    /// @result mixed - Current result

    /// @method fcf.Actions result(mixed a_result)
    /// @brief Sets an result for the fcf.Actions object
    /// @param mixed a_result - New result value
    /// @result fcf.Actions - Self object
    result(a_value) {
      if (!arguments.length){
        return !this._error ? this._result : this._errorResult;
      }
      this._result = a_value;
      return this;
    }



    /// @method mixed exception()
    /// @brief Throws an exception if the object of actions is in a state of error
    /// @result fcf.Actions - Self object
    exception() {
      if (this._error) {
        this.options({quiet: true});
        throw this._error;
      }
      return this;
    }



    /// @method object options()
    /// @brief Returns the options of the fcf.Actions object
    /// @result object - fcf.Actions object options:
    ///           - boolean deferred - If the flag is true, then the added callbacks will not be executed
    ///                        until the fcf.Actions.startup() method is called.
    ///           - boolean noexcept - If the flag is true, then if the callback ends with an error,
    ///                        the queue execution is not stopped and the handlers passed to catch are not called.
    ///           - mixed errorResult - The result returned by the result() method in case of an error
    ///           - boolean quiet - If true, then raw error messages are not printed to the console.

    /// @method fcf.Actions options(object a_options)
    /// @brief Sets the options of the fcf.Actions object
    /// @param object a_options - An options object that can store the following options:
    ///           - boolean deferred - If the flag is true, then the added callbacks will not be executed
    ///                        until the fcf.Actions.startup() method is called.
    ///           - boolean noexcept - If the flag is true, then if the callback ends with an error,
    ///                        the queue execution is not stopped and the handlers passed to catch are not called.
    ///           - mixed errorResult - The result returned by the result() method in case of an error
    ///           - boolean quiet - If true, then raw error messages are not printed to the console.
    /// @result fcf.Actions - Self object
    options(a_options) {
      if (!arguments.length){
        return {
          noexcept: this._flags & ACTIONS_FLAGS_NOEXCEPT ? true : false,
          quiet: this._flags & ACTIONS_FLAGS_QUIET ? true : false,
          deferred: this._flags & ACTIONS_FLAGS_DEFERRED ? true : false,
          errorResult: this._errorResult
        };
      } else {
        if ("noexcept" in a_options){
          if (a_options.noexcept) this._flags |= ACTIONS_FLAGS_NOEXCEPT;
          else                    this._flags &= ~ACTIONS_FLAGS_NOEXCEPT;
        }
        if ("quiet" in a_options){
          if (a_options.quiet) this._flags |=  ACTIONS_FLAGS_QUIET;
          else                 this._flags &= ~ACTIONS_FLAGS_QUIET;
        }
        if ("deferred" in a_options) {
          if (a_options.deferred) this._flags |= ACTIONS_FLAGS_DEFERRED;
          else                    this._flags &= ~ACTIONS_FLAGS_DEFERRED;
        }
        if ("errorResult" in a_options) {
          this._errorResult = a_options.errorResult;
        }
        return this;
      }
    }



    /// @method Promise promise()
    /// @brief Adds an empty Promise object to the run queue and returns it
    /// @result Promise - A new Promise object
    promise() {
      return new Promise((a_resolve, a_reject)=>{
        this
        .then((a_res)=>{
          a_resolve(a_res);
        })
        .catch((a_error)=>{
          a_reject(a_error);
        })
      })
    }

    _callErrors() {
      let cerror;
      for (let i = 0; i < this._errorcbs.length; ++i) {
        try {
          let e = this._errorcbs[i].call(this, this._error);
          if (e instanceof Error) {
            this._error = e;
          }
        } catch(e) {
          this._error = e;
          cerror = e;
        }
      }
      for (let i = 0; i < this._stack.length; ++i){
        if (this._stack[i].finally){
          try {
            this._stack[i].cb.call(this, undefined, {complete: ()=>{}, error: ()=>{}});
          } catch(e) {
            this._error = e;
          }
        }
      }
      if (!(this._flags & ACTIONS_FLAGS_QUIET)) {
        if (!(this._flags & ACTIONS_FLAGS_CATCH)){
          setTimeout(()=>{
            if (!(this._flags & ACTIONS_FLAGS_CATCH) && !(this._flags & ACTIONS_FLAGS_QUIET)){
              fcf.log.err("FCF", "Unhandled error in fcf.Actions (to handle catch method or \"quiet\" flag). Error: ", this._error)
            }
          }, 0);
        }
      }
      if (cerror){
        throw cerror;
      }
    }

    _execute() {
      let self = this;
      if (this._flags & ACTIONS_FLAGS_RUN || !this._stack || this._stack.length == 0 || this._error){
        if (_isServer && !(this._flags & ACTIONS_FLAGS_RUN))
          fcf.setState(self._state);
        return;
      }
      if (_isServer)
        fcf.setState(self._state);
      if (this._flags & ACTIONS_FLAGS_DEFERRED)
        return;
      this._flags |= ACTIONS_FLAGS_RUN;
      let cbi = this._stack.shift();
      let act = {
        _end: false,
        complete: function(a_value) {
          if (_isServer)
            fcf.setState(self._state);
          if (this._end || self._error)
            return;
          this._end = true;
          self._flags &= ~ACTIONS_FLAGS_RUN;
          if ((typeof Promise !== "undefined" && a_value instanceof Promise) || a_value instanceof fcf.Actions){
            a_value
            .then((a_value)=>{
              if (!cbi.finally)
                self._result = a_value;
              self._execute();
            })
            .catch((a_error)=>{
              this._end = false;
              this.error(a_error);
            })
          } else {
            if (!cbi.finally)
              self._result = a_value;
            self._execute();
          }
        },
        error: function(a_error) {
          if (_isServer)
          fcf.setState(self._state);
          if (self._flags & ACTIONS_FLAGS_NOEXCEPT){
            this.complete();
            return;
          }
          if (this._end || self._error)
            return;
          this._end = true;
          self._flags &= ~ACTIONS_FLAGS_RUN;
          self._result = undefined;
          self._error = a_error ? a_error : new Error("Unknown error");
          self._callErrors();
        },
      };
      let args = [];
      if (cbi.args) {
        args.push(cbi.args[0]);
        args.push(cbi.args[1]);
      }
      if (!cbi.skipResult) {
        args.push(this._result);
      }
      if (!cbi.autoComplete) {
        args.push(act);
      }

      let res = undefined;
      let forceExit = false;
      try {
        let asyncPrefix = cbi.cb.toString().substr(0, 5);
        if (asyncPrefix == "async" && cbi.cb.toString().charCodeAt(5) <= 32){
          res = cbi.cb.apply(this, args).catch((e)=>{
            forceExit = true;
            act.error(e);
          });
        } else {
          res = cbi.cb.apply(this, args);
        }
      } catch(e) {
        act.error(e);
        return;
      }

      if (forceExit)
        return;

      if ((typeof Promise !== "undefined" && res instanceof Promise) || res instanceof fcf.Actions) {
        if (cbi.autoComplete){
          res
          .then((a_value)=>{
            act.complete(a_value);
          })
          .catch((a_error)=>{
            act.error(a_error);
          });
        } else {
          res
          .catch((a_error)=>{
            act.error(a_error);
          });
        }
      } else if (cbi.autoComplete){
        act.complete(res);
      }
    }
  }

  const ACTIONS_FLAGS_DEFERRED = 1;
  const ACTIONS_FLAGS_NOEXCEPT = 2;
  const ACTIONS_FLAGS_RUN      = 4;
  const ACTIONS_FLAGS_QUIET    = 8;
  const ACTIONS_FLAGS_CATCH    = 16;



  /// @fn fcf.module(object a_options)
  /// @brief Declares the FCF module available on the server side and on the browser side
  /// @param object a_options - Module options
  ///                 - string name - Path (name) of the module in FCF notation
  ///                 - array dependencies - Array with module dependency paths in FCF notation
  ///                 - array lazy - An array of module dependencies that are loaded after the module body is executed.
  ///                                These modules do not fall into the module arguments and
  ///                                these dependencies are accessed through global variables.
  ///                                Used for cyclic module dependencies.
  ///                 - function module - A module function that should return module data.
  ///                                The function arguments are the data of the modules declared in the dependencies property.
  ///                                - Function signature: mixed module(<DEPENDENCY1, DEPENDENCY2, ...>)
  ///                 - boolean quiet = false - If set to true, then module loading error messages are not performed..
  /// @example
  ///   ========================================================================
  ///   Browser side example (Using native JS files on the browser side) (without fcf server)
  ///
  ///   ------------------------------------------------------------------------
  ///   File /modules/package/helloWorld.js:
  ///
  ///     window.someGlobalVariable = window.someGlobalVariable || {};
  ///     window.someGlobalVariable.helloWorld = function(){
  ///       document.write("<h3>Hello world</h3>")
  ///     }
  ///
  ///   ------------------------------------------------------------------------
  ///   File /modules/package/page.js:
  ///
  ///     fcf.module({
  ///       name: "package:page.js",
  ///       dependencies: ["package:helloWorld.js"],
  ///       module: (helloWorld)=>{
  ///         return function() {
  ///           document.write("<h1>Title</h1>");
  ///           helloWorld();
  ///         };
  ///       }
  ///     });
  ///
  ///   ------------------------------------------------------------------------
  ///   File /index.html
  ///
  ///   <html>
  ///     <head>
  ///       <script src="/node_modules/fcf-framework-core/fcf.js"></script>
  ///       <script>
  ///         // Adding data about the new "package" package to the configuration
  ///         fcf.getConfiguration().append({
  ///           sources: {
  ///
  ///             // Information about "package" package
  ///             "package": {
  ///
  ///               // URL to package files
  ///               webPackagePath: "/modules/package",
  ///
  ///               // Mapping the module and the global variable as a result of module execution
  ///               files: {
///                   "helloWorld.js": { result: "someGlobalVariable.helloWorld" },
  ///               },
  ///
  ///             }
  ///           }
  ///         });
  ///       </script>
  ///     </head>
  ///     <body>
  ///       <script>
  ///         fcf.require("package:page.js")
  ///         .then(([page])=>{
  ///           page();
  ///         });
  ///       </script>
  ///     </body>
  ///   </html>
  ///
  ///   ------------------------------------------------------------------------
  ///   Result in browser:
  ///
  ///     Title
  ///
  ///     Hello world
  ///
  fcf.module = (a_options) => {
    let moduleName = _getModulePath(a_options.name);
    let rootCall = false;

    if (!_modules[moduleName]){
      _modules[moduleName] = {
        state:        "wait",
        result:       undefined,
        error:        undefined,
        actions:      fcf.actions(),
        act:          undefined,
        dependencies: [],
        lazy:         [],
        quiet:        a_options.quiet ? 1 : 0,
      };
      rootCall = true;
    } else if (_modules[moduleName].state != "wait") {
      _modules[moduleName].dependencies     = Array.isArray(a_options.dependencies) ? a_options.dependencies : [];
      _modules[moduleName].lazy             = Array.isArray(a_options.lazy) ? a_options.lazy : [];
      return;
    }

    _modules[moduleName].dependencies     = Array.isArray(a_options.dependencies) ? a_options.dependencies : [];
    _modules[moduleName].lazy             = Array.isArray(a_options.lazy) ? a_options.lazy : [];

    let moduleInfo = _modules[moduleName];
    moduleInfo.state = "processing";

    fcf.each(a_options.dependencies, (a_key, a_value)=>{
      a_options.dependencies[a_key] = a_value[0] != "/" ? fcf.ltrim(a_value, [":", "/"]) : "a_value";
    });
    fcf.each(a_options.lazy, (a_key, a_value)=>{
      a_options.lazy[a_key] = a_value[0] != "/" ? fcf.ltrim(a_value, [":", "/"]) : "a_value";
    });

    let actions = rootCall ? _modules[moduleName].actions
                           : fcf.actions();

    return actions
    .asyncEach(a_options.dependencies, (k, mod)=>{
      return _loadModule(mod, _modules[moduleName].quiet);
    })
    .then(()=>{
      let dependencies = [];
      fcf.each(a_options.dependencies, (k, mod)=>{
        dependencies.push(_modules[_getModulePath(mod)].result);
      })
      moduleInfo.result = a_options.module.apply(undefined, dependencies);
      if (_isServer) {
        let moduleNameOSFormat = fcf.isServer() && process.platform == "win32"
                                            ? fcf.replaceAll(fcf.replaceAll(moduleName, "/", "\\"), ":/", ":\\")
                                            : moduleName;
        require.cache[moduleNameOSFormat].exports = moduleInfo.result;
      }
      moduleInfo.state = "ready";
      if (moduleInfo.act){
        moduleInfo.act.complete();
      }
      return fcf.actions()
      .asyncEach(a_options.lazy, (k, mod)=>{
        return _loadModule(mod, _modules[moduleName].quiet);
      })
      .then(()=>{
        moduleInfo.state = "loaded";
        _callOnModuleLoad();
        return _waitLazyModule(moduleName);
      })
      .then(()=>{
        moduleInfo.state = "ok";
      })
      .catch((e)=>{
        _modules[moduleName].quiet = 1;
      });
    })
    .then(()=>{
      return moduleInfo.result;
    })
    .catch((a_error)=>{
      moduleInfo.state = "error";
      moduleInfo.error = a_error;
      if (moduleInfo.act)
        moduleInfo.act.error(a_error);
      _callOnModuleLoad();
      if (_isServer)
        throw a_error;
    })
  }



  /// @fn fcf.Actions->[MOD1, ...] fcf.require(string a_module1, string a_module2, ...);
  /// @fn fcf.Actions->[MOD1, ...] fcf.require(string a_module1, string a_module2, ..., object a_options);
  /// @fn fcf.Actions->[MOD1, ...] fcf.require([string] a_modules);
  /// @fn fcf.Actions->[MOD1, ...] fcf.require([string] a_modules, object a_options);
  /// @brief Loads JS modules
  /// @param string   a_moduleN - Module path in FCF notation
  /// @param [string] a_modules - Array with paths to modules in FCF notation
  /// @param object   a_options - Extra options
  ///                             - boolean quiet = false - If the parameter is true, then the output of
  ///                                                       the module error message to the console is not displayed
  ///                             - boolean async = true - If the parameter is true, then the loading of modules on the browser side is performed synchronously.
  ///                                                      To get the result synchronously, you need to call the result method of the returned fcf.Actions object
  ///                                                       - Example:
  ///                                                           - let [mod1, mod2] = fcf.require("module1.js", "module2.js", {async: false}).result();
  fcf.require = function (a_modules) {
    let quietError = false;
    let async = true;
    let modules = [];
    for(let arg of arguments) {
      if (typeof arg == "object" && arg !== null && !Array.isArray(arg)) {
        quietError = "quiet" in arg ? arg.quiet : false;
        async = arg.async === false ? false : true;
      } else if (typeof arg === "string") {
        modules.push(arg);
      } else if (Array.isArray(arg)){
        modules = modules.concat(arg);
      }
    }
    return fcf.actions({errorResult: []})
    .asyncEach(modules, (k, mod) => {
      return _loadModule(mod, quietError, !async);
    })
    .asyncEach(modules, (k, mod) => {
      return _waitLazyModule(_getModulePath(mod));
    })
    .then(()=>{
      let result = [];
      fcf.each(modules, (k, mod) => {
        result.push(_modules[_getModulePath(mod)].result);
      });
      return result;
    });
  }

  function _loadModule(a_module, a_quietError, a_sync) {
    let path = _getModulePath(a_module);
    let state = _modules[path] ? _modules[path].state
                               : undefined;
    if (_modules[path]){
      _modules[path].quiet &= !!a_quietError;
    }
    if (state == "ready" || state == "loaded" || state == "ok") {
      return fcf.actions()
      .then(()=> {
        _modules[path].quiet = 1;
        return _modules[path].result;
      });
    } else if (state == "error") {
      return fcf.actions()
      .then((a_res, a_act)=> {
        if (!_modules[path].quiet) {
          fcf.log.err("FCF", `Failed load module ${a_module}.\n`, _modules[path].error);
        }
        _modules[path].quiet = 1;
        a_act.error(_modules[path].error);
      })

    } else if ((!a_sync || _isServer) && (state == "wait" || state == "processing")) {
      return fcf.actions()
      .then((a_res, a_act)=> {
        _modules[path].actions
        .then(()=>{
          a_act.complete(_modules[path].result);
        })
        .catch((a_error) => {
          if (!_modules[path].quiet) {
            fcf.log.err("FCF", `Failed load module ${a_module}.\n`, a_error);
          }
          a_act.error(a_error);
        });
      });
    } else {
      if (!_isServer && a_sync) {
        ++_globalSyncModuleLoad;
      }

      _modules[path] = {
        state:        "wait",
        result:       undefined,
        error:        undefined,
        actions:      fcf.actions(),
        act:          undefined,
        dependencies: [],
        lazy:         [],
        quiet:        a_quietError ? 1 : 0
      };

      return fcf.actions()
      .then((a_res, a_rootAct)=>{
        _modules[path].actions
        .then((a_res, a_act)=>{
          _modules[path].act = a_act;
          let {module: moduleName, subpath: filePath} = fcf.getPathInfo(a_module);
          if (_isServer) {
            let result;
            try {
              result = require(path);
            }catch(e) {
              _modules[path].state = "error";
              _modules[path].error = e;
              _modules[path].act.error(e);
              _callOnModuleLoad();
              return;
            }
            let moduleInfo = fcf.getConfiguration().sources[moduleName];
            let resultPath;
            if (moduleInfo) {
              resultPath = fcf.resolve(moduleInfo, ["serverFiles", filePath, "result"]) ||
                           fcf.resolve(moduleInfo, ["files", filePath, "result"]);
              if (resultPath){
                _modules[path].result = fcf.resolve(global, resultPath);
              }
            }
            if (!resultPath) {
              _modules[path].result = result;
            }
            if (_modules[path].state == "wait"){
              _modules[path].state = "ok";
              _modules[path].act.complete();
              _callOnModuleLoad();
            }
          } else {
            let moduleInfo = fcf.getConfiguration().sources[moduleName];
            let loadStateTemplate = fcf.resolve(moduleInfo, ["webFiles", filePath, "loadState"]) ||
                                    fcf.resolve(moduleInfo, ["files", filePath, "loadState"]);
            let resultTemplate    = fcf.resolve(moduleInfo, ["webFiles", filePath, "result"]) ||
                                    fcf.resolve(moduleInfo, ["files", filePath, "result"]);
            let needLoad = !loadStateTemplate || !fcf.tokenize(loadStateTemplate, {}, {quiet: true});
            (
              needLoad
                ? fcf.load(path, {async: _globalSyncModuleLoad == 0})
                : fcf.actions()
            )
            .then((a_res)=>{
              if (needLoad) {
                const state = _modules[path].state;
                if (state == "ready" || state == "loaded" || state == "ok" || state == "error") {
                  return;
                }
                let script = document.createElement('script');
                script.textContent = a_res + `\n//# sourceURL=${path}`;
                document.head.appendChild(script);
              }
              if (moduleInfo && resultTemplate) {
                _modules[path].result = fcf.resolve(window, resultTemplate);
              }
              if (_modules[path].state == "wait"){
                _modules[path].state = "ok";
                _modules[path].act.complete();
                _callOnModuleLoad();
              }
            })
            .catch((e)=>{
              let error = new Error("Failed to receive module file '" + path + "'");
              _modules[path].state = "error";
              _modules[path].error = error;
              _modules[path].act.error(error);
              _callOnModuleLoad();
            });
          }
        })
        .then(()=>{
          a_rootAct.complete(_modules[path].result);
        })
        .finally(()=>{
          if (!_isServer && a_sync) {
            if (_globalSyncModuleLoad)
              --_globalSyncModuleLoad;
          }
        })
        .catch((a_error) => {
          if (!_modules[path].quiet) {
            fcf.log.err("FCF", `Failed load module ${a_module}.\n`, a_error);
          }
          _modules[path].quiet = 1;
          a_rootAct.error(a_error);
        })
      });
    }
  }

  let _globalSyncModuleLoad = 0;

  function _getModulePath(a_module) {
    a_module = fcf.resolvePath(a_module);
    const isOnlyModule = a_module.indexOf("/") == -1 && a_module.indexOf("\\") == -1 && a_module.indexOf(":") == -1 && a_module.indexOf(".") == -1;
    if (isOnlyModule && !_isServer && a_module[a_module.length-1] != ":"){
      a_module += ":";
    }
    let {module: moduleName, subpath: relativePath} = fcf.getPathInfo(a_module);
    if (moduleName === undefined) {
      return fcf.getPath(a_module);
    }
    let configuration = fcf.getConfiguration();
    if (!_isServer && !relativePath){
      relativePath = configuration.sources[moduleName] && configuration.sources[moduleName].webMain
                          ? configuration.sources[moduleName].webMain
                          : "index.js";
    }
    let configPropFilesName    = fcf.isServer() ? "serverFiles" : "webFiles";
    let configPropFilePathName = fcf.isServer() ? "serverFilePath" : "webFilePath";
    let relativeTemplate = fcf.resolve(configuration, ["sources", moduleName, configPropFilesName, relativePath, "filePath"]) ||
                           fcf.resolve(configuration, ["sources", moduleName, "files", relativePath, "filePath"]) ||
                           fcf.resolve(configuration, ["sources", moduleName, configPropFilePathName, "js"]) ||
                           fcf.resolve(configuration, ["sources", moduleName, "filePath", "js"]) ||
                           fcf.resolve(configuration, ["sources", moduleName, configPropFilePathName, "*"]) ||
                           fcf.resolve(configuration, ["sources", moduleName, "filePath", "*"]);
    if (relativeTemplate) {
      relativePath = fcf.tokenize(relativeTemplate,
                                  {
                                    path:      relativePath,
                                    directory: fcf.getDirectory(relativePath),
                                    shortName: fcf.getShortFileName(relativePath),
                                    name:      fcf.getFileName(relativePath),
                                    extension: fcf.getExtension(relativePath)
                                  },
                                  {
                                    quiet: true
                                  });
      return fcf.getPath(moduleName + ":" + relativePath);
    }
    return _isServer && isOnlyModule ? a_module : fcf.getPath(moduleName + ":" + relativePath);
  }

  function _waitLazyModule(a_modulePath, _a_act) {
    let actions;
    if (_modules[a_modulePath].state == "ok") {
      if (_a_act)
        _a_act.complete();
      return fcf.actions();
    }
    let deps = _getDepsModule(a_modulePath);
    if (!_a_act) {
      actions = fcf.actions();
      actions.then((a_res, a_act)=>{ _a_act = a_act; });
    }
    let error;
    let full = true;
    for (let dep in deps) {
      if (!_modules[dep]) {
        full = false;
        continue;
      }
      if (_modules[dep].state == "error") {
        error = _modules[dep].error;
      } else if (_modules[dep].state != "loaded" && _modules[dep].state != "ok") {
        full = false;
      }
    }
    if (error) {
      _a_act.error(error);
    } else if (full) {
      _a_act.complete();
    } else {
      _attachOnModuleLoad(()=>{
        _waitLazyModule(a_modulePath, _a_act);
      });
    }
    return actions;
  }

  function _attachOnModuleLoad(a_cb){
    _moduleCallbacks.push(a_cb);
  }

  function _callOnModuleLoad(){
    let arr = _moduleCallbacks;
    _moduleCallbacks = [];
    for(let i = 0; i < arr.length; ++i){
      arr[i]();
    }
  }

  function _getDepsModule(a_modulePath, _a_selfPath, _a_dst){
    if (!_a_selfPath)
      _a_selfPath = a_modulePath;
    if (!_a_dst)
      _a_dst = {};
    if (_modules[a_modulePath]) {
      for(let i = 0; i < _modules[a_modulePath].dependencies.length; ++i){
        let dep = _getModulePath(_modules[a_modulePath].dependencies[i]);
        if (dep in _a_dst || _a_selfPath == dep)
          continue;
        _a_dst[dep] = 1;
        _getDepsModule(dep, _a_selfPath, _a_dst);
      }
      for(let i = 0; i < _modules[a_modulePath].lazy.length; ++i){
        let dep = _getModulePath(_modules[a_modulePath].lazy[i]);
        if (dep in _a_dst || _a_selfPath == dep)
          continue;
        _a_dst[dep] = 1;
        _getDepsModule(dep, _a_selfPath, _a_dst);
      }
    }
    return _a_dst;
  }

  let _modules = {};
  let _moduleCallbacks = [];



  /// @fn string fcf.stackToString(string|Array|Error a_stack)
  /// @brief Converts stack to string
  /// @param string|Array|Error a_stack - Stack string or Error object or Array parsed by fcf.parseStack
  /// @result string - A string describing the call stack
  fcf.stackToString = (a_stack) => {
    a_stack = fcf.parseStack(a_stack);
    let result = "";
    for(let i = 0; i < a_stack.length; ++i) {
      if (i) {
        result += "\n";
      }
      result += fcf.str(a_stack[i].function) + " (" +
                a_stack[i].file + ":" +
                fcf.str(a_stack[i].line) + ":" + fcf.str(a_stack[i].column) + ")";
    }
    return result;
  }



  /// @fn string fcf.errorToString(Error a_error, boolean a_fullMode = false)
  /// @brief Converts stack to string
  /// @param string|Error a_error - Error object
  /// @param boolean a_fullMode = false - If the parameter is true, then the stack information is added to the error message.
  /// @result string - String describing the error
  fcf.errorToString = (a_error, a_fullMode) => {
    if (a_error instanceof fcf.Exception) {
      return a_error.toString(a_fullMode, a_fullMode);
    } else {
      return a_fullMode ? a_error.toString() + "\nStack" + fcf.replaceAll("\n" + fcf.stackToString(a_error), "\n", "\n    ")
                        : a_error.toString();
    }
  }



  /// @fn [object] fcf.parseStack(string|Error a_stack)
  /// @brief Performs stack parsing
  /// @param string|Error a_stack - Stack string or Error object
  /// @result [object] - Array with objects about stack calls
  ///                      - Object properties:
  ///                         - string file - JS file
  ///                         - string function - function name
  ///                         - number line - line number
  ///                         - number column - column number
  fcf.parseStack = function(a_stack) {
    if (a_stack instanceof Error) {
      a_stack = a_stack.stack;
    } else if (a_stack instanceof fcf.Exception) {
      return a_stack.stackArr;
    } else if (Array.isArray(a_stack)) {
      return a_stack;
    }
    if (typeof a_stack != "string"){
      return [];
    }
    return _parseStack(a_stack.split("\n")).stack;
  }



  /// @fn [{message, fullMessage, stack, stackArr}] fcf.parseError(Error a_error)
  /// @brief Parses the error object
  /// @param Error a_error - Error object
  /// @result [object] - Array with objects about stack calls
  ///                      - Object properties:
  ///                         - string message - Simple message of the error
  ///                         - string fullMessage - Full error message
  ///                         - string stack - String representation of the stack, the result of fcf.stackToString
  ///                         - [object] stackArr - Array with objects about stack calls
  ///                               - Object properties:
  ///                                 - string file - JS file
  ///                                 - string function - function name
  ///                                 - number line - line number
  ///                                 - number column - column number
  fcf.parseError = function(a_error) {
    if (a_error instanceof fcf.Exception) {
      return {
        message:      a_error.toString(),
        fullMessage:  a_error.toString(false, true),
        stack:        fcf.stackToString(a_error.stackArr),
        stackArr:     a_error.stackArr,
      }
    } else if (!(a_error instanceof Error)) {
      return {
        message:      "",
        fullMessage:  "",
        stack:        "",
        stackArr:     [],
      };
    }
    let arr       = a_error.stack.split("\n");
    let stackInfo = _parseStack(arr);
    let fullMessage = "";
    for(let j = 0; j <= stackInfo.preStart; ++j) {
      fullMessage += arr[j];
      fullMessage += "\n";
    }
    if (!fullMessage) {
      fullMessage = a_error.message;
    }
    return {
      message:     a_error.message,
      fullMessage: fullMessage,
      stackArr:    stackInfo.stack,
      stack:       fcf.stackToString(stackInfo.stack)
    }
  }

  function _parseStack(a_lines) {
    let result  = {
      stack: [],
      preStart: -1
    };
    let type    = undefined;
    let at      = "  at ";
    let i       = a_lines.length-1;
    for(; i >= 0; --i) {
      if (i == a_lines.length-1 && a_lines[i] == "")
        continue;
      let item = {};
      if (!type){
        type = a_lines[i].indexOf(at) !== -1 ? "chrome" : "firefox";
      }
      if (type == "chrome"){
        let endPosFunc = a_lines[i].indexOf("(");
        let atPos      = a_lines[i].indexOf(at);
        let posInfoArr;
        if (endPosFunc == -1){
          posInfoArr = a_lines[i].substr(atPos + at.length, a_lines[i].length - atPos - at.length).split(":");
        } else {
          posInfoArr = a_lines[i].substr(endPosFunc+1, a_lines[i].length - endPosFunc - 2).split(":");
        }
        if (posInfoArr.length < 3 || atPos == -1)
          break;
        item.function = endPosFunc != -1 ? a_lines[i].substring(atPos + at.length, endPosFunc - 1) : undefined;
        item.line = posInfoArr[posInfoArr.length - 2];
        item.column = posInfoArr[posInfoArr.length - 1];
        posInfoArr.pop();
        posInfoArr.pop();
        item.file  = posInfoArr.join(":");
      } else { // firefox
        let atPos = a_lines[i].indexOf("@");
        posInfoArr = a_lines[i].substr(atPos + 1, a_lines[i].length - atPos - 1).split(":");
        if (posInfoArr.length < 3 || atPos == -1)
          break;
        if (a_lines[i][atPos-1] == "<")
          atPos -= 1;
        if (a_lines[i][atPos-1] == "/")
          atPos -= 1;
        let functionArr = a_lines[i].substr(0, atPos).split("/");
        functionArr = functionArr[functionArr.length-1].split("*")
        item.function = functionArr[functionArr.length-1];
        item.line = posInfoArr[posInfoArr.length - 2];
        item.column = posInfoArr[posInfoArr.length - 1];
        posInfoArr.pop();
        posInfoArr.pop();
        item.file  = posInfoArr.join(":");
      }
      result.stack.unshift(item);
    }
    result.preStart = i;
    return result;
  }


  /// @fn Date fcf.parseDate(string a_string, string a_format = "Y-m-d*H:i:s.v", boolean a_strict = false, a_default = new Date(1970, 0, 1, 0, 0, 0, 0), a_minOffset = 0)
  /// @brief Converts a string containing a time point to a Date object
  /// @param string a_string - A string containing a time point string
  /// @param string string a_format = "Y*m*d*H*i*s*v" - String specifying the format of the source string
  ///                                   - The following characters can be used in the format string
  ///                                     Y - Year (1000-9999)
  ///                                     m - mMonth (01-12)
  ///                                     d - Day (01-31)
  ///                                     H - Hour (00-23)
  ///                                     h - Hour (01-12)
  ///                                     a - am, pm
  ///                                     A - AM, PM
  ///                                     i - Minutes (00-59)
  ///                                     s - Seconds (00-59)
  ///                                     v - Milliseconds (000-999)
  ///                                     * - any character
  ///                                     Any other character declares its mandatory presence
  ///                                     \ is used to escape special characters.
  /// @param boolean a_strict = false - If false, partial match returns a Date object with partially filled fields.
  ///                                   If true, then Invalid time is returned if the format does not match exactly.
  /// @param string|Date a_default = new Date(1970, 0, 1, 0, 0, 0, 0) - Default value of timestamp fields
  /// @param boolean|integer a_minOffset = 0 Time zone offset, if the value is false then UTC time is used
  /// @result Date - Date object
  fcf.parseDate = (a_string, a_format, a_strict, a_default, a_minOffset) => {
    if (!a_format)
      a_format = "Y*m*d*H*i*s*v";
    let date = a_default instanceof Date    ? a_default :
               typeof a_default == "string" ? fcf.parseDate(a_default, a_format, false, new Date(1970, 0, 1, 0, 0, 0, 0)) :
                                              new Date(1970, 0, 1, 0, 0, 0, 0);
    if (!date || isNaN(date.getTime()))
      date = new Date();

    let setPM = false;
    let setAM = false;
    let formatIndex = 0;
    let sourceIndex = 0;
    let sc = 0;
    for (;formatIndex < a_format.length && sourceIndex < a_string.length; ++formatIndex) {
      let c = a_format[formatIndex];
      if (c == "\\") {
        ++sc;
      } else if (c == "Y" && (sc % 2 == 0)){
        let val = parseInt(a_string.substr(sourceIndex, 4));
        if (isNaN(val))
          return new Date("");
        date.setYear(val);
        sourceIndex += 4;
      } else if (c == "m" && (sc % 2 == 0)) {
        let val = parseInt(a_string.substr(sourceIndex, 2));
        if (isNaN(val) || val > 12 || val < 1)
          return new Date("");
        date.setMonth(val-1);
        sourceIndex += 2;
      } else if (c == "d" && (sc % 2 == 0)) {
        let val = parseInt(a_string.substr(sourceIndex, 2));
        if (isNaN(val) || val > 31 || val < 1)
          return new Date("");
        date.setDate(val);
        sourceIndex += 2;
      } else if (c == "H" && (sc % 2 == 0)) {
        let val = parseInt(a_string.substr(sourceIndex, 2));
        if (isNaN(val) || val > 23 || val < 0)
          return new Date("");
        date.setHours(val);
        sourceIndex += 2;
      } else if (c == "h" && (sc % 2 == 0)) {
        let val = parseInt(a_string.substr(sourceIndex, 2));
        if (isNaN(val) || val > 12 || val < 1)
          return new Date("");
        if (val == 0 || val > 12)
          val = 12;
        date.setHours(val);
        sourceIndex += 2;
      } else if (c == "i" && (sc % 2 == 0)) {
        let val = parseInt(a_string.substr(sourceIndex, 2));
        if (isNaN(val) || val > 59 || val < 0)
          return new Date("");
        date.setMinutes(val);
        sourceIndex += 2;
      } else if (c == "s" && (sc % 2 == 0)) {
        let val = parseInt(a_string.substr(sourceIndex, 2));
        if (isNaN(val) || val > 59 || val < 0)
          return new Date("");
        date.setSeconds(val);
        sourceIndex += 2;
      } else if ((c == "a" || c == "A") && (sc % 2 == 0)) {
        let m = a_string.substr(sourceIndex, 2).toLowerCase();
        if (m == "pm")
          setPM = true;
        else
          setAM = true;
        sourceIndex += 2;
      } else if (c == "v" && (sc % 2 == 0)) {
        let val = parseInt(a_string.substr(sourceIndex, 3));
        if (isNaN(val))
          return new Date("");
        date.setMilliseconds(val);
        sourceIndex += 3;
      } else if (c == "*" && (sc % 2 == 0)) {
        sourceIndex += 1;
      } else {
        if (a_string[sourceIndex] != a_format[formatIndex])
          break;
        sourceIndex += 1;
      }
      if (c != "\\") {
        sc = 0;
      }
    }

    if (a_strict && formatIndex != a_format.length)
      return new Date("");

    if (!formatIndex)
      return new Date("");

    if (setAM && date.getHours() == 12)
      date.setHours(0);
    if (setPM && date.getHours() < 12)
      date.setHours(date.getHours() + 12);

    if (a_minOffset === false) {
      date = new Date(date.getTime() - ((new Date()).getTimezoneOffset()*60000));
    } if (typeof a_minOffset == "number") {
      date = new Date(date.getTime() - (a_minOffset*60000));
    }

    return date;
  }



  /// @fn string fcf.formatDate(Date a_date, string a_format = "Y-m-d H:i:s.v", a_minOffset = 0)
  /// @brief Converts a Date object to a string containing a time point
  /// @param string a_date - a date object
  /// @param string a_format = "Y-m-d*H:i:s.v" - String specifying the format of the source string
  ///                                   - The following characters can be used in the format string
  ///                                     Y - Year (1000-9999)
  ///                                     m - mMonth (01-12)
  ///                                     d - Day (01-31)
  ///                                     H - Hour (00-23)
  ///                                     h - Hour (01-12)
  ///                                     a - am, pm
  ///                                     A - AM, PM
  ///                                     i - Minutes (00-59)
  ///                                     s - Seconds (00-59)
  ///                                     v - Milliseconds (000-999)
  ///                                     Any other character declares its mandatory presence
  ///                                     \ is used to escape special characters.
  /// @param boolean|integer a_minOffset = 0 Time zone offset, if the value is false then UTC time is used
  /// @result string - a string containing a time point
  fcf.formatDate = (a_date, a_format, a_minOffset) => {
    let result = "";
    let slashCounter = 0;

    if (!a_format)
      a_format = "Y-m-d H:i:s.v";

    a_date = new Date(a_date);

    if (!(a_date instanceof Date) || isNaN(a_date.getTime()))
      return "";

    if (typeof a_minOffset == "number") {
      a_date = new Date(a_date.getTime() + (a_minOffset*60000));
    } if (a_minOffset === false) {
      a_date = new Date(a_date.getTime() + ((new Date()).getTimezoneOffset()*60000));
    }

    for(let i = 0; i < a_format.length; ++i){
      if (i != 0 && a_format[i-1] == "\\")
        ++slashCounter;
      else
        slashCounter=0;

      if (slashCounter%2 == 1){
        result += a_format[i];
        continue;
      } else if (a_format[i] == "\\") {
        continue;
      } else if (a_format[i] == "Y") {
        result += (a_date.getYear()+1900).toString().padStart(4, "0");
      } else if (a_format[i] == "m") {
        result += (a_date.getMonth()+1).toString().padStart(2, "0");
      } else if (a_format[i] == "d") {
        result += a_date.getDate().toString().padStart(2, "0");
      } else if (a_format[i] == "H") {
        result += a_date.getHours().toString().padStart(2, "0");
      } else if (a_format[i] == "h") {
        let h = a_date.getHours();
        result += (h == 0 ? 12 : h <= 12 ? h : h - 12).toString().padStart(2, "0");
      } else if (a_format[i] == "i") {
        result += a_date.getMinutes().toString().padStart(2, "0");
      } else if (a_format[i] == "s") {
        result += a_date.getSeconds().toString().padStart(2, "0");
      } else if (a_format[i] == "v") {
        result += a_date.getMilliseconds().toString().padStart(3, "0");
      } else if (a_format[i] == "a") {
        result += a_date.getHours() < 12 ? "am" : "pm";
      } else if (a_format[i] == "A") {
        result += a_date.getHours() < 12 ? "AM" : "PM";
      } else {
        result += a_format[i];
      }
    }
    return result;
  }



  /// @fn string fcf.buildUrl(string|fcf.RouteInfo a_url, object a_args = undefined, string a_anchor = undefined)
  /// @brief Gathers a new URL from the original one by adding arguments and an anchor
  /// @param string|fcf.RouteInfo a_url - Source URL
  /// @param object a_args = undefined - An object containing additional query arguments
  /// @param string a_anchor = undefined - A new anchor
  /// @result string - A new URL
  fcf.buildUrl = (a_url, a_args, a_anchor) => {
    var urlInfo = a_url instanceof fcf.RouteInfo ? a_url : new fcf.RouteInfo(a_url);
    a_url = `${urlInfo.protocol ? urlInfo.protocol + "://" : ""}${urlInfo.server ? urlInfo.server : ""}${urlInfo.port ? ":" + urlInfo.port: ""}${urlInfo.uri}`;
    a_args = fcf.append({}, urlInfo.urlArgs, a_args);

    var first = true;
    for(var k in a_args) {
      if (first)
        a_url += a_url.indexOf('?') != -1 ? '&' : '?';
      else
        a_url += '&';

      a_url += k;
      if (a_args[k] !== null && a_args[k] !== undefined) {
        a_url += '=';
        if (typeof a_args[k] != 'object') {
          a_url += encodeURIComponent(fcf.str(a_args[k]));
        } else {
          a_url += encodeURIComponent(JSON.stringify(a_args[k]));
        }
      }

      first = false;
    }

    if (!fcf.empty(a_anchor))
      a_url += "#" + a_anchor;
    else if (!fcf.empty(urlInfo.anchor))
      a_url += "#" + urlInfo.anchor;

    return a_url;
  }



  /// @class fcf.RouteInfo
  /// @brief Class describing information about the URL route
  fcf.RouteInfo = function(a_settings, a_relativeMode, a_postArgs) {
    ///
    /// @property string url          - URL
    /// @property string referer      - URL without arguments and anchor
    /// @property string uri          - URI without domain, arguments and anchor
    /// @property object urlArgs      - query URL arguments with conversion to JS types
    /// @property object urlArgsRaw   - query URL arguments without conversion to JS types
    /// @property string urlArgsStr   - query URL arguments as string
    /// @property object postArgs     - query POST arguments with conversion to JS types
    /// @property object postArgsRaw  - query POST arguments without conversion to JS types
    /// @property object args         - query POST and GET arguments with conversion to JS types
    /// @property object argsRaw      - query POST and GET arguments without conversion to JS types
    /// @property string anchor       - anchor value
    /// @property string server       - server
    /// @property string protocol     - protocol
    /// @property int    port         - port
    ///
    /// @fn constructor()
    /// @fn constructor(string a_url, string a_relativeMode = "relative", object a_postArgs = {})
    /// @fn constructor(fcf.RouteInfo a_routeInfo, string a_relativeMode = "relative", object a_postArgs = {})
    /// @param string a_url              - URL or URI
    /// @param fcf.RouteInfo a_routeInfo - fcf.RouteInfo source object
    /// @param string a_relativeMode = "relative" - Defines the behavior of the function if the URL is given as a relative path.
    ///                                             The parameter can take one of three values:
    ///                                               - "relative" - A relative path is passed as relative. Example:
    ///                                                   - JS:
    ///                                                     - console.log(new fcf.RouteInfo("part/item?query=1"))
    ///                                                   - Output:
    ///                                                     - {
    ///                                                     -   "url": "part/item?query=1",
    ///                                                     -   "referer": "part/item",
    ///                                                     -   "uri": "part/item",
    ///                                                     -   "urlArgs": {
    ///                                                     -     "query": 1
    ///                                                     -   },
    ///                                                     -   "urlArgsRaw": {
    ///                                                     -     "query": "1"
    ///                                                     -   },
    ///                                                     -   "urlArgsStr": "query=1",
    ///                                                     -   "postArgs": {},
    ///                                                     -   "postArgsRaw": {},
    ///                                                     -   "args": {
    ///                                                     -     "query": 1
    ///                                                     -   },
    ///                                                     -   "argsRaw": {
    ///                                                     -     "query": "1"
    ///                                                     -   },
    ///                                                     -   "subUri": "",
    ///                                                     -   "anchor": "",
    ///                                                     -   "server": "",
    ///                                                     -   "protocol": ""
    ///                                                     - }
    ///                                               - "root" - Relative paths are interpreted as a path specified from the root. Example:
    ///                                                   - JS:
    ///                                                     - console.log(new fcf.RouteInfo("part/item?query=1", "root"))
    ///                                                   - Output:
    ///                                                     - {
    ///                                                     -   "url": "/part/item?query=1",
    ///                                                     -   "referer": "/part/item",
    ///                                                     -   "uri": "/part/item",
    ///                                                     -   "urlArgs": {
    ///                                                     -     "query": 1
    ///                                                     -   },
    ///                                                     -   "urlArgsRaw": {
    ///                                                     -     "query": "1"
    ///                                                     -   },
    ///                                                     -   "urlArgsStr": "query=1",
    ///                                                     -   "postArgs": {},
    ///                                                     -   "postArgsRaw": {},
    ///                                                     -   "args": {
    ///                                                     -     "query": 1
    ///                                                     -   },
    ///                                                     -   "argsRaw": {
    ///                                                     -     "query": "1"
    ///                                                     -   },
    ///                                                     -   "subUri": "",
    ///                                                     -   "anchor": "",
    ///                                                     -   "server": "",
    ///                                                     -   "protocol": ""
    ///                                                     - }
    ///                                               - "server" - The first element of a relative path is interpreted as the name of the server. Example:
    ///                                                   - JS:
    ///                                                     - console.log(new fcf.RouteInfo("part.org:8080/item?query=1", "server"))
    ///                                                   - Output:
    ///                                                     - {
    ///                                                     -   "url": "http://part.org:8080/item?query=1",
    ///                                                     -   "referer": "http://part.org:8080/item",
    ///                                                     -   "uri": "/item",
    ///                                                     -   "urlArgs": {
    ///                                                     -     "query": 1
    ///                                                     -   },
    ///                                                     -   "urlArgsRaw": {
    ///                                                     -     "query": "1"
    ///                                                     -   },
    ///                                                     -   "urlArgsStr": "query=1",
    ///                                                     -   "postArgs": {},
    ///                                                     -   "postArgsRaw": {},
    ///                                                     -   "args": {
    ///                                                     -     "query": 1
    ///                                                     -   },
    ///                                                     -   "argsRaw": {
    ///                                                     -     "query": "1"
    ///                                                     -   },
    ///                                                     -   "subUri": "",
    ///                                                     -   "anchor": "",
    ///                                                     -   "server": "part.org",
    ///                                                     -   "port": 8080,
    ///                                                     -   "protocol": "http"
    ///                                                     - }
    /// @param object a_postArgs = {}- post arguments
    this.url         = '';
    this.referer     = '';
    this.uri         = '';
    this.urlArgs     = {};
    this.urlArgsRaw  = {};
    this.urlArgsStr  = '';
    this.postArgs    = {};
    this.postArgsRaw = {};
    this.args        = {};
    this.argsRaw     = {};
    this.subUri      = '';
    this.anchor      = '';
    this.server      = '';
    this.port        = undefined;
    this.protocol    = '';

    if (typeof a_settings == "string") {
      a_settings = { url: a_settings };
    }
    if (a_settings instanceof fcf.RouteInfo) {
      fcf.append(true, this, a_settings);
      this.url = fcf.buildUrl(this.referer, this.urlArgs, this.anchor);
    } else if (a_settings && typeof a_settings == "object" && typeof a_settings.url == "string") {
      let sourceURL = a_settings.url;
      let protocolPos = -1;
      let referer;
      let queryArgsStr;
      {
        let pos = sourceURL.indexOf("://");
        if (pos == -1){
          pos = 0;
        } else {
          pos += 3;
        }
        let prefix = sourceURL.substring(0, pos);
        let body   = sourceURL.substring(pos);
        let pos1   = body.indexOf("?");
        if (pos1 == -1)
          pos1 = Infinity;
        let pos2   = body.indexOf("#");
        if (pos2 == -1)
          pos2 = Infinity;
        pos1 = Math.min(pos1, pos2);
        let suffix = body.substring(pos1 !== Infinity ? pos1 : body.length);
        body = body.substring(0, pos1 !== Infinity ? pos1 : body.length);
        let parts = body.split("/");
        let resultParts = [];
        for(let i = 0; i < parts.length; ++i) {
          if (parts[i] == ""){
            if (!prefix.length && i == 0){
              resultParts.push(parts[i]);
            } else {
              continue;
            }
          } else if (parts[i] == ".") {
            continue;
          } else if (parts[i] == "..") {
            if (resultParts.length == 1 && (prefix.length || a_relativeMode === "server")) {
              continue;
            } else {
              resultParts.pop();
            }
          } else {
            resultParts.push(parts[i]);
          }
        }
        sourceURL = prefix + resultParts.join("/") + suffix;
      }
      {
        referer = fcf.rtrim(sourceURL.split("?")[0].split("#")[0], ["/"]);
        if (referer[0] === "/") {
          if (a_relativeMode == "server") {
            sourceURL = "http:/" + sourceURL;
            let pos = referer.indexOf("/", 1);
            this.uri = pos != -1 ? referer.substring(pos) : "/";
            referer = "http:/" + referer;
            protocolPos = 4;
          } else {
            this.uri = referer;
          }
        } else {
          protocolPos = referer.indexOf("://");
          if (protocolPos != -1) {
            let pos2 = referer.indexOf("/", protocolPos + 3);
            this.uri = pos2 != -1 ? referer.substr(pos2) : "/";
          } else {
            if (a_relativeMode == "root"){
              this.uri = "/" + referer;
            } else if (a_relativeMode == "server") {
              sourceURL = "http://" + sourceURL;
              let pos = referer.indexOf("/");
              this.uri = pos != -1 ? referer.substring(pos) : "/";
              referer = "http://" + referer;
              protocolPos = 4;
            } else {
              this.uri = referer;
            }
          }
        }
      }
      {
        this.protocol = protocolPos !== -1 ? referer.substring(0, protocolPos) : "";
      }
      {
        if (protocolPos != -1) {
          let serverEnd = referer.indexOf("/", protocolPos+3);
          if (serverEnd == -1) {
            serverEnd = referer.length;
          }
          this.server = referer.substring(protocolPos+3, serverEnd);
        }
        let arr = this.server.split(":");
        this.server = arr[0];
        this.port   = parseInt(arr[1]) || undefined;
      }
      {
        this.referer = fcf.rtrim(protocolPos != -1 ? this.protocol + "://" + this.server  + (this.port ? ":" + this.port : "") + this.uri
                                                    : this.uri,
                                 ["/"]);
      }
      {
        let queryPos    = sourceURL.indexOf("?");
        if (queryPos != -1) {
          let queryPosEnd = -1;
          queryPosEnd = sourceURL.indexOf("#");
          if (queryPosEnd == -1){
            queryPosEnd = sourceURL.length;
          }
          queryArgsStr = sourceURL.substring(queryPos+1, queryPosEnd);
          queryArgsArr = queryArgsStr.split("&");
          for(let queryArg of queryArgsArr) {
            let queryArgArr = queryArg.split("=");
            this.urlArgs[decodeURIComponent(queryArgArr[0])] = queryArgArr[1] !== undefined ? decodeURIComponent(queryArgArr[1]) : undefined;
          }
        }
      }
      {
        let queryPos    = sourceURL.indexOf("?");
        if (queryPos != -1) {
          let queryPosEnd = -1;
          queryPosEnd = sourceURL.indexOf("#");
          if (queryPosEnd == -1){
            queryPosEnd = sourceURL.length;
          }
          this.urlArgsStr = sourceURL.substring(queryPos+1, queryPosEnd);
          queryArgsArr = this.urlArgsStr.split("&");
          for(let queryArg of queryArgsArr) {
            let queryArgArr = queryArg.split("=");
            this.urlArgsRaw[decodeURIComponent(queryArgArr[0])] = queryArgArr[1] !== undefined ? decodeURIComponent(queryArgArr[1]) : undefined;
          }
        }
      }
      {
        for(let k in this.urlArgsRaw) {
          this.urlArgs[k] = _autoParse(this.urlArgsRaw[k]);
        }
      }
      {
        let pos = sourceURL.indexOf("#");
        if (pos != -1) {
          this.anchor = sourceURL.substr(pos+1);
        }
      }
      {
        this.url = this.referer + (queryArgsStr ? "?" + queryArgsStr : "") + (this.anchor ? "#" + this.anchor : "");
      }
      {
        if (a_postArgs && typeof a_postArgs == "object") {
          fcf.append(true, this.postArgsRaw, a_postArgs);
        }
      }
      {
        if (a_settings.postArgsRaw && typeof a_settings.postArgsRaw == "object") {
          fcf.append(true, this.postArgsRaw, a_settings.postArgsRaw);
        }
      }
      {
        for(let k in this.postArgsRaw) {
          this.postArgs[k] = _autoParse(this.postArgsRaw[k]);
        }
      }
      {
        if (typeof a_settings.postArgs == "object") {
          fcf.append(this.postArgs, fcf.clone(a_settings.postArgs));
        }
      }
      {
        this.args = fcf.clone(fcf.append({}, this.urlArgs, this.postArgs));
      }
      {
        this.argsRaw = fcf.clone(fcf.append({}, this.urlArgsRaw, this.postArgsRaw));
      }
      {
        if (a_settings.subUri)
          this.subUri = a_settings.subUri;
      }
    }
  }



  //
  // TOKENIZE & JS EXECUTION FUNCTIONS
  //



  /// @fn mixed fcf.inlineExecution(string a_code)
  /// @fn mixed fcf.inlineExecution(string a_code, object a_environment)
  /// @brief Executes inline JavaScript code
  /// @details When executed on the server side, only math instructions are allowed, the ? (),
  ///          mapping to variables from a_environment and objects declared in tokenize.objects configuration,
  ///          function calls allowed in tokenize.functions configuration parameter (see fcf-framework-core:serverConfig.js file ).
  ///          On the browser side, a simple eval call is used and JS restrictions are not imposed
  /// @param string a_code - inline JS code
  /// @param object a_environment - Object with additional variables
  /// @result mixed - Calculation result
  fcf.inlineExecution = (a_code, a_environment) => {
    if (_isServer){
      return libInlineInterpreter.execute(a_code, a_environment);
    } else {
      let funcCode = `((___fcf_environment, ___fcf_arg_environment)=>{ with(___fcf_environment) { with(___fcf_arg_environment) { return (${a_code}); } } })`;
      let func     = _inlineFunctions.get(_inlineFunctions);
      if (!func) {
        func = eval(funcCode);
        _inlineFunctions.set(funcCode, func);
      }
      return func(fcf.getConfiguration()._tokenizeEnvironment || {}, typeof a_environment !== "object" ? {} : a_environment);
    }
  }
  const _inlineFunctions = new Map();



  /// @fn mixed fcf.tokenize(strign a_code, object a_environment = {}, object a_options = {quiet: false, result: "string"})
  /// @brief Performs string tokenization
  /// @details Substitution constructs can be used in the tokenized string:
  ///           - @{{INLINE_JS_CODE}}@ - Inline JavaScript calculation expression substituted into a string.
  ///                                    If the string contains only the calculated value without
  ///                                    additional characters, then the function will return the resulting
  ///                                    values as is, without converting to a string.
  ///           - !{{TEXT_STRING}}! - Inserts the translation of the string TEXT_STRING into the user's language
  /// @param string a_code - A text string in which the @{{}}@ and !{{}}!
  /// @param object a_environment = {} - An object with environment variables that can be used in the @{{}}@ construct
  /// @param  boolean a_quiet = false - If it is true, then when an exception occurs in the @{{}}@ construction, no exception is raised, but the original string a_code is returned
  /// @result string - Processed string
  fcf.tokenize = (a_code, a_environment, a_options)=> {
    if (typeof a_environment !== "object" || !a_environment){
      a_environment = {};
    }
    const t = typeof a_code;
    if (t == "string") {
      let quiet      = a_options ? a_options.quiet : false;
      let resultMode = a_options ? a_options.result : "string";
      return _tokenize(a_code, a_environment, "{{", "}}", quiet, resultMode);
    } else if (t == "object") {
      for(let k in a_code) {
        const t = typeof a_code[k];
        if (t == "object" || t == "string"){
          a_code[k] = fcf.tokenize(a_code[k], a_environment, a_options);
        }
      }
    }
    return a_code;
  }



  /// @fn mixed fcf.pattern(strign a_code, object a_environment = {}, object a_options = {quiet: false, result: "string"})
  /// @brief Performs string tokenization
  /// @details Substitution constructs can be used in the tokenized string:
  ///           - @{INLINE_JS_CODE}@ - Inline JavaScript calculation expression substituted into a string.
  ///                                    If the string contains only the calculated value without
  ///                                    additional characters, then the function will return the resulting
  ///                                    values as is, without converting to a string.
  ///           - !{TEXT_STRING}! - Inserts the translation of the string TEXT_STRING into the user's language
  /// The function ignores @{{...}}@ and !{{...}}! constructs.
  /// @param string a_code - A text string in which the @{}@ and !{}!
  /// @param object a_environment = {} - An object with environment variables that can be used in the @{}@ construct
  /// @param  boolean a_quiet = false - If it is true, then when an exception occurs in the @{}@ construction, no exception is raised, but the original string a_code is returned
  /// @result string - Processed string
  fcf.pattern = (a_code, a_environment, a_options)=> {
    if (typeof a_environment !== "object" || !a_environment) {
      a_environment = {};
    }
    const t = typeof a_code;
    if (t == "string") {
      let quiet      = a_options ? a_options.quiet  : false;
      let resultMode = a_options ? a_options.result : "string";
      return _tokenize(a_code, a_environment, "{", "}", quiet, resultMode);
    } else if (t == "object") {
      for(let k in a_code) {
        const t = typeof a_code[k];
        if (t == "object" || t == "string"){
          a_code[k] = fcf.pattern(a_code[k], a_environment, a_options);
        }
      }
    }
    return a_code;
  }
  const _tokenize = (a_code, a_environment, a_construct1, a_construct2, a_quiet, a_resultMode)=>{
    let result = "";
    let cmd;
    let lst    = 0;
    let found  = false;
    let pos    = 0;
    while(true) {
      pos = a_code.indexOf(a_construct1, pos);
      if (pos == -1)
        break;

      found = true;
      cmd = a_code[pos-1];
      if (cmd == "@" || cmd == "!") {
        let nextLst = pos + a_construct1.length;
        pos = a_code.indexOf(a_construct2+cmd, nextLst);
        if (pos == -1) {
          result += a_code.substring(lst, nextLst-1-a_construct1.length);
          lst = nextLst;
          lst -= a_construct1.length + 1;
          break;
        }
        if (a_construct1.length == 1 && a_code[nextLst] == a_construct1 && a_code[pos-1] == a_construct2){
          pos += a_construct2.length + 1;
          continue;
        }
        result += a_code.substring(lst, nextLst-1-a_construct1.length);
        lst = nextLst;
        let r;
        try {
          if (cmd == "@") {
            let codeStr = fcf.trim(a_code.substring(lst, pos));
            if (codeStr.search(/^[a-zA-Z_. ][a-zA-Z0-9_. ]*$/) != -1 && codeStr !== "true" && codeStr !== "false" && codeStr !== "undefined" && codeStr !== "NaN" && codeStr !== "null"){
              let ptr = fcf.resolveEx(a_environment, codeStr);
              if (ptr.object === undefined || !(ptr.key in ptr.object)) {
                ptr = fcf.resolveEx(fcf.getConfiguration()._tokenizeEnvironment, codeStr);
                if (ptr.object === undefined){
                  throw new fcf.Exception("ACCESS_FAILED_FIELD_TOKENIZE", {command: codeStr});
                }
              }
              r = ptr.object[ptr.key];
            } else {
              r = fcf.inlineExecution(codeStr, a_environment);
            }
          } else {
            r = fcf.t(a_code.substring(lst, pos));
            if (r.indexOf(a_construct1) !== -1){
              r = _tokenize(r, a_environment, a_construct1, a_construct2, a_quiet, a_resultMode);
            }
          }
        } catch(e) {
          if (!a_quiet) {
            throw e;
          }
          pos += a_construct1.length + 1;
          result += a_code.substring(lst -  a_construct1.length - 1, pos);
          lst = pos;
          break;
        }
        if (result.length == 0 && (pos + a_construct1.length + 1) == a_code.length && a_resultMode == "auto") {
          return r;
        } else {
          result += r;
        }
        pos += a_construct1.length + 1;
        lst = pos;
      } else {
        pos += a_construct1.length;
        continue;
      }
    }
    if (!found) {
      return a_code;
    }
    result += a_code.substring(lst);
    return result;
  }



  /// @fn string fcf.t(string a_str, string a_lang = fcf.getContext().language || fcf.getConfiguration().defaultLanguage)
  /// @brief Performs a line feed. If no translation is found, the original string is returned.
  /// @param string a_str - Translation string
  /// @param string a_lang = fcf.getContext().language || fcf.getConfiguration().defaultLanguage - Language ("jp", "fr", "ru", ...)
  /// @result string - Translated string
  fcf.t = (a_str, a_lang) => {
    if (!_translateInit) {
      fcf.appendTranslate();
    }
    a_lang = a_lang || (fcf.getContext() ? fcf.getContext().language : fcf.getConfiguration().defaultLanguage);
    return _translations[a_lang] && a_str in _translations[a_lang] ? _translations[a_lang][a_str] : a_str;
  }



  /// @fn string|object fcf.translate(string|object a_str, string a_lang = fcf.getContext().language || fcf.getConfiguration().defaultLanguage)
  /// @brief Performs tokenization of translations in a string. Tokenization is performed for !{{}}! and !{}!
  /// @param string|object a_str - Tokenized string
  /// @param string a_lang = fcf.getContext().language - Language ("jp", "fr", "ru", ...)
  /// @result string
  fcf.translate = (a_str, a_language) => {
    const t = typeof a_str;
    if (t == "string") {
      return _translate(a_str, a_language);
    } else if (t == "object") {
      for(let k in a_str) {
        const t = typeof a_str[k];
        if (t == "object" || t == "string") {
          a_str[k] = fcf.translate(a_str[k], a_language);
        }
      }
    }
    return a_code;
  }

  const _translate = (a_str, a_language) => {
    let result = "";
    let cmd;
    let lst    = 0;
    let pos    = 0;
    let found  = false;
    while(true) {
      pos = a_str.indexOf("{", pos);
      if (pos == -1)
        break;
      found = true;
      if (a_str[pos-1] == "!") {
        let double = a_str[pos+1] == "{";
        result += a_str.substring(lst, pos-1);
        lst = pos + (double ? 2 : 1);
        pos = a_str.indexOf(double ? "}}!" : "}!", lst);
        if (pos == -1) {
          lst -= double ? 3 : 2;
          break;
        }
        result += fcf.t(a_str.substring(lst, pos), a_language);
        pos += double ? 3 : 2;
        lst = pos;
      } else {
        pos += 1;
        continue;
      }
    }
    if (!found)
      return a_str;
    result += a_str.substring(lst);
    return result;
  }



  /// @fn fcf.appendTranslate(object|string a_dataOrFileName = undefined, boolean a_reload = false)
  /// @brief Adds translations
  /// @param object|string a_dataOrFileName - Information about added translations
  ///                                         - If the argument is a string, then the string points to a translation file in FCF path notation
  ///                                           - Single language translation file example:
  ///                                             {
  ///                                               language: "jp",
  ///                                               translations: {
  ///                                                 "Hello": "こんにちは"
  ///                                               }
  ///                                             }
  ///                                           - Multiple language translation file example:
  ///                                             [
  ///                                               {
  ///                                                 language: "jp",
  ///                                                 translations: {
  ///                                                   "Hello": "こんにちは"
  ///                                                 },
  ///                                               },
  ///                                               {
  ///                                                 language: "fr",
  ///                                                 translations: {
  ///                                                   "Hello": "Bonjour"
  ///                                                 },
  ///                                               },
  ///                                             ]
  ///                                         - If the argument is given by an object, then the object contains information about translations similar to the contents of files
  /// @param boolean a_reload = false - If the argument is true, then all translation files are reread
  fcf.appendTranslate = (a_dataOrFileName, a_reload) => {
    let translations = {};
    let translationsFiles = {};
    fcf.actions()
    .then(() => {
      if (a_dataOrFileName) {
        a_dataOrFileName = Array.isArray(a_dataOrFileName) ? a_dataOrFileName : [a_dataOrFileName];
        fcf.getConfiguration().append({translations: a_dataOrFileName});
      }
      for (let trans of fcf.getConfiguration().translations) {
        let path;
        if (typeof trans == "string") {
          path = fcf.getPath(trans);
          if (!a_reload && path in _translationsFiles){
            trans = _translationsFiles[path];
          } else {
            let error;
            trans = fcf.load(path, {format: "json", async: false}).exception().result();
          }
        }
        trans = Array.isArray(trans) ? trans : [trans];
        for(let transItem of trans) {
          translations[transItem.language] = fcf.append({}, translations[transItem.language], transItem.translations);
        }
        if (path) {
          translationsFiles[path] = trans;
        }
      }
    })
    .then(()=>{
      _translations = translations;
      _translationsFiles = translationsFiles;
    })
    .finally(()=>{
      _translateInit = true;
    })
    .catch((e)=>{
      throw e;
    });
  }



  /// @fn [object] fcf.getTranslations()
  /// @brief Returns an object with information about translation files
  /// @result object - Object with content of translation files. The key is the filename and the value is the data.
  fcf.getTranslations = () => {
    return _translationsFiles;
  }

  let _translateInit     = false;
  let _translations      = {};
  let _translationsFiles = {};



  /// @class fcf.EventChannel
  /// @brief Extended event сhannel
  fcf.EventChannel = class EventChannel {

    constructor() {
      this._callbacks = {};
      this._counters = {};
      this._led = {};
    }



    /// @method on(staring a_eventName, function a_callback)
    /// @method on(staring a_eventName, object a_options, function a_callback)
    /// @brief Adding an event handler
    /// @param string a_eventName - Event name
    /// @param object a_options - Extended options
    ///                           - Object properties:
    ///                             - number level = 0 - The callback processing order level.
    ///                                                  The order in which handlers are called is from lowest to highest level.
    /// @param function a_callback - Callback handler
    ///                               - Function signature: (async or simple) a_callback(object a_eventData, object a_eventHeader)
    ///                                       - object a_eventData - The event data that was passed to the send function
    ///                                       - object a_eventHeader - Event header
    ///                                                   - Object properties:
    ///                                                       - string name - Event name
    on(a_eventName, a_options, a_callback) {
      this._on(a_eventName, a_options, a_callback, false);
    }



    /// @method on(staring a_eventName, function a_callback)
    /// @method on(staring a_eventName, object a_options, function a_callback)
    /// @brief Adds a single execution event handler
    /// @param string a_eventName - Event name
    /// @param object a_options - Extended options
    ///                           - Object properties:
    ///                             - number level = 0 - The callback processing order level.
    ///                                                  The order in which handlers are called is from lowest to highest level.
    /// @param function a_callback - Callback handler
    ///                               - Function signature: (async or simple) a_callback(object a_eventData, object a_eventHeader)
    ///                                       - object a_eventData - The event data that was passed to the send function
    ///                                       - object a_eventHeader - Event header
    ///                                                   - Object properties:
    ///                                                       - string name - Event name
    once(a_eventName, a_options, a_callback) {
      this._on(a_eventName, a_options, a_callback, true);
    }



    /// @method on(staring a_eventName, function a_callback)
    /// @method on(staring a_eventName, object a_options, function a_callback)
    /// @brief Adds an event handler that is called only on the first dispatch of the event.
    ///        If the event call has already been executed, then the handler is called with data about the previous call.
    /// @param string a_eventName - Event name
    /// @param object a_options - Extended options
    ///                           - Object properties:
    ///                             - number level = 0 - The callback processing order level.
    ///                                                  The order in which handlers are called is from lowest to highest level.
    /// @param function a_callback - Callback handler
    ///                               - Function signature: (async or simple) a_callback(object a_eventData, object a_eventHeader)
    ///                                       - object a_eventData - The event data that was passed to the send function
    ///                                       - object a_eventHeader - Event header
    ///                                                   - Object properties:
    ///                                                       - string name - Event name
    onmet(a_eventName, a_options, a_callback) {
      if (a_eventName in this._counters) {
        if (typeof a_options === "function") {
          a_callback = a_options;
          a_options  = undefined;
        }
        let eventHeader = { name: a_eventName };
        let data = this._led[a_eventName];
        return fcf.actions()
        .then(()=>{
          return a_callback(data, eventHeader);
        })
        .then(()=>{
          return data;
        });
      }
      this._on(a_eventName, a_options, a_callback, true);
    }



    /// @method detach(function a_callback)
    /// @method detach(string a_eventName, function a_callback)
    /// @brief Unbind an event handler
    /// @param string a_eventName - event name
    /// @param function a_callback - Event handler function
    detach(a_eventName, a_callback) {
      if (typeof a_eventName === "function") {
        a_callback = a_eventName;
        a_eventName = undefined;
      }
      if (!a_callback || !a_callback.___fcffuncids)
        return;
      let es;
      if (a_eventName) {
        es = {};
        if (this._callbacks[a_eventName]) {
          es[a_eventName] = this._callbacks[a_eventName];
        }
      } else {
        es = this._callbacks;
      }
      for(let eventName in es) {
        let callbacks = es[eventName];
        for(let id in a_callback.___fcffuncids) {
          let level = a_callback.___fcffuncids[id].level;
          if (!(level in callbacks.levels))
            continue;
          if (callbacks.levels[level][id]) {
            delete a_callback.___fcffuncids[id];
          }
          delete callbacks.levels[level][id];
          if (fcf.empty(callbacks.levels[level])) {
            delete callbacks.levels[level];
            let index = callbacks.order.indexOf(level);
            if (index != -1) {
              callbacks.order.splice(index, 1);
            }
            if (!callbacks.order.length) {
              delete this._callbacks[eventName];
            }
          }
        }
      }
    }



    /// @method fcf.Actions->object send(string a_eventName, object a_event)
    /// @method fcf.Actions->object send(string a_eventName, object a_eventOptions, object a_event)
    /// @brief Sends a message
    /// @param string a_eventName    - Event name
    /// @param object a_eventOptions - Extens options:
    ///                                 - boolean exresult = false - Format of the result returned by the method through the fcf.Actions object
    ///                                   If this option equal true, then method result an object with next fields:
    ///                                     - object event  - Modified a_event argument data
    ///                                     - object header - Event header
    ///                                   If this option is false, then the result of the method will be the modified data of the a_event argument.
    /// @param object a_event        - Event data object
    /// @result fcf.Actions->object Returns a lazy action object that returns an event data object (The format depends on the exresult option)
    send(a_eventName, a_eventOptions, a_event) {
      if (a_event === undefined){
        a_event = a_eventOptions;
        a_eventOptions = {};
      }
      if (!(a_eventName in this._counters))
        this._counters[a_eventName] = 1;
      else
        ++this._counters[a_eventName];
      this._led[a_eventName] = a_event;
      let eventHeader = { name: a_eventName };
      if (!(a_eventName in this._callbacks)) {
        return fcf.actions().result(a_eventOptions.exresult ? { event: a_event, header: eventHeader} : a_event);
      }
      let callbacks = this._callbacks[a_eventName];
      let actions;
      let deferred = [];
      let rm = [];
      let error;
      for(let levelKey of callbacks.order) {
        let levelValue = callbacks.levels[levelKey];
        for(let id in levelValue) {
          if (!actions) {
            if (levelValue[id].once) {
              rm.push({level: levelKey, id: id});
            }
            try {
              actions = levelValue[id].cb(a_event, eventHeader);
            } catch(e) {
              error = e;
              break;
            }
            if (!(actions instanceof Promise) && !(actions instanceof fcf.Actions)) {
              actions = undefined;
            }
          } else {
            deferred.push([levelKey, id, levelValue[id].cb, levelValue[id].once]);
          }
        }
        if (error) {
          break;
        }
      }
      if (actions){
        return fcf.actions()
        .then(()=>{
          return actions;
        })
        .each(deferred, (a_key, a_callbackInfo, a_res, a_act) => {
          if (a_callbackInfo[3]) {
            rm.push({level: a_callbackInfo[0], id: a_callbackInfo[1]});
          }
          let res;
          try {
            res = a_callbackInfo[2](a_event, eventHeader);
          } catch(e){
            a_act.error(e);
            return;
          }
          if (!(res instanceof Promise) && !(res instanceof fcf.Actions)) {
            a_act.complete();
          } else {
            res
            .then(()=>{
              a_act.complete();
            })
            .catch((e)=>{
              a_act.error(e);
            });
          }
        })
        .finally(()=>{
          for(let rmitem of rm) {
            delete callbacks.levels[rmitem.level][rmitem.id];
            if (fcf.empty(callbacks.levels[rmitem.level])){
              delete callbacks.levels[rmitem.level];
              let orderIndex = callbacks.order.indexOf(rmitem.level);
              if (orderIndex != -1) {
                callbacks.order.splice(orderIndex, 1);
              }
              if (!callbacks.order.length) {
                delete this._callbacks[a_eventName];
              }
            }
          }
        })
        .then(()=>{
          return a_eventOptions.exresult ? { event: a_event, header: eventHeader} : a_event;
        });
      } else {
        for(let rmitem of rm) {
          delete callbacks.levels[rmitem.level][rmitem.id];
          if (fcf.empty(callbacks.levels[rmitem.level])){
            delete callbacks.levels[rmitem.level];
            let orderIndex = callbacks.order.indexOf(rmitem.level);
            if (orderIndex != -1) {
              callbacks.order.splice(orderIndex, 1);
            }
            if (!callbacks.order.length) {
              delete this._callbacks[a_eventName];
            }
          }
        }
        return !error ? fcf.actions().result(a_eventOptions.exresult ? { event: a_event, header: eventHeader} : a_event )
                      : fcf.actions().error(error);
      }
    }



    /// @method integer count(string a_eventName){
    /// @brief Returns the number of calls made to the event a_eventName
    /// @param string a_eventName - Event name
    /// @result integer - The number of calls made to the event a_eventName
    count(a_eventName){
      return a_eventName in this._counters ? (!this._counters[a_eventName] ? 1 : this._counters[a_eventName]) : 0;
    }

    _on(a_eventName, a_options, a_callback, a_once) {
      if (typeof a_options === "function") {
        a_callback = a_options;
        a_options  = undefined;
      }

      let level = a_options && a_options.level ? parseFloat(a_options.level) : 0;

      let id = fcf.id();
      if (!("___fcffuncids" in a_callback)){
        Object.defineProperty(a_callback, "___fcffuncids", { value: {}, writable:   false, enumerable: false });
      }
      a_callback.___fcffuncids[id] = { level: level };

      if (!(a_eventName in this._callbacks)) {
        this._callbacks[a_eventName] = { order: [], levels: {} };
      }

      let callbacks = this._callbacks[a_eventName];
      if (!(level in callbacks.levels)) {
        callbacks.levels[level] = { };
        callbacks.order.push(level);
        callbacks.order.sort((l, r)=>{ return l < r ? -1 : l > r ? 1 : 0});
      }
      callbacks.levels[level][id] = { cb: a_callback, once: a_once };
    }
  };



  /// @class fcf.Exception
  /// @brief Exception class
  /// @example
  ///   JS code:
  ///     fcf.addException("OVER_SIZE", "Over size: @{{value}}@ > @{{size}}@")
  ///     var exception = new fcf.Exception("OVER_SIZE", {value: 10, size: 9});
  ///     console.log(exception.message);
  ///   Output:
  ///     Over size: 10 > 9
  fcf.Exception = class Exception extends Error{

    /// @property string   name - Exception name
    /// @property Error    exception - Nested error object, to indicate the cause of the underlying exception
    /// @property string   message - Error message
    /// @property [object] stackArr - Array with call stack information
    ///                                - Object properties:
    ///                                 - string file - JS file
    ///                                 - string function - function name
    ///                                 - number line - line number
    ///                                 - number column - column number



    /// @method constructor(string a_exceptionName, object a_args = {}, Error a_subException = undefined)
    /// @method constructor(Error a_baseException, object a_args = {}, Error a_subException = undefined)
    /// @method constructor(object a_baseExceptionData, object a_args = {}, Error a_subException = undefined)
    /// @param string a_exceptionName - Exception name
    /// @param Error a_baseException - The original exception object whose data is being copied
    /// @param object a_baseExceptionData - Basic exception object data, this argument can be used to recover the error object received from the server in JSON format
    /// @param object a_args = {} - Object with exception object arguments
    /// @param Error a_subException - Nested error object, to indicate the cause of the underlying exception
    constructor(a_nameOrMessageOrException, a_args, a_subException) {
      super(a_nameOrMessageOrException);
      let exceptionName;
      let template;
      let stackTxt;
      let stackTxtStartLevel = 1;

      if (a_args instanceof Error) {
        a_subException = a_args;
        a_args = {};
      }

      if (Array.isArray(a_args)) {
        for(var i = 0; i < a_args.length; ++i)
          this[i+1] = a_args[i];
      } else if (a_args instanceof Error){
        a_subException = a_args;
        a_args = undefined;
      } else if (typeof a_args == "object"){
        for(let key in a_args)
          this[key] = a_args[key];
      }

      if (typeof a_nameOrMessageOrException == "string"){
        template = _exceptions[a_nameOrMessageOrException];
        if (!template) {
          exceptionName = "ERROR";
          template      = _exceptions[exceptionName];
          this.error    = a_nameOrMessageOrException;
        } else {
          exceptionName = a_nameOrMessageOrException;
        }
      } else if (a_nameOrMessageOrException instanceof Error) {
        exceptionName       = "ERROR";
        stackTxt            = a_nameOrMessageOrException.stack || a_nameOrMessageOrException.stacktrace;
        stackTxtStartLevel  = 0;
        template            = _exceptions[exceptionName];
        this.error          = fcf.parseError(a_nameOrMessageOrException).fullMessage;
      } else if (typeof a_nameOrMessageOrException == "object") {
        template = _exceptions[a_nameOrMessageOrException.name];
        if (!template){
          if (a_nameOrMessageOrException._templateMessage){
            for(let key in a_nameOrMessageOrException)
              this[key] = a_nameOrMessageOrException[key];
            exceptionName = a_nameOrMessageOrException.name ? a_nameOrMessageOrException.name : "ERROR";
            template      = a_nameOrMessageOrException._templateMessage;
          } if (a_nameOrMessageOrException.message && (a_nameOrMessageOrException.stack || a_nameOrMessageOrException.stacktrace)){
            exceptionName       = "ERROR";
            stackTxt            = a_nameOrMessageOrException.stack || a_nameOrMessageOrException.stacktrace;
            stackTxtStartLevel  = 0;
            template            = _exceptions[exceptionName];
            this.error          = a_nameOrMessageOrException.message;
          } else {
            for(let key in a_nameOrMessageOrException)
              this[key] = a_nameOrMessageOrException[key];
            exceptionName = a_nameOrMessageOrException.name ? a_nameOrMessageOrException.name : "ERROR";
            template      = _exceptions["ERROR"];
            this.error    = a_nameOrMessageOrException.error    ? a_nameOrMessageOrException.error :
                            a_nameOrMessageOrException.message  ? a_nameOrMessageOrException.message :
                                                                  "Unknown error";
          }
        } else {
          for(let key in a_nameOrMessageOrException)
            this[key] = a_nameOrMessageOrException[key];
          exceptionName = a_nameOrMessageOrException.name;
        }
      }

      this.name             = exceptionName;
      this._templateMessage = template;
      this.exception        = a_subException;
      if (!Array.isArray(this.stackArr)) {
        if (!stackTxt)
          stackTxt = typeof console === "object" &&  console.trace === "function" ? console.trace() : (new Error()).stack
        if (stackTxt === undefined) {
          try {
            throw new Error();
          } catch(e) {
            stackTxt = e.stack;
          }
        }
        this.stackArr  = fcf.parseStack(stackTxt, stackTxtStartLevel);
      }
      this.message     = this.toString();
    }



    /// @method string toString(boolean a_enableStack = false, boolean a_enableSubException = false, strign a_language = fcf.getConfiguration().defaultLanguage) {
    /// @brief Get error message
    /// @param boolean a_enableStack = false - If true, then the call stack is added to the error message
    /// @param boolean a_enableSubException = false - If true, then information about the sub-error that caused the main exception is added to the error message.
    /// @param string a_language = fcf.getConfiguration().defaultLanguage - Message language
    /// @result string - Error message
    toString(a_enableStack, a_enableSubException, a_language) {
      let message = "";
      message = fcf.t(this._templateMessage, a_language);
      message = fcf.tokenize(message, this, {quiet: true});
      if (a_enableStack) {
        message += "\nStack: " + fcf.replaceAll("\n" + fcf.stackToString(this), "\n", "\n  ");
      }
      if (a_enableSubException) {
        let errorObject = this;
        let offset      = "    ";
        while(errorObject.exception) {
          errorObject = errorObject.exception;
          let submessage = "\nSub Error: ";
          submessage += errorObject.toString(false, false, a_language);
          if (a_enableStack) {
            submessage += "\nStack: " + fcf.replaceAll("\n" + fcf.stackToString(errorObject), "\n", "\n  ");
          }
          message += fcf.replaceAll(submessage, "\n", "\n" + offset);
          offset += "    ";
        }
      }
      return message;
    }
  }



  /// @fn fcf.addException(string a_messageName, string a_messageText)
  /// @brief Performs exception registration
  /// @param string a_exceptionName - Exception name
  /// @param string a_message - Exception message in which tokenizing constructs using exception arguments can be used
  /// @example
  ///   JS code:
  ///     fcf.addException("OVER_SIZE", "Over size: @{{value}}@ > @{{size}}@")
  ///     var exception = new fcf.Exception("OVER_SIZE", {value: 10, size: 9});
  ///     console.log(exception.message);
  ///   Output:
  ///     Over size: 10 > 9
  fcf.addException = function(a_exceptionName, a_message) {
    _exceptions[a_exceptionName] = a_message;
  }

  let _exceptions = {};



  fcf.addException("INVALID_COMMAND_TOKENIZE_INTERPETER", "Invalid command during interpreter tokenization in command \"@{{command}}@\"");
  fcf.addException("ACCESS_FAILED_FIELD_TOKENIZE",        "Accessing a field on an invalid element in a command \"@{{command}}@\" ");
  fcf.addException("ERROR",                               "@{{error}}@");
  fcf.addException("RESOLVE_PATH_ERROR",                  "Failed resolve path '@{{path}}@'");
  fcf.addException("GET_PATH_INFO_ERROR",                 "It was not possible to determine the package for the path '@{{path}}@'");
  fcf.addException("GET_PATH_ERROR_INVALID_MODULE_NAME",  "Failed resolve path '@{{path}}@'. Invalid module name");
  fcf.addException("REQUEST_ERROR",                       "Request failed @{{url}}@");
  fcf.addException("HTTP_REQUEST_ERROR",                  "HTTP request failed @{{code}}@");
  fcf.addException("LOAD_MODULE",                         "Failed to load JS module @{{module}}@");
  fcf.addException("LOAD_UNITEST_MODULE",                 "Failed to load fcf-framework-unitest module. Install the missing module to perform testing: $ npm install fcf-framework-unitest");



  /// @class fcf.Context
  /// @brief Execution context information
  /// @param boolean debug - Debug mode
  /// @param string language - User language
  /// @param fcf.RouteInfo route - route information
  /// @param object session - User session information
  ///                         - Object processPair
  ///                           - object groups - User groups. The key and value are the name of the group
  ///                           - object roles - User roles. The key and value are the name of the roles
  ///                           - string user - User login.
  fcf.Context = class Context {
    constructor(a_request, a_preprocessor) {
      this.language = fcf.getConfiguration ? fcf.getConfiguration().defaultLanguage : "en";
      this.debug    = false;
      this.session  = {
        user: {
          groups: {},
          roles:  {},
          user:   "",
        }
      };
      let contextData;
      let cookie = a_request && a_request.headers && typeof a_request.headers["cookie"] === "string" ? a_request.headers["cookie"] :
                   !_isServer                                                                        ? decodeURIComponent(document.cookie) :
                                                                                                       undefined;
      if (cookie) {
        let context = cookie.split(";")
                      .map((a_item)=>{
                        a_item = fcf.trim(a_item);
                        let p = a_item.indexOf("=");
                        return [a_item.substring(0, p), a_item.substring(p+1)];
                      })
                      .find((a_item)=>{ return a_item[0] == "fcf-context"; });
        if (context) {
          contextData = context[1];
        }
      }
      if (!contextData && a_request && a_request.headers && typeof a_request.headers["fcf-context"]) {
        contextData = a_request.headers["fcf-context"];
      }
      if (!contextData && a_request && typeof a_request.context == "string") {
        contextData = a_request.context;
      }
      if (contextData) {
        try {
          let context = JSON.parse(fcf.decodeBase64(contextData));
          if (!context.session || typeof context.session !== "object") {
           context.session = {};
          }
          context.session.user = {
            groups: {},
            roles:  {},
            user:   "",
          };
          if (typeof a_preprocessor == "function") {
            a_preprocessor(context);
          }
          fcf.append(this, context);
        } catch(e) {
          console.log("Failed to read context from request");
        }
      } else if (a_request && a_request.context && typeof a_request.context == "object") {
        let context = fcf.clone(a_request.context);
        if (!context.session || typeof context.session !== "object") {
         context.session = {};
        }
        context.session.user = {
          groups: {},
          roles:  {},
          user:   "",
        };
        if (typeof a_preprocessor == "function") {
          a_preprocessor(context);
        }
        fcf.append(this, context);
      }
      if (a_request && a_request.route && typeof a_request.route.path === "string") {
        let postData = {};
        if (typeof a_request.body == "object") {
          postData = a_request.body;
        }
        this.route = new fcf.RouteInfo(a_request.originalUrl, "relative", postData);
      } else {
        this.route = new fcf.RouteInfo(
                            a_request && typeof a_request.url == "string" ? a_request.url :
                            !_isServer                                    ? window.location.href :
                                                                            undefined,
                            "relative",
                            a_request && a_request.postArgs);
      }
    }

  }



    /// @fn fcf.Context fcf.getContext()
    /// @brief Get user context
    /// @result fcf.Context - Returns the context of the user
    fcf.getContext = () => {
      if (_isServer) {
        let state = libState.getState();
        if (!state.context) {
          state.context = new fcf.Context();
          if (fcf.getConfiguration().warnEmptyContext) {
            fcf.log.wrn("FCF", "In system using empty context !!!", fcf.stackToString((new Error()).stack));
          }
          fcf.setContext(state.context);
        }
        return state.context;
      } else {
        return _state.context;
      }
    }



    /// @fn fcf.setContext(fcf.Context a_context)
    /// @brief Set user context
    /// @param fcf.Context a_context - Context for an user
    fcf.setContext = (a_context) => {
      if (_isServer) {
        let state = libState.getState();
        return libState.setState({context: a_context, state: state.state});
      } else {
        _state.context = a_context;
      }
    }



    /// @fn object fcf.getState()
    /// @brief Get execution state
    /// @result object - State of execution
    ///                   - Object properties
    ///                      - fcf.Context a_context - Context for an user
    fcf.getState = () => {
      if (_isServer){
        return libState.getState();
      } else {
        return _state;
      }
    }



    /// @fn fcf.setState(object a_state)
    /// @brief set execution state
    /// @param object a_state - State of execution
    ///                   - Object properties
    ///                      - fcf.Context a_context - Context for an user
    fcf.setState = (a_state) => {
      if (_isServer) {
        return libState.setState({context: a_state && a_state.context, state: (a_state && a_state.state) || {} });
      } else {
        _state = {context: a_state && a_state.context, state: (a_state && a_state.state) || {} };
      }
    }



  /// @fn fcf.saveContext(ExpressResponce a_request)
  /// @brief Stores the context in a cookie
  fcf.saveContext = (a_request) => {
    let context = fcf.append({}, fcf.getContext());
    delete context.route;
    delete context.args;

    if (_isServer){
      if (a_request) {
        if (typeof a_request.setCookie === "function") {
          a_request.setCookie("fcf-context",
                              fcf.encodeBase64(JSON.stringify(context)),
                              {
                                maxAge:   fcf.getConfiguration().sessionLifetime,
                                path:     "/",
                                sameSite: "Lax",
                              });
        } else if (typeof a_request.cookie === "function") {
          a_request.cookie("fcf-context",
                              fcf.encodeBase64(JSON.stringify(context)),
                              {
                                maxAge:   fcf.getConfiguration().sessionLifetime,
                                path:     "/",
                                sameSite: "Lax",
                              });
        }
      }
    } else {
      let d = new Date();
      d.setTime(d.getTime() + (365*24*60*60*1000));
      var expires = "expires="+ d.toUTCString();
      document.cookie = "fcf-context=" + fcf.encodeBase64(JSON.stringify(context)) + "; path=/ ; SameSite=Lax;" + expires;
    }
  }


  let _state = {context: new fcf.Context(), state: {}};

  /// @class fcf.EventEmitter
  /// @brief Base event source object
  class EventEmitter {
    constructor(){
      this._eventEmitterEvents = {};
    }

    /// @method on(string a_name, function a_cb)
    /// @brief Binds an event handler
    /// @param string a_name - Event name
    /// @param function a_cb - Event handler
    ///                   - Function signature: (async or simple) a_cb(mixed data)
    ///                     - mixed data Event data
    on(a_name, a_cb) {
      if (!(a_name in this._eventEmitterEvents)) {
        this._eventEmitterEvents[a_name] = {};
      }
      if (typeof a_cb._eventEmitterEvents !== "object") {
        Object.defineProperty(a_cb, "_eventEmitterEvents", { value: {}, writable: false, enumerable: false });
      }
      if (!a_cb._eventEmitterEvents[a_name]){
        a_cb._eventEmitterEvents[a_name] = {};
      }
      let id = fcf.id();
      a_cb._eventEmitterEvents[a_name][id] = 1;
      this._eventEmitterEvents[a_name][id] = a_cb;
    }



    /// @method detach(function a_cb)
    /// @method detach(string a_name, function a_cb)
    /// @brief Detach an event handler
    /// @param string a_name - Event name
    /// @param function a_cb - Event handler
    detach(a_name, a_cb) {
      if (typeof a_name == "function") {
        a_cb = a_name;
        a_name = undefined;
      }
      let eventNames = {};
      if (a_name) {
        eventNames[a_name] = 1;
      } else {
        eventNames = a_cb._eventEmitterEvents;
      }
      if (!eventNames || !a_cb._eventEmitterEvents) {
        return;
      }
      for (let eventName in eventNames) {
        if (!this._eventEmitterEvents[eventName] || !a_cb._eventEmitterEvents[eventName]) {
          continue;
        }
        for(let id in a_cb._eventEmitterEvents[eventName]) {
          delete this._eventEmitterEvents[eventName][id];
        }
      }
    }



    /// @method emit(string a_name, mixed a_data)
    /// @brief Call an event
    /// @param string a_name - Event name
    /// @param mixed a_data - Event data
    /// @result fcf.Actions - Deferred action end event object
    emit(a_name, a_data) {
      if (!(a_name in this._eventEmitterEvents)) {
        return fcf.actions();
      }
      return fcf.actions()
      .each(this._eventEmitterEvents[a_name], (a_id, a_cb)=>{
        return a_cb(a_data);
      });
    }
  };

  fcf.EventEmitter = EventEmitter;



  /// @class fcf.Logger
  /// @extends fcf.EventEmitter
  /// @brief Logger class
  ///
  /// @event "message_after" of fcf.EventEmitter - Event of message output to the logger.  Called after output
  ///                      - Event properties:
  ///                         - integer level     - Log level
  ///                         - string module     - Module - message source
  ///                         - string output     - output message with prefixes
  ///                         - string message    - output message without prefixes
  ///                         - [mixed] args      - Arguments passed to the logger for output
  ///                         - fcf.Logger logger - Self pointer
  ///                      - Example:
  ///                         fcf.log.on("message_after", (a_info)=>{
  ///                           ...
  ///                         });
  /// @event "message_before" of fcf.EventEmitter - Event of message output to the logger. Called before output and call of logger handlers
  ///                      - Event properties:
  ///                         - integer level     - Log level
  ///                         - string module     - Module - message source
  ///                         - string output     - output message with prefixes
  ///                         - string message    - output message without prefixes
  ///                         - [mixed] args      - Arguments passed to the logger for output
  ///                         - fcf.Logger logger - Self pointer
  ///                      - Example:
  ///                         fcf.log.on("message_before", (a_info)=>{
  ///                           ...
  ///                         });
  class Logger extends fcf.EventEmitter {

    /// @fn constructor()
    /// @fn constructor(object|fcf.Configuration a_configuration)
    /// @param object|fcf.Configuration a_configuration - Configuration object.
    ///                                                   See the getConfiguration() description for available configuration options.
    constructor(a_configuration){
      super();
      a_configuration   = a_configuration || {};
      this._configuration = new fcf.Configuration();
      this._configuration.append({
        logLevel:     Logger.LOG,
        logFile:      undefined,
        logLifeTime:  10,
        logHandlers:  [
                        "fcf.Logger.timeHandler",
                        "fcf.Logger.spaceServerHandler",
                        "fcf.Logger.pidHandler",
                        "fcf.Logger.spaceHandler",
                        "fcf.Logger.levelHandler",
                        "fcf.Logger.spaceHandler",
                        "fcf.Logger.modHandler",
                        "fcf.Logger.colonHandler",
                        "fcf.Logger.messageHandler",
                        "fcf.Logger.consoleHandler",
                        "fcf.Logger.fileHandler"
                      ],
      });
      this._configuration.append(a_configuration);
    }



    /// @fn fcf.Configuration getConfiguration()
    /// @brief Returns a configuration object to manage the object
    /// @result object|fcf.Configuration - Configuration object
    ///                                         - Settings:
    ///                                             - integer|string logLevel = fcf.Logger.LOG - Logging level
    ///                                                  - fcf.Logger.TST|0|"tst"|"test"     - Test level
    ///                                                  - fcf.Logger.CRH|10|"crh"|"crash"   - Crash level
    ///                                                  - fcf.Logger.ERR|20|"err"|"error"   - Error level
    ///                                                  - fcf.Logger.WRN|30|"wrn"|"warning" - Warning level
    ///                                                  - fcf.Logger.INF|40|"inf"|"info"    - Info level
    ///                                                  - fcf.Logger.LOG|50|"log"           - Default level
    ///                                                  - fcf.Logger.DBG|60|"dbg"|"debug"   - Debug level
    ///                                                  - fcf.Logger.TRC|70|"trc"|"trace"   - Trace level
    ///                                             - string logFile - (Server only) - Log file path prefix. If the parameter is not set, the output to the file is not performed.
    ///                                                                     - Example:
    ///                                                                         logFile value: "log/log-"
    ///                                                                         real log of the file name: "log/log-2023-01-27.log"
    ///                                             - number logMaxFileSize = 1 - Maximum log file size in megabytes
    ///                                             - number logLifeTime = 10 - (Server only) - The time that the log file is kept in days
    ///                                             - [string|function] logHandlers - Array with function names or logger handler functions themselves
    ///                                                                               To output the log to the console and to the file, the next
    ///                                                                               call of handlers is used, to generate a message
    ///                                                                               By default, the parameter has the following meaning:
    ///                                                                                  -  [
    ///                                                                                  -    "fcf.Logger.timeHandler",         // - Adds the current time
    ///                                                                                  -    "fcf.Logger.spaceServerHandler",  // - Adds a space, but only on the server side
    ///                                                                                  -    "fcf.Logger.pidHandler",          // - Adds the PID of the process, but only on the server side
    ///                                                                                  -    "fcf.Logger.spaceHandler",        // - Adds a space
    ///                                                                                  -    "fcf.Logger.levelHandler",        // - Adds a logging level to a message
    ///                                                                                  -    "fcf.Logger.spaceHandler",        // - Adds a space
    ///                                                                                  -    "fcf.Logger.modHandler",          // - Adds the name of the module for which the logger was called
    ///                                                                                  -    "fcf.Logger.colonHandler",        // - Adds a colon
    ///                                                                                  -    "fcf.Logger.messageHandler",      // - Appends the message passed as arguments
    ///                                                                                  -    "fcf.Logger.consoleHandler",      // - Prints a message to the console
    ///                                                                                  -    "fcf.Logger.fileHandler"          // - Outputs a message to a file, but only on the server side
    ///                                                                                  -  ]
    ///                                                                               The logger handler can be asynchronous, but in this case it is required that the handler
    ///                                                                               be executed after all the main handlers, so as not to break the sequence of output to the log.
    ///                                                                               Logger handler functions have the following signature:
    ///                                                                                  - (async or simple) handler(object a_info)
    ///                                                                                       - object a_info - Information object
    ///                                                                                          - Object properties:
    ///                                                                                             - integer level     - Log level
    ///                                                                                             - string module     - Module - message source
    ///                                                                                             - string output     - output message with prefixes (Filled in by handlers)
    ///                                                                                             - string message    - output message without prefixes (Filled in by fcf.Logger.messageHandler)
    ///                                                                                             - [mixed] args      - Arguments passed to the logger for output
    ///                                                                                             - fcf.Logger logger - Self pointer
    ///                                                                                             - boolean break     - If true, then further execution of handlers is interrupted
    /// @example Get value
    ///   JS code:
    ///     console.log(fcf.log.getConfiguration().logLevel)
    ///   Std output:
    ///     40
    ///
    /// @example Set value
    ///   JS code:
    ///     fcf.log.getConfiguration().append({
    ///       logFile: "log/log-"
    ///     });
    getConfiguration(){
      return this._configuration;
    }

    /// @method fcf.Actions fcf.Logger.tst(string a_module, string a_arg1, string arg2, ...)
    /// @brief Performs test level logging
    /// @param string a_module - The name of the module from which logging is performed
    /// @param mixed a_arg1, a_arg2, ... - Arguments for inference
    /// @param fcf.Actions - The object of the output completion deferred action.
    tst(a_module, a_str) {
      return this._log(Logger.TST, arguments);
    }

    /// @method fcf.Actions fcf.Logger.crh(string a_module, string a_arg1, string arg2, ...)
    /// @brief Performs crash level logging
    /// @param string a_module - The name of the module from which logging is performed
    /// @param mixed a_arg1, a_arg2, ... - Arguments for inference
    /// @param fcf.Actions - The object of the output completion deferred action.
    crh(a_module, a_str) {
      return this._log(Logger.CRH, arguments);
    }

    /// @method fcf.Actions fcf.Logger.err(string a_module, string a_arg1, string arg2, ...)
    /// @brief Performs error level logging
    /// @param string a_module - The name of the module from which logging is performed
    /// @param mixed a_arg1, a_arg2, ... - Arguments for inference
    /// @param fcf.Actions - The object of the output completion deferred action.
    err(a_module, a_str) {
      return this._log(Logger.ERR, arguments);
    }

    /// @method fcf.Actions fcf.Logger.wrn(string a_module, string a_arg1, string arg2, ...)
    /// @brief Performs warning level logging
    /// @param string a_module - The name of the module from which logging is performed
    /// @param mixed a_arg1, a_arg2, ... - Arguments for inference
    /// @param fcf.Actions - The object of the output completion deferred action.
    wrn(a_module, a_str) {
      return this._log(Logger.WRN, arguments);
    }

    /// @method fcf.Actions fcf.Logger.log(string a_module, string a_arg1, string arg2, ...)
    /// @brief Performs default level logging
    /// @param string a_module - The name of the module from which logging is performed
    /// @param mixed a_arg1, a_arg2, ... - Arguments for inference
    /// @param fcf.Actions - The object of the output completion deferred action.
    log(a_module, a_str) {
      return this._log(Logger.LOG, arguments);
    }

    /// @method fcf.Actions fcf.Logger.inf(string a_module, string a_arg1, string arg2, ...)
    /// @brief Performs info level logging
    /// @param string a_module - The name of the module from which logging is performed
    /// @param mixed a_arg1, a_arg2, ... - Arguments for inference
    /// @param fcf.Actions - The object of the output completion deferred action.
    inf(a_module, a_str) {
      return this._log(Logger.INF, arguments);
    }

    /// @method fcf.Actions fcf.Logger.dbg(string a_module, string a_arg1, string arg2, ...)
    /// @brief Performs debug level logging
    /// @param string a_module - The name of the module from which logging is performed
    /// @param mixed a_arg1, a_arg2, ... - Arguments for inference
    /// @param fcf.Actions - The object of the output completion deferred action.
    dbg(a_module, a_str) {
      return this._log(Logger.DBG, arguments);
    }

    /// @method fcf.Actions fcf.Logger.trc(string a_module, string a_arg1, string arg2, ...)
    /// @brief Performs trace level logging
    /// @param string a_module - The name of the module from which logging is performed
    /// @param mixed a_arg1, a_arg2, ... - Arguments for inference
    /// @param fcf.Actions - The object of the output completion deferred action.
    trc() {
      return this._log(Logger.TRC, arguments);
    }

    _log(a_level, a_arguments) {
      let level = this._configuration.logLevel;
      if (isNaN(level)) {
        level =  level == "tst" || level == "test"    ? Logger.TST :
                 level == "crh" || level == "crash"   ? Logger.CRH :
                 level == "err" || level == "error"   ? Logger.ERR :
                 level == "wrn" || level == "warning" ? Logger.WRN :
                 level == "inf" || level == "info"    ? Logger.INF :
                 level == "dbg" || level == "debug"   ? Logger.DBG :
                 level == "trc" || level == "trace"   ? Logger.TRC :
                                                        Logger.LOG;
      } else {
        level = parseFloat(level);
      }
      if (a_level > level)
        return fcf.actions();
      let info = {
        level:    a_level,
        module:   a_arguments[0],
        output:   "",
        message:  "",
        args:     fcf.append([], a_arguments).slice(1),
        logger:   this,
        break:    false,
      };
      return fcf.actions()
      .then(()=>{
        return this.emit("message_before", info);
      })
      .each(this._configuration.logHandlers, (a_key, a_handler)=>{
        if (info.break)
          return;
        let func = typeof a_handler == "string"   ? fcf.resolve(_isServer ? global : window, a_handler) :
                   typeof a_handler == "function" ? a_handler :
                                                    false;
        if (typeof func !== "function")
          return;
        return func(info);
      })
      .then(()=>{
        return this.emit("message_after", info);
      });
    }
  }
  fcf.Logger = Logger;

  // @const integer fcf.Logger.TST = 0
  // @brief Test level logging
  Logger.TST  = 0;

  // @const integer fcf.Logger.CRH  = 10
  // @brief Crash level logging
  Logger.CRH  = 10;

  // @const integer fcf.Logger.ERR  = 20
  // @brief Error level logging
  Logger.ERR  = 20;

  // @const integer fcf.Logger.WRN  = 30
  // @brief Warning level logging
  Logger.WRN  = 30;

  // @const integer fcf.Logger.INF  = 40
  // @brief Info level logging
  Logger.INF  = 40;

  // @const integer fcf.Logger.LOG  = 50
  // @brief Default level logging
  Logger.LOG  = 50;

  // @const integer fcf.Logger.DBG  = 60
  // @brief Debug level logging
  Logger.DBG  = 60;

  // @const integer fcf.Logger.TRC  = 70
  // @brief Trace level logging
  Logger.TRC  = 70;



  /// @class fcf.Logger.Offset
  /// @brief A class object can be passed as an argument to the
  ///        logger to indicate that all newlines will be indented and prefixed.
  class LoggerOffset {
   /// @method constructor(integer a_offset)
   /// @method constructor(integer a_offset, string a_linePrefix)
   /// @params integer a_offset - New line indent size
   /// @params string a_linePrefix - New line prefix
   constructor(a_offset, a_linePrefix) {
     this.offset = !isNaN(a_offset) ? parseInt(a_offset) : 0;
     this.prefix = a_linePrefix;
   }
  };
  Logger.Offset = LoggerOffset;



  /// @fn fcf.Logger.Offset fcf.Logger.offset(integer a_offset)
  /// @fn fcf.Logger.Offset fcf.Logger.offset(integer a_offset, string a_linePrefix)
  /// @brief Returns a new fcf.Logger.Offset object
  /// @details A class object can be passed as an argument to the
  ///          logger to indicate that all newlines will be indented and prefixed.
  /// @params integer a_offset - New line indent size
  /// @params string a_linePrefix - New line prefix
  /// @result fcf.Logger.Offset - a new fcf.Logger.Offset object
  Logger.offset = (a_offset, a_linePrefix) => {
    return new LoggerOffset(a_offset, a_linePrefix);
  }



  /// @fn fcf.Logger.spaceHandler(object a_info)
  /// @brief Logger output handler. Adds a space
  /// @param object a_info - Information about the output of the logger, see the description of the fcf.Logger constructor (logHandlers settings property)
  fcf.Logger.spaceHandler = (a_info)=>{
    a_info.output += " ";
  }

  /// @fn fcf.Logger.spaceServerHandler(object a_info)
  /// @brief Logger output handler. Adds a space, but only on the server side
  /// @param object a_info - Information about the output of the logger, see the description of the fcf.Logger constructor (logHandlers settings property)
  fcf.Logger.spaceServerHandler = (a_info)=>{
    if (!_isServer)
      return;
    a_info.output += " ";
  }

  /// @fn fcf.Logger.timeHandler(object a_info)
  /// @brief Logger output handler. Adds the current time
  /// @param object a_info - Information about the output of the logger, see the description of the fcf.Logger constructor (logHandlers settings property)
  fcf.Logger.timeHandler = (a_info)=>{
    a_info.output += fcf.formatDate(new Date(), "Y-m-d H:i:s.v");
  }

  /// @fn fcf.Logger.pidHandler(object a_info)
  /// @brief Logger output handler. Adds the PID of the process, but only on the server side
  /// @param object a_info - Information about the output of the logger, see the description of the fcf.Logger constructor (logHandlers settings property)
  fcf.Logger.pidHandler = (a_info)=>{
    if (!_isServer)
      return;
    a_info.output +="[PID:" + process.pid + "]";
  }

  /// @fn fcf.Logger.levelHandler(object a_info)
  /// @brief Logger output handler. Adds a logging level to a message
  /// @param object a_info - Information about the output of the logger, see the description of the fcf.Logger constructor (logHandlers settings property)
  fcf.Logger.levelHandler = (a_info)=>{
    let level =  a_info.level <= Logger.TST ? "TST" :
                 a_info.level <= Logger.CRH ? "CRH" :
                 a_info.level <= Logger.ERR ? "ERR" :
                 a_info.level <= Logger.WRN ? "WRN" :
                 a_info.level <= Logger.INF ? "INF" :
                 a_info.level <= Logger.LOG ? "LOG" :
                 a_info.level <= Logger.DBG ? "DBG" :
                                              "TRC";
    a_info.output += "[" + level + "]";
  }

  /// @fn fcf.Logger.modHandler(object a_info)
  /// @brief Logger output handler. Adds the name of the module for which the logger was called
  /// @param object a_info - Information about the output of the logger, see the description of the fcf.Logger constructor (logHandlers settings property)
  fcf.Logger.modHandler = (a_info)=>{
    a_info.output += "[MOD:" + a_info.module + "]";
  }

  /// @fn fcf.Logger.colonHandler(object a_info)
  /// @brief Logger output handler. Adds a colon
  /// @param object a_info - Information about the output of the logger, see the description of the fcf.Logger constructor (logHandlers settings property)
  fcf.Logger.colonHandler = (a_info)=>{
    a_info.output += ":  ";
  }

  /// @fn fcf.Logger.messageHandler(object a_info)
  /// @brief Logger output handler. Appends the message passed as arguments
  /// @param object a_info - Information about the output of the logger, see the description of the fcf.Logger constructor (logHandlers settings property)
  fcf.Logger.messageHandler = (a_info)=>{
    let offset = '';
    let prefix = "";
    let array  = [];
    function putString(a_str) {
      if (offset && typeof a_str == "string") {
        a_str = fcf.replaceAll(a_str, "\n", "\n" + offset + prefix);
      }
      array.push(a_str);
    }
    for(var i = 0; i < a_info.args.length; ++i) {
      if (a_info.args[i] instanceof fcf.Logger.Offset) {
        prefix = a_info.args[i].prefix || prefix;
        offset += fcf.pad("", a_info.args[i].offset, " ", "c");
      } else if (typeof a_info.args[i] == "object"){
        if (a_info.args[i] instanceof fcf.Exception){
          putString(a_info.args[i].toString(true, true, true));
        } else if (a_info.args[i] instanceof Error) {
          const errorInfo = fcf.parseError(a_info.args[i]);
          putString(errorInfo.fullMessage);
          putString("\nStack:");
          putString(fcf.replaceAll("\n" + errorInfo.stack, "\n", "\n    "));
        } else {
          putString(_objectToString(a_info.args[i]));
        }
      } else {
        putString(a_info.args[i]);
      }
    }
    a_info.message = array.join(" ");
    a_info.output += a_info.message;
  }

  function _objectToString(a_object, a_offset, a_path){
    const offsetInc = 2;
    const skey = "d031d461ddb4a4241b0428a137da400b";
    if (!a_offset)
      a_offset = 0;
    if (!a_path)
      a_path = "";
    if (typeof a_object !== "object" || a_object === null || a_object instanceof Date) {
      return JSON.stringify(a_object);
    } else if (Array.isArray(a_object)) {
      if (a_object[skey]){
        return `[Recursive Object: ${a_object[skey]}]`;
      }
      a_object[skey] = a_path;
      let result = "[";
      for(let i = 0; i < a_object.length; ++i) {
        if (i) {
          result += ",";
        }
        result += "\n";
        result += fcf.pad("", a_offset + offsetInc, " ");
        result += _objectToString(a_object[i], a_offset + offsetInc, `${a_path}[${i}]`);
      }
      if (a_object.length) {
        result += "\n";
        result += fcf.pad("", a_offset, " ")
      }
      result += "]";
      delete a_object[skey];
      return result;
    } else {
      if (a_object[skey]) {
        return `[Recursive link: ${a_object[skey]}]`;
      }
      a_object[skey] = a_path;
      let empty = true;
      let result = "{";
      fcf.each(a_object, (a_key, a_value) => {
        if (a_key == skey)
          return;
        if (!empty) {
          result += ",";
        }
        result += "\n";
        result += fcf.pad("", a_offset + offsetInc, " ");
        result += JSON.stringify(a_key);
        result += " : ";
        result += _objectToString(a_value, a_offset + offsetInc, `${a_path}[${JSON.stringify(a_key)}]`);
        empty = false;
      });
      if (!empty) {
        result += "\n";
        result += fcf.pad("", a_offset, " ")
      }
      result += "}";
      delete a_object[skey];
      return result;
    }
  }


  /// @fn fcf.Logger.consoleHandler(object a_info)
  /// @brief Logger output handler. Prints a message to the console
  /// @param object a_info - Information about the output of the logger, see the description of the fcf.Logger constructor (logHandlers settings property)
  fcf.Logger.consoleHandler = (a_info)=>{
    if (!_selfLoggerCall) {
      _selfLoggerCall = true;
        console.log.call(console, a_info.output);
      _selfLoggerCall = false;
    }
  }
  let _selfLoggerCall = false;

  /// @fn fcf.Logger.fileHandler(object a_info)
  /// @brief Logger output handler. Outputs a message to a file, but only on the server side
  /// @param object a_info - Information about the output of the logger, see the description of the fcf.Logger constructor
  fcf.Logger.fileHandler = (a_info)=>{
    if (!_isServer)
      return;
    return libLogger.fileHandler(a_info);
  }



  /// @fn fcf.test(string a_part, string a_group, string a_name, function a_cbtest)
  /// @fn fcf.test(string a_group, string a_name, function a_cbtest)
  /// @fn fcf.test(string a_name, function a_cbtest)
  /// @brief Declares Uni test. On the client side, automatically loads the fcf-framework-unitest package only if the URL parameter ___fcf_unitest is declared
  /// @param string a_part = "default" - Part of the test
  /// @param string a_group = "default" - Group of the test
  /// @param string a_name - Test name
  /// @param function a_cbtest - Test function
  ///                            function signature:
  ///                              a_cbtest(fcf.NUnitest.Unitest a_unitest)
  ///                                 - fcf.NUnitest.Unitest a_unitest -  Uni test object from package fcf-framework-unitest:unitest.js
  fcf.test = function(a_part, a_group, a_name, a_cbtest){
    let currentArguments = arguments;
    let loadModule = false;
    return fcf.actions()
    .catch((a_error)=>{
      if (!loadModule) {
        return new fcf.Exception("LOAD_UNITEST_MODULE", a_error);
      }
    })
    .catch((a_error)=>{
      fcf.log.err("unitest", a_error);
    })
    .then(()=>{
      if (!_isServer) {
        if (!("___fcf_unitest" in fcf.getContext().route.args)){
          return;
        }
      }
      return fcf.require("fcf-framework-unitest", {quiet: true});
    })
    .then((a_modules) => {
      if (!fcf.NUnitest || !fcf.NUnitest.unitest) {
        if (!a_modules) {
          return;
        }
        throw new fcf.Exception("LOAD_MODULE", {module: "fcf-framework-unitest"});
      }
      loadModule = true;
      fcf.NUnitest.unitest.add.apply(fcf.NUnitest.unitest, currentArguments);
    });
  }



  /// @class fcf.Configuration
  /// @extends fcf.EventEmitter
  /// @brief Configuration class
  /// @details Stores configuration properties as fields of an object and allows you to
  ///          perform custom data merge types for multiple configuration sources using the "merge" configuration option.
  ///          In the configuration, you can store different formats and structures of fields
  ///          with the ability to supplement them from third-party modules.
  ///
  fcf.Configuration = class Configuration extends EventEmitter {
    /// @property boolean   warnEmptyContext = false - If set to true, then on the server side,
    ///                                              if an empty context is used, a warning message is displayed in the log.
    /// @property string    defaultLanguage = "en" - Default language
    /// @property object    aliases = {} - An object that stores path aliases (the key is the alias and the value is its real path).
    ///                                 Aliases can be used as the initial part of the resource path address.
    ///                                 When using an alias, the @ symbol is used at the beginning of the path. Example: fcf.getPath("@controls:button")
    /// @property [object|string] translations = [] - An array with information about translations.
    ///                                               - If the array element is an object, then it should look like this:
    ///                                                   - string language - Translation language
    ///                                                   - object translations - Translations. The key is the original string,
    ///                                                                           and the value is the translation for the language specified in the language property
    ///                                                 - Example:
    ///                                                   - {
    ///                                                   -   "language": "ja",
    ///                                                   -   "translations": {
    ///                                                   -     "hello": "こんにちは"
    ///                                                   -   }
    ///                                                   - }
    ///                                               - If the array element is a string, then the string must
    ///                                                 contain the path to the JSON file with the structure similar to the object containing the translation
    /// @property object    tokenize = {/*see fcf-framework-core:serverConfig.js file*/} - An object describing the list of available objects and functions in the server-side
    ///                                                                                 tokenizer used in the fcf.tokenize, fcf.pattern and fcf.inlineExecution functions.
    ///                                                - Object structure:
    ///                                                   - object objects - Object of global objects whose data is available in the tokenizer on the server side.
    ///                                                                      The key is the path to the variable available from the tokenizer,
    ///                                                                      and the value is the path to the global variable whose data will be used
    ///                                                                       - Example:
    ///                                                                         - tokenize: {
    ///                                                                         -   objects: {
    ///                                                                         -     "Date": "Date",
    ///                                                                         -   }
    ///                                                                         - }
    ///                                                   - [object] functions - An array with objects describing the functions that are allowed to be called in the tokenizer on the server side
    ///                                                                     - Subobject structure:
    ///                                                                         - string object - The object on which the function call is allowed.
    ///                                                                                           An empty string corresponds to a global object. The string "*" matches any object
    ///                                                                         - string class  - If the property is set, then the function call is allowed only on objects
    ///                                                                                           with the class specified in the property or inherited from it
    ///                                                                         - [string] allow - An array with the names of functions for which calls are allowed.
    ///                                                                                            If the nested string is equal to "*", then it is allowed to call any function
    ///                                                                                            that satisfies the conditions object and class
    ///                                                                     - Example to call getDate method on all Date objects:
    ///                                                                         - {
    ///                                                                         -   functions: {
    ///                                                                         -     object: "*",
    ///                                                                         -     class:  "Date",
    ///                                                                         -     allow: ["getDate"],
    ///                                                                         -   },
    ///                                                                         - }
    ///                                                                     - Example to call isArray method on Array object:
    ///                                                                         - {
    ///                                                                         -   functions: {
    ///                                                                         -     object: "Array",
    ///                                                                         -     allow: ["isArray"],
    ///                                                                         -   },
    ///                                                                         - }
    ///                                                                     - Example to call parseFloat global function:
    ///                                                                         - {
    ///                                                                         -   functions: {
    ///                                                                         -     object: "",
    ///                                                                         -     allow: ["parseFloat"],
    ///                                                                         -   },
    ///                                                                         - }
    ///                                                                     - Example to call all methods on RegExp object:
    ///                                                                         - {
    ///                                                                         -   objects: {
    ///                                                                         -     "RegExp": "RegExp" // Allowing access to an RegExp object
    ///                                                                         -   }
    ///                                                                         -   functions: {
    ///                                                                         -     object: "RegExp",
    ///                                                                         -     allow: ["*"],
    ///                                                                         -   },
    ///                                                                         - }
    /// @property [string] moduleDirectories = ["MAIN_SCRIPT_DIRECTORY/node_modules"] - Directories where NODEJS packages are searched
    /// @property string webModuleDirectory = "/node_modules" - The section of the URL from which the package files are loaded by default on the side of the WEB browser
    /// @property object sources - An object that describes source files for loading JS modules on the client and server side
    ///                             - The key is the package name. If the key is an empty string, then these are files from the application root
    ///                             - The value is a module loading rule object
    ///                                 - Object properties:
    ///                                     - string webMain = "index.js" - The main JS file of the package, which will be loaded by
    ///                                                                     the package name by the fcf.require function on the browser side
    ///                                     - string webFilePath = {"*": "@{{path}}@"} - An object describing the rules for compiling paths to the downloaded file on the browser side
    ///                                                                           - Key - Extension. If the key has the value "*", then this definition is used for all extensions.
    ///                                                                           - Value - Tokenized string containing the path to the file on the browser side for all file in the module
    ///                                                                           - The following variables are available in the tokenizer:
    ///                                                                             - string path - Relative path in a package to a file
    ///                                                                             - string directory - File directory
    ///                                                                             - string shortName - Short filename without extension
    ///                                                                             - string name - File name
    ///                                                                             - string extension - File extension
    ///                                                                           - This parameter allows you to generate the final path to the file.
    ///                                                                             For example, to load the debug version if debug mode is enabled:
    ///                                                                             - sources: {
    ///                                                                             -   "PACKAGE_NAME": {
    ///                                                                                   webFilePath: {
    ///                                                                                     js: "@{{directory}}@/@{{shortName}}@@{{!fcf.getContext().debug && name.indexOf(\".min.\") == -1 ? \".min\" : \"\"}}@.@{{extension}}@"
    ///                                                                                   }
    ///                                                                             -   }
    ///                                                                             - }
    ///                                     - string serverFilePath = {"*": "@{{path}}@"} - An object describing the rules for compiling paths to the downloaded file on the server side
    ///                                                                           - Key - Extension. If the key has the value "*", then this definition is used for all extensions.
    ///                                                                           - Value - Tokenized string containing the path to the file on the browser side for all file in the module
    ///                                                                           - The following variables are available in the tokenizer:
    ///                                                                             - string path - Relative path in a package to a file
    ///                                                                             - string directory - File directory
    ///                                                                             - string shortName - Short filename without extension
    ///                                                                             - string name - File name
    ///                                                                             - string extension - File extension
    ///                                                                           - This parameter allows you to generate the final path to the file.
    ///                                                                             For example, to load the debug version if debug mode is enabled:
    ///                                                                             - sources: {
    ///                                                                             -   "PACKAGE_NAME": {
    ///                                                                                   serverFilePath: {
    ///                                                                                     js: "@{{directory}}@/@{{shortName}}@@{{!fcf.getContext().debug && name.indexOf(\".min.\") == -1 ? \".min\" : \"\"}}@.@{{extension}}@"
    ///                                                                                   }
    ///                                                                             -   }
    ///                                                                             - }
    ///                                     - string filePath = {"*": "@{{path}}@"} - An object describing the rules for compiling paths to the downloaded file
    ///                                                                           - Key - Extension. If the key has the value "*", then this definition is used for all extensions.
    ///                                                                           - Value - Tokenized string containing the path to the file on the browser side for all file in the module
    ///                                                                           - The following variables are available in the tokenizer:
    ///                                                                             - string path - Relative path in a package to a file
    ///                                                                             - string directory - File directory
    ///                                                                             - string shortName - Short filename without extension
    ///                                                                             - string name - File name
    ///                                                                             - string extension - File extension
    ///                                                                           - This parameter allows you to generate the final path to the file.
    ///                                                                             For example, to load the debug version if debug mode is enabled:
    ///                                                                             - sources: {
    ///                                                                             -   "PACKAGE_NAME": {
    ///                                                                                   filePath: {
    ///                                                                                     js: "@{{directory}}@/@{{shortName}}@@{{!fcf.getContext().debug && name.indexOf(\".min.\") == -1 ? \".min\" : \"\"}}@.@{{extension}}@"
    ///                                                                                   }
    ///                                                                             -   }
    ///                                                                             - }
    ///                                     - string webPackagePath = fcf.getConfiguration().webModuleDirectory + "/" + MODULE_NAME - URI path to module directory on browser side
    ///                                     - object serverFiles - Object for describing the rules for downloading individual files on the server side
    ///                                                           - The key is the relative path to the file from the package directory.
    ///                                                           - The value is the object of the description of the loading rules
    ///                                                             - Object properties:
    ///                                                               - string filePath - Tokenized string containing the path to the file on the browser side for all file in the module
    ///                                                                                    - Overrides the package's webFilePath value for a specific file
    ///                                                                                    - The following variables are available in the tokenizer:
    ///                                                                                       - string path - Full path to the file
    ///                                                                                       - string directory - The file directory
    ///                                                                                       - string shortName - Short filename without extension
    ///                                                                                       - string name - File name
    ///                                                                                       - string extension - File extension
    ///                                                               - string result - A string containing the path to a variable that contains the result of the JS module.
    ///                                                                                 This parameter is used to load modules declared without using the fcf.module function.
    ///                                     - object webFiles - Object for describing the rules for downloading individual files on the browser side
    ///                                                           - The key is the relative path to the file from the package directory.
    ///                                                           - The value is the object of the description of the loading rules
    ///                                                             - Object properties:
    ///                                                               - string filePath - Tokenized string containing the path to the file on the browser side for all file in the module
    ///                                                                                    - Overrides the package's webFilePath value for a specific file
    ///                                                                                    - The following variables are available in the tokenizer:
    ///                                                                                       - string path - Full path to the file
    ///                                                                                       - string directory - The file directory
    ///                                                                                       - string shortName - Short filename without extension
    ///                                                                                       - string name - File name
    ///                                                                                       - string extension - File extension
    ///                                                               - string result - A string containing the path to a variable that contains the result of the JS module.
    ///                                                                                 This parameter is used to load modules declared without using the fcf.module function.
    ///                                                               - string loadState - If the parameter is defined, then when the JS model is loaded for the first time,
    ///                                                                                    the condition is first defined in the tokenized string, and if the result of the calculated string
    ///                                                                                    returns true, then the module is considered already loaded and the result indicated by the result
    ///                                                                                    parameter will be returned. This method allows you to load JS modules not declared by
    ///                                                                                    the fcf.module function together, using the script tag and the fcf.require method
    ///                                                                                    (That is, to avoid double loading the module)
    ///                                                                                    - Example:
    ///                                                                                       - fcf.getConfiguration().append({
    ///                                                                                       -   sources: {
    ///                                                                                       -     "jquery": {
    ///                                                                                       -       webMain: "jquery.js",
    ///                                                                                       -       webFilePath: {
    ///                                                                                       -         js: "@{{directory}}@/@{{shortName}}@@{{!fcf.getContext().debug && name.indexOf(\".min.\") == -1 ? \".min\" : \"\"}}@.@{{extension}}@"
    ///                                                                                       -       },
    ///                                                                                       -       webFiles: {
    ///                                                                                       -         "jquery.js": {
    ///                                                                                       -           result:   "jQuery",
    ///                                                                                       -           loadState "@{{!!window.jQuery}}@",
    ///                                                                                       -         }
    ///                                                                                       -       }
    ///                                                                                       -     },
    ///                                                                                       -   }
    ///                                                                                       -  });
    ///                                     - object files - Object for describing the rules for loading individual files on the server side and browser side
    ///                                                           - The key is the relative path to the file from the module directory
    ///                                                           - The value is the object of the description of the loading rules
    ///                                                             - Object properties:
    ///                                                               - string filePath - Tokenized string containing the path to the file on the browser side for a file in a module
    ///                                                                                    - The following variables are available in the tokenizer:
    ///                                                                                       - string path - Full path to the file
    ///                                                                                       - string directory - The file directory
    ///                                                                                       - string shortName - Short filename without extension
    ///                                                                                       - string name - File name
    ///                                                                                       - string extension - File extension
    ///                                                               - string result - A string containing the path to a global variable that contains the result of the JS module.
    ///                                                                                 This parameter is used to load modules declared without using the fcf.module function.
    ///                                                               - string loadState - If the parameter is defined, then when the JS model is loaded for the first time,
    ///                                                                                    the condition is first defined in the tokenized string, and if the result of the calculated string
    ///                                                                                    returns true, then the module is considered already loaded and the result indicated by the result
    ///                                                                                    parameter will be returned. This method allows you to load JS modules not declared by
    ///                                                                                    the fcf.module function together, using the script tag and the fcf.require method
    ///                                                                                    (That is, to avoid double loading the module)
    ///                                                                                    - Example:
    ///                                                                                       - fcf.getConfiguration().append({
    ///                                                                                       -   sources: {
    ///                                                                                       -     "jquery": {
    ///                                                                                       -       webMain: "jquery.js",
    ///                                                                                       -       webFilePath: {
    ///                                                                                       -         js: "@{{directory}}@/@{{shortName}}@@{{!fcf.getContext().debug && name.indexOf(\".min.\") == -1 ? \".min\" : \"\"}}@.@{{extension}}@"
    ///                                                                                       -       },
    ///                                                                                       -       files: {
    ///                                                                                       -         "jquery.js": {
    ///                                                                                       -           result:   "jQuery",
    ///                                                                                       -           loadState "@{{!!window.jQuery}}@",
    ///                                                                                       -         }
    ///                                                                                       -       }
    ///                                                                                       -     },
    ///                                                                                       -   }
    ///                                                                                       -  });
    ///                             - Example:
    ///                               - fcf.getConfiguration().append({
    ///                               -   webModuleDirectory: ":base-tests/node_modules",
    ///                               -   sources: {
    ///                               -     "modules_test1": {
    ///                               -       webPackagePath:  "/exmodules/modules_test1",
    ///                               -     },
    ///                               -     "modules_test2": {
    ///                               -       webMain:     "main.js"
    ///                               -     },
    ///                               -     "": {
    ///                               -       files: {
    ///                               -         "base-tests/simple1.js": { result: "SimpleTest1.value", loadState: "@{{!!SimpleTest1.value}}@" },
    ///                               -       },
    ///                               -     }
    ///                               -   }
    ///                               - });
    ///                               -
    /// @property object merge - An object that describes the rules for merging configuration properties from different configuration sources
    ///                           - The key is the string path of the configuration parameter (name)
    ///                           - The value is either a string containing the path to the global function that performs the merge, or an object with the following structure
    ///                               - Object properties:
    ///                                   - string function - Path to the function that performs the parameter merge
    ///                                   - string file - The path to the file in FCF notation that stores the merge function.
    ///                                                   This file will be loaded automatically if the function specified in the "function" parameter is not found.
    ///                           - If the merge function is not defined for the configuration parameter, then the merge replaces it
    ///                           - The merge function must have the following signature:
    ///                                 - mixed function(mixed a_originValue, mixed a_newValue)
    ///                                   - mixed a_originValue - Copy of current configuration parameter data
    ///                                   - mixed a_newValue - New configuration parameter data
    ///                                   - The function should return an object with concatenated data.
    ///                           - Example:
    ///                             - fcf.getConfiguration().append({
    ///                             -   merge: {
    ///                             -     "container": "fcf.append",
    ///                             -     "container.array2": "fcf.append",
    ///                             -   },
    ///                             -   container: {
    ///                             -     array1: [1],
    ///                             -     array2: [1],
    ///                             -   }
    ///                             - });
    ///                             - fcf.getConfiguration().append({
    ///                             -   container: {
    ///                             -     array1: [2],
    ///                             -     array2: [2],
    ///                             -     array3: [2],
    ///                             -   }
    ///                             - });
    ///                             - console.log(fcf.getConfiguration().container);
    ///                           - Output:
    ///                             - { array1: [ 2 ], array2: [ 1, 2 ], array3: [ 2 ] };
    constructor(a_options) {
      super();
      this._config            = [[], [], []];
      this._config[0].push({
        merge: {
          "merge": "fcf.append",
        },
      });
      if (a_options && a_options.enableDefaultParams) {
        const compressFilePath  = "@{{directory}}@/@{{shortName}}@@{{!fcf.getContext().debug && name.indexOf(\".min.\") == -1 ? \".min\" : \"\"}}@.@{{extension}}@";
        this._config[0].push({
          warnEmptyContext:   false,
          defaultLanguage:    "en",
          moduleDirectories:  _isServer ? [libPath.join(require("path").dirname(require.main.filename), "node_modules")] : [],
          webModuleDirectory: "/node_modules",
          aliases:            {},
          translations:       [],
          sessionLifetime:    365 * 24 * 60 * 60,
          tokenize:           {
                                objects:   { },
                                functions: [ ]
                              },
          merge:              {
                                "moduleDirectories":    "fcf.append",
                                "sources":              "fcf.NDetails.mergeSourcesConfig",
                                "aliases":              "fcf.append",
                                "translations":         "fcf.append",
                                "tokenize":             "fcf.NDetails.mergeTokenizeConfig",
                                "packages":             "fcf.NDetails.mergePackagesConfig"
                              },
          sources:            {
                                "fcf-framework-core":     { webMain: "fcf.js",     webFilePath: { js: compressFilePath } },
                                "fcf-framework-unitest":  { webMain: "unitest.js", webFilePath: { js: compressFilePath } }
                              },
          packages:           {}
        });
        if (_isServer) {
          let obj = require("./serverConfig.js");
          this._config[0].push(obj);
        }
      }
      if (a_options && typeof a_options.configuration === "object") {
        this._config[2].push(a_options.configuration);
      }
      if (a_options && a_options.isDefault) {
        _configuration = this;
      }
      this._apply();
      if (a_options && a_options.configuration instanceof fcf.Configuration) {
        a_options.configuration.on("update_after", (a_info)=>{
          this._apply(a_info.object);
        })
      }
    }



    /// @method appendPackage(object a_config)
    /// @brief Adds package configuration data.
    /// @details Configuration merging when adding a new element occurs in stages,
    ///          first the default object configuration is collected, then the default package configurations
    ///          (fcf.Configuration.prototype.appendPackage) and then the user configurations
    ///          added by the fcf.Configuration.prototype.append method
    /// @param object a_config - Object with the fields of the added configuration
    appendPackage(a_config) {
      if (typeof a_config != "object")
        return;
      this._config[1].push(a_config);
      this._apply(a_config);
      if (a_config instanceof fcf.Configuration){
        a_config.on("update_after", (a_info)=>{
          this._apply(a_info.object);
        })
      }
    }



    /// @method append(object a_config)
    /// @brief Adds user configuration data.
    /// @details Configuration merging when adding a new element occurs in stages,
    ///          first the default object configuration is collected, then the default package configurations
    ///          (fcf.Configuration.prototype.appendPackage) and then the user configurations
    ///          added by the fcf.Configuration.prototype.append method
    /// @param object a_config - Object with the fields of the added configuration
    append(a_config) {
      if (typeof a_config != "object")
        return;
      if (!(a_config instanceof fcf.Configuration) &&
          !(this._config[2][this._config[2].length-1] instanceof fcf.Configuration) &&
          typeof this._config[2][this._config[2].length-1] == "object") {
        this._applyConfig(a_config, this._config[2][this._config[2].length-1]);
      } else {
        this._config[2].push(a_config);
      }
      this._apply(a_config);
      if (a_config instanceof fcf.Configuration){
        a_config.on("update_after", (a_info)=>{
          this._apply(a_info.object);
        })
      }
    }

    _apply(a_object) {
      if (a_object) {
        this.emit("update_before", {object: a_object, configuration: this});
      }
      for(let key in this){
        if (key[0] != "_" && key != "merge") {
          delete this[key];
        }
      }
      for(let level of this._config) {
        for(let conf of level) {
          this._applyConfig(conf);
        }
      }
      if (_isServer){
        libResolver.appendModuleDirectory(this.moduleDirectories);
      }
      this._build();
      if (a_object) {
        this.emit("update_after", {object: a_object, configuration: this});
      }
    }

    _applyConfig(a_configuration, a_destination) {
      if (!a_configuration || typeof a_configuration !== "object")
        return;
      if (!a_destination) {
        a_destination = this;
      }

      this.merge = fcf.append({}, this.merge, a_configuration.merge);
      let mergeInfo = {};
      for(let k in this.merge) {
        let itm = this.merge[k];
        let file;
        if (typeof itm === "object") {
          file = itm.file;
          itm  = itm.function;
        }
        let func = typeof itm == "string" && itm ? itm : false;
        if (file && typeof fcf.resolve(_isServer ? global : window, func) != "function") {
          fcf.require(file, {async: false});
        }
        if (typeof fcf.resolve(_isServer ? global : window, func) != "function") {
          fcf.log.wrn("FCF", `Could not find merge function ${func} for config parameter "${k}"`);
          func = false;
        }
        let karr = fcf.parseObjectAddress(k);
        let m = { items: mergeInfo };
        for(let ki of karr) {
          if (!(ki in m.items)) {
            m.items[ki] = {items: {}, func: undefined};
          }
          m = m.items[ki];
        }
        m.func = func;
      }
      function merge(a_mergeInfo, a_key, a_result, a_dstObject, a_srcObject, a_isRoot, a_merge) {
        if (a_mergeInfo.items[a_key] || a_isRoot){
          let func = a_mergeInfo.items[a_key] ? a_mergeInfo.items[a_key].func : false;
          func = func && fcf.resolve(typeof global == "object" ? global : window, func);
          if (func) {
            if (a_key in a_dstObject) {
              a_result[a_key] = func(fcf.clone(a_dstObject[a_key]), fcf.clone(a_srcObject[a_key]));
            } else {
              if (a_merge) {
                a_result[a_key] = fcf.clone(a_srcObject[a_key]);
              }
            }
          } else {
            if (a_merge) {
              a_result[a_key] = fcf.clone(a_srcObject[a_key]);
            }
          }
          if (a_mergeInfo.items[a_key]) {
            let item = a_mergeInfo.items[a_key];
            for(let k in item.items) {
              if (a_srcObject[a_key] && k in a_srcObject[a_key]) {
                if (a_key in a_dstObject) {
                  merge(a_mergeInfo.items[a_key], k, a_result[a_key], a_dstObject[a_key], a_srcObject[a_key], false, item.items[k].func !== undefined);
                } else {
                  a_result[a_key][k] = fcf.clone(a_srcObject[a_key][k]);
                }
              }
            }
          }
        } else {
          if (a_merge) {
            a_result[a_key] = fcf.clone(a_srcObject[a_key]);
          }
        }
      }
      let result = {};
      for(let key in a_configuration) {
        if (key[0] == "_")
          continue;
        merge({items: mergeInfo}, key, result, a_destination, a_configuration, true, true);
        a_destination[key] = result[key];
      }

    }

    _build() {
      this._tokenizeFunctions = { functions: {}, items: {} };
      let fobjects = {};
      let newCalls = [];
      let sfunctions = this.tokenize && this.tokenize.functions ? this.tokenize.functions : [];
      let sobjects = this.tokenize && this.tokenize.objects ? this.tokenize.objects : {};
      for(let func of sfunctions) {
        let l   = typeof func.object == "string"                                   ? func.object :
                  Array.isArray(func.object) && typeof func.object[0] == "string"  ? func.object[0] :
                                                                                     "";
        let r   = typeof func.object == "string"                                   ? func.object :
                  Array.isArray(func.object) && typeof func.object[1] == "string"  ? func.object[1] :
                                                                                     "";
        let sla = fcf.parseObjectAddress(l);
        let sra = fcf.parseObjectAddress(r);
        let newCall = sla.pop();
        if (func.allow.indexOf("*") == -1 && func.allow.indexOf("constructor") == -1)
          continue;
        if (newCall != "" && newCall != "*"){
          sra.pop();
          newCalls.push({
            object: [sla.length ? fcf.normalizeObjectAddress(sla) : "", sra.length ? fcf.normalizeObjectAddress(sra) : ""],
            allow:  [newCall]
          });
        } else if (newCall == "*" && func.class) {
          let pathArr = fcf.parseObjectAddress(func.class);
          newCall = pathArr.pop();
          newCalls.push({
            object: pathArr.length ? fcf.normalizeObjectAddress(pathArr) : "",
            allow:  [newCall]
          });
        }
      }
      //fcf.append(this.tokenize.functions, newCalls);
      let sources = [sfunctions, newCalls];
      for(let source of sources) {
        for(let func of source) {
          let tf = this._tokenizeFunctions;
          func = fcf.clone(func);
          let l   = typeof func.object == "string"                                   ? func.object :
                    Array.isArray(func.object) && typeof func.object[0] == "string"  ? func.object[0] :
                                                                                       "";
          let r   = typeof func.object == "string"                                   ? func.object :
                    Array.isArray(func.object) && typeof func.object[1] == "string"  ? func.object[1] :
                                                                                       "";
          func.object = [l, r];
          let sla = fcf.parseObjectAddress(l);
          let sra = fcf.parseObjectAddress(r);
          while(sla.length){
            if (sla[sla.length-1] == "*"){
              sla.pop();
            } else {
              break;
            }
          }
          while(sra.length) {
            if (sra[sra.length-1] == "*") {
              sra.pop();
            } else {
              break;
            }
          }
          if (sla.length && sra.length && !(sla.length == 1 && sla[0] == "") && !(sra.length == 1 && sra[0] == "") ) {
            let sl = fcf.normalizeObjectAddress(sla);
            let sr = fcf.normalizeObjectAddress(sra);
            fobjects[sl] = {variable: sr, access: false};
          }
          if (func.object[0]){
            for(let pathItem of fcf.parseObjectAddress(func.object[0])) {
              if (!tf.items[pathItem])
                tf.items[pathItem] = {functions: {}, items: {}};
              tf = tf.items[pathItem];
            }
          }
          let allow = Array.isArray(func.allow) ? func.allow : ["*"];
          for (let allowItem of allow) {
            if (!Array.isArray(tf.functions[allowItem]))
              tf.functions[allowItem] = [];
            tf.functions[allowItem].push(func);
          }
        }
      }
      this._tokenizeEnvironment = { };
      this._tokenizeEnvironmentInfo = { parts: {} };
      for(let i = 0; i < 2; ++i) {
        let objects = !i ? fobjects : sobjects;
        let overwrite = !!i;
        for(let sourcePath in objects) {
          let path = fcf.parseObjectAddress(sourcePath);
          let subPath = fcf.clone(path);
          let key = subPath.pop();
          let root = fcf.prepare(this._tokenizeEnvironment, subPath);
          let item  = typeof objects[sourcePath] === "string" ? { variable: objects[sourcePath] } :
                      typeof objects[sourcePath] === "object" ? objects[sourcePath] :
                                                          { };
          if (typeof item.variable !== "string") {
            item.variable = sourcePath;
          }

          let value = fcf.resolve(typeof global !== "undefined" ? global : window, item.variable);
          try {
            if (overwrite || (!(key in root) || typeof root[key] === "function")) {
              let desc = Object.getOwnPropertyDescriptor(root, key);
              if (!desc || desc.writable) {
                root[key] = value;
              }
            }
          } catch(e) {
          }

          let p = this._tokenizeEnvironmentInfo;
          for(let pathItem of path) {
            if (!p.parts[pathItem]) {
              p.parts[pathItem] = { parts: {} };
            }
            p = p.parts[pathItem];
          }
          if (overwrite || !("access" in p)) {
            p.access = "access" in item ? item.access : true;
          }
        }
      }
      fcf.appendTranslate();
    }
  };



  /// @fn fcf.Configuration fcf.getConfiguration()
  /// @brief Get the default configuration object
  /// @result fcf.Configuration - Configuration object
  fcf.getConfiguration = () => {
    return _configuration;
  }

  let _configuration = undefined;

  fcf.NDetails.mergeTokenizeConfig = (a_dst, a_source) => {
    a_dst.objects   = fcf.append({}, a_dst.objects, a_source.objects);
    a_dst.functions = fcf.append([], a_dst.functions, a_source.functions);
    return a_dst;
  }

  fcf.NDetails.mergeSourcesConfig = (a_dst, a_source) => {
    a_dst    = a_dst || {};
    a_source = a_source || {};
    let result = fcf.clone(a_dst);
    for(let packageName in a_source) {
      result[packageName] = fcf.append({}, a_dst[packageName], a_source[packageName]);
      result[packageName].files       = fcf.append(true, {}, a_dst[packageName] && a_dst[packageName].files, a_source[packageName] && a_source[packageName].files);
      result[packageName].webFiles    = fcf.append(true, {}, a_dst[packageName] && a_dst[packageName].webFiles, a_source[packageName] && a_source[packageName].webFiles);
      result[packageName].serverFiles = fcf.append(true, {}, a_dst[packageName] && a_dst[packageName].serverFiles, a_source[packageName] && a_source[packageName].serverFiles);
    }
    return result;
  }

  fcf.NDetails.mergePackagesConfig = (a_dst, a_source) => {
    let result = fcf.clone(a_dst);
    for(let packageName in a_source) {
      if (!result[packageName]) {
        result[packageName] = fcf.clone(a_source[packageName]);
      } else {
        fcf.append(result[packageName], fcf.clone(a_source[packageName]));
      }
    }
    return result;
  }

  new fcf.Configuration({enableDefaultParams: true, isDefault: true});



  /// @fn fcf.EventChannel fcf.getEventChannel()
  /// @brief Get the default event channel object
  /// @result fcf.EventChannel - Event channel object
  fcf.getEventChannel = ()=>{
    return _eventChannel;
  };

  _eventChannel = new fcf.EventChannel();



  /// @var fcf.Logger fcf.log
  /// @brief Global logger object
  fcf.log = new Logger(fcf.getConfiguration());

  if (_isServer) {
    libResolver.appendModuleDirectory(_configuration.moduleDirectories);
  }

  if (!_isServer) {
    if ("___fcf_unitest" in fcf.getContext().route.args){
      fcf.require("fcf-framework-unitest")
      .then(()=>{
        if (!fcf.NUnitest || !fcf.NUnitest.unitest) {
          throw new fcf.Exception("LOAD_MODULE", {module: "fcf-framework-unitest"});
        }
        fcf.getEventChannel().onmet("page_ready", ()=>{
          return fcf.actions()
          .then(()=>{
            return fcf.NUnitest.unitest.runAutoTests();
          })
          .catch((e)=>{
            fcf.log.err("UniTest", e);
          });
        });
      })
    }
  }

  if (!_isServer) {
    document.addEventListener("DOMContentLoaded", ()=>{
      fcf.getEventChannel().send("page_ready", {});
    });
  }

  _modules[_getModulePath("fcf-framework-core:fcf.js")] = {
    state:        "ok",
    result:       fcf,
  };


})();
