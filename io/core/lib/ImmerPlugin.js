'use strict';

const { produce, applyPatches, produceWithPatches } = require('immer');

function curryChangeListener(fn) {
  return produceWithPatches((draft, wrapper) => {
    wrapper.obj = fn(draft);
  });
}

module.exports = {
  // Wrapper to modify immer behavior in order to detect errors rather than always check if typeof === 'string',
  // otherwise it's basically changeListener
  errorListener: (state, fn) => {
    const wrapper = {};

    const curry = curryChangeListener(fn);

    const [nextState, patches, inversePatches] = curry(state, wrapper);

    return [wrapper.obj, nextState, patches];
  },
  changeListener: produceWithPatches,
  asyncChangeListener: async (state, fn) => {
    const patches = [];
    const inversePatches = [];
    const nextState = await produce(state, fn, (p, ip) => {
      patches.push(...p);
      inversePatches.push(...ip);
    });
    return [nextState, patches, inversePatches];
  },
  compressChanges: (state, changes) => {
    return produceWithPatches(state, draft => {
      return applyPatches(draft, changes);
    });
  }
};