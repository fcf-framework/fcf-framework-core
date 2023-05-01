const  libAsyncHooks = require("async_hooks");
const _stateStorage = new Map();
const _asyncHooks = libAsyncHooks.createHook({
  init: (a_id, a_type, a_triggerId)=>{
    let state = _stateStorage.get(a_triggerId);
    let stateInfo;
    if (state){
      _stateStorage.set(a_id, [a_triggerId, state[1]])
    }
  },
  before: function(a_id){
    let state = _stateStorage.get(a_id);
    if (state){
      let pstate = _stateStorage.get(state[0]);
      if (pstate) {
        state[1] = pstate[1];
      }
    }
  },
  destroy: (a_id)=>{
    if (_stateStorage.has(a_id))
        _stateStorage.delete(a_id);
  }
}).enable();
module.exports = {
  getState: function() {
    let state = _stateStorage.get(libAsyncHooks.executionAsyncId());
    if (!state) {
      state = {state: {}};
      this.setState(state);
    }
    return state[1];
  },
  setState: function(a_state) {
    let pid = -1;
    let state = _stateStorage.get(libAsyncHooks.executionAsyncId());
    if (state) {
      pid = state[0];
    }
    _stateStorage.set(libAsyncHooks.executionAsyncId(), [pid, a_state]);
  }
};
