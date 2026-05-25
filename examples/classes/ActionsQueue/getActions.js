//
// This is solely for importing a module from the current directory.
const libPath = require('path');
const libModule = require("module");
let splitter    = process.platform == "win32" ? ";" : ":";
let paths       = !process.env.NODE_PATH ? [] : process.env.NODE_PATH.split(splitter);
paths.unshift(libPath.join(__dirname, '../../../..'));
process.env.NODE_PATH = paths.join(splitter);
libModule.Module._initPaths();

// Sequential Task Execution
{
  let fcf = require("fcf-framework-core");

  let queue = new fcf.ActionsQueue();

  // First task
  queue.getActions().then(() => {
    fcf.log.log("APP", "Task 1 completed");
  });

  // Second task (will automatically wait for the first task to finish)
  queue.getActions().then(() => {
    fcf.log.log("APP", "Task 2 completed");
  });
}

fcf.log.log("APP", "----------------");

// Using with Asynchronous Operations
{
  let fcf = require("fcf-framework-core");

  async function main() {
    let queue = new fcf.ActionsQueue();

    async function asyncTask(id) {
      fcf.log.log("APP", "Async task " + id + " start");
      await new Promise(resolve => setTimeout(resolve, 1000));
      fcf.log.log("APP", "Async task " + id + " done");
    }

    // Adding tasks to the queue
    queue.getActions().then(() => asyncTask(1));
    queue.getActions().then(() => asyncTask(2));

    // Waiting for the entire queue to finish
    await queue.getActions().then(() => {
      fcf.log.log("APP", "Entire queue processed");
    });
  }

  main();
}
