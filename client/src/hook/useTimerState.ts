import eq from 'lodash/eq';
import identity from 'lodash/identity';
import zipWith from 'lodash/zipWith';
import { DependencyList, useRef, useState } from 'react';
import useTick from './useTick';

function useTimerState<T>(
  tick: ((elapsedMs: number) => T) | null,
  initialState: T | (() => T),
  deps: DependencyList,
  equalityFn: (a: T, b: T) => boolean = eq
): T {
  const [state, setState] = useState(initialState);

  const elapsedMsRef = useRef(0);
  const depsRef = useRef(deps);
  useTick(
    tick &&
      ((deltaMs: number) => {
        if (zipWith(deps, depsRef.current, eq).every(identity)) {
          elapsedMsRef.current += deltaMs;
        } else {
          depsRef.current = deps;
          elapsedMsRef.current = 0;
        }

        const stateAtMs = tick(elapsedMsRef.current);
        if (!equalityFn(stateAtMs, state)) {
          setState(stateAtMs);
        }
      })
  );

  return state;
}

export default useTimerState;
