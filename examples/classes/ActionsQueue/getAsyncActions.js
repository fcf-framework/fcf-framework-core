//
// This is solely for importing a module from the current directory.
const libPath = require('path');
const libModule = require("module");
let splitter    = process.platform == "win32" ? ";" : ":";
let paths       = !process.env.NODE_PATH ? [] : process.env.NODE_PATH.split(splitter);
paths.unshift(libPath.join(__dirname, '../../../..'));
process.env.NODE_PATH = paths.join(splitter);
libModule.Module._initPaths();

let fcf = require("fcf-framework-core");

fcf.actions().then(()=>
{

  let fcf = require("fcf-framework-core");
  let queue = new fcf.ActionsQueue();

  // Adding tasks to the "upload" group
  for(let i = 0; i < 3; i++) {
    (function(i){
      queue.getAsyncActions("upload").then(() => {
        return fcf.actions()
        .then(()=>{
          fcf.log.log("App", "upload '" + i + "' started");
        })
        .wait(1000)
        .then(()=>{
          fcf.log.log("App", "upload '" + i + "' completed");
        });
      });
    })(i);
  }

  // Adding tasks to the "processing" group
  for(let i = 0; i < 3; i++) {
    (function(i){
      queue.getAsyncActions("processing").then(() => {
        return fcf.actions()
        .then(()=>{
          fcf.log.log("App", "processing '" + i + "' started");
        })
        .wait(1000)
        .then(()=>{
          fcf.log.log("App", "processing '" + i + "' completed");
        });
      });
    })(i);
  }

  // Adding tasks to the "upload" group
  for(let i = 0; i < 3; i++) {
    (function(i){
      queue.getAsyncActions("upload").then(() => {
        return fcf.actions()
        .then(()=>{
          fcf.log.log("App", "upload '" + i + "' started");
        })
        .wait(1000)
        .then(()=>{
          fcf.log.log("App", "upload '" + i + "' completed");
        });
      });
    })(i);
  }

  // This block will execute only after all tasks
  queue.getActions().then(() => {
    fcf.log.log("App", "All uploads completed");
  });



  return queue.getActions();
}
)
.then(()=>{
  console.log("------------------------------");
})
.then( ()=>{

  let fcf = require("fcf-framework-core");

  let queue = new fcf.ActionsQueue();

  // Create a group batch1
  queue.getAsyncActions("batch1")
    .then(()=>{
      fcf.log.log("App", "task1 (batch1) started");
    })
    .wait(1000)
    .then(()=>{
      fcf.log.log("App", "task1 (batch1) completed");
    })

  // Create a new group batch2
  queue.getAsyncActions("batch2")
    .then(()=>{
      fcf.log.log("App", "task 2 (batch2) started");
    })
    .wait(1000)
    .then(()=>{
      fcf.log.log("App", "task 2 (batch2) completed");
    })

  // Add to the same group (a_appendMode = true)
  // This method with the flag appendMode will add to the last 
  // existing group with this name or create a new one. 
  // Regardless of the fact that there is already a batch2 group in turn.
  queue.getAsyncActions("batch1", true)
    .then(()=>{
      fcf.log.log("App", "task3 (batch1) started");
    })
    .wait(1000)
    .then(()=>{
      fcf.log.log("App", "task3 (batch1) completed");
    })

  // Wait for the entire "batch" groups to finish
  queue.getActions().then(() => {
    fcf.log.log("App", "Batch group fully processed");
  });



})


