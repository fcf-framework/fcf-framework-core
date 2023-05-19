let libFS = require("fs");
let libPath = require("path");
let libUtil = require("util");
let _directories = {};
let _garbageСollectorInfo = {};

async function garbageСollector(a_preffix) {
  let gci;
  if (a_preffix){
    gci = {};
    gci[a_preffix] = _garbageСollectorInfo[a_preffix];
  } else {
    gci = _garbageСollectorInfo;
  }
  for(let prefix in gci) {
    try {
      let realPrefix = fcf.getPath(prefix);
      let directory  = fcf.getPath(fcf.getDirectory(prefix));
      let files      = await libUtil.promisify(libFS.readdir)(directory);
      for(let file of files) {
        let path = libPath.join(directory, file);
        if (path.indexOf(path) !== 0)
          continue;
        let suffix = path.substr(realPrefix.length);
        if (suffix.search(/\d\d\d\d-\d\d-\d\d.log$/) != 0){
          continue;
        }
        let date = fcf.parseDate(suffix, "Y-m-d.log");
        let now  = new Date();
        if (Math.floor((now.getTime() - date.getTime()) / (24*60*60*1000)) <= gci[prefix]) {
          continue;
        }
        try {
          await libUtil.promisify(libFS.unlink)(path);
        } catch(e){
          fcf.log.err("FCF", `Failed to delete log file ${path}: ${e.message}`);
        }
      }
    } catch(e) {
    }
  }
}

function startTimer() {
  let tsEnd = fcf.parseDate(fcf.formatDate(new Date(), "Y-m-d"), "Y-m-d").getTime() + 24*60*60*1000 + 5*60*1000;
  let timer = setTimeout(()=>{
    garbageСollector();
    startTimer()
  }, tsEnd - Date.now());
  timer.unref();
}

setTimeout(()=>{
  startTimer();
}, 1);


function _cutFile(a_file, a_size) {
  if (!a_size)
    return;
  a_size *= 1000000;
  let source;
  let destination;
  let tmpFilePath;
  return fcf.actions()
  .then(async ()=>{
    let stat;
    try {
      stat = await libUtil.promisify(libFS.stat)(a_file);
    } catch(e){
      return;
    }
    if (stat.size < a_size)
      return;
    let partSize    = 100000;
    let offset      = stat.size - (a_size - 500000);
    let woffset     = 0;
    tmpFilePath = a_file + fcf.id();
    source = await libUtil.promisify(libFS.open)(a_file, "r");
    destination = await libUtil.promisify(libFS.open)(tmpFilePath, "w");
    let buffer = Buffer.alloc(partSize);
    while(offset < stat.size) {
      buffer.offset = 0;
      let rc = await libUtil.promisify(libFS.read)(source, {buffer: buffer, offset: 0, length: (stat.size - offset) > partSize ? partSize : stat.size - offset, position: offset});
      rc = typeof rc == "object" ? rc.bytesRead : rc;
      if (!rc)
        break;
      buffer.offset = 0;
      await libUtil.promisify(libFS.write)(destination, buffer, 0, rc, woffset);
      woffset += rc;
      offset += rc;
    }
    stat = libFS.statSync(a_file);
    while (offset < stat.size){
      buffer.offset = 0;
      let rc = libFS.readSync(source, buffer, 0, (stat.size - offset) > partSize ? partSize : stat.size - offset, offset);
      rc = typeof rc == "object" ? rc.bytesRead : rc;
      if (!rc)
        break;
      buffer.offset = 0;
      libFS.writeSync(destination, buffer, 0, rc, woffset);
      woffset += rc;
      offset += rc;
    }
    libFS.renameSync(tmpFilePath, a_file);
  })
  .finally(async ()=>{
    if (source){
      try {
        await libUtil.promisify(libFS.close)(source);
      } catch(e){
      }
    }
    if (destination){
      try {
        await libUtil.promisify(libFS.close)(destination);
      } catch(e){
      }
    }
    if (tmpFilePath) {
      try {
        await libUtil.promisify(libFS.unlink)(tmpFilePath);
      } catch(e){
      }
    }
  })
  .catch((e)=>{
  });
}

module.exports = {
  fileHandler: (a_info) => {
    let logFile = a_info.logger.getConfiguration().logFile;
    if (logFile) {
      if (_garbageСollectorInfo[logFile] !== a_info.logger.getConfiguration().logLifeTime) {
        _garbageСollectorInfo[logFile] = a_info.logger.getConfiguration().logLifeTime;
        garbageСollector(logFile);
      }
      let file = fcf.getPath(logFile + fcf.formatDate(new Date(), "Y-m-d") + ".log");
      let directory = fcf.getPath(fcf.getDirectory(file));
      if (!_directories[directory]) {
        _directories[directory] = 1;
        let exist = libFS.existsSync(directory);
        if (exist)
          return;
        libFS.mkdirSync(directory, { recursive: true });
      }

      let firstCheckFile = !("_outputSumSize" in a_info.logger);
      if (!"_outputSumSize" in a_info.logger) {
        a_info.logger._outputSumSize = 0;
      }
      a_info.logger._outputSumSize += Buffer.byteLength(a_info.output, 'utf8') + 2;

      if (firstCheckFile || a_info.logger._outputSumSize > 100000) {
        a_info.logger._outputSumSize = 0;
        _cutFile(file, !("logMaxFileSize" in a_info.logger.getConfiguration()) ? 1 : parseInt(a_info.logger.getConfiguration().logMaxFileSize));
      }
      return libFS.appendFileSync(file, a_info.output + "\r\n", "utf8");
    }
  }
}
