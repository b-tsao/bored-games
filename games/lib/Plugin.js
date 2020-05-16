'use strict';

const {applyPatches, produceWithPatches} = require('immer');

function curryChangeListener(fn) {
  return produceWithPatches((draft, wrapper) => {
    wrapper.obj = fn(draft);
  });
}

module.exports = {
  // Wrapper to modify immer behavior
  changeListener: (state, fn) => {
    const wrapper = {};
    
    const curry = curryChangeListener(fn);
    
    const [nextState, patches, inversePatches] = curry(state, wrapper);
    
    return [wrapper.obj, nextState, patches];
  },
  setListener: (state, fn) => {
    return produceWithPatches(state, fn);
  },
  compressChanges: (state, changes) => {
    return produceWithPatches(state, (draft) => {
      return applyPatches(draft, changes);
    });
  }
};