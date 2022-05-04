import { produce, applyPatches, produceWithPatches } from 'immer';
import { AnyFunction } from '../types';

function curryChangeListener(fn: AnyFunction) {
  return produceWithPatches((draft, wrapper) => {
    wrapper.obj = fn(draft);
  });
}

/**
 * This error listener takes in a function (fn) that if returns a string will throw that string as an error.
 * Otherwise the fn should return null for a successful change patch.
 * @param state 
 * @param fn 
 * @returns 
 */
export function errorListener(state: any, fn: AnyFunction) {
  // Wrapper to modify immer behavior in order to detect errors rather than always check if typeof === 'string',
  // otherwise it's basically changeListener
  const wrapper = { obj: null };

  const curry = curryChangeListener(fn);

  const [nextState, patches, inversePatches] = curry(state, wrapper);

  return [wrapper.obj, nextState, patches];
}

export { produceWithPatches as changeListener };

export async function asyncChangeListener(state: any, fn: AnyFunction) {
  const patches: object[] = [];
  const inversePatches: object[] = [];
  const nextState = await produce(state, fn, (p, ip) => {
    patches.push(...p);
    inversePatches.push(...ip);
  });
  return [nextState, patches, inversePatches];
}

export function compressChanges(state: any, changes: any) {
  return produceWithPatches(state, (draft: any) => {
    return applyPatches(draft, changes);
  });
}