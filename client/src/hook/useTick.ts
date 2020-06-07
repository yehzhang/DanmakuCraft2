import { RefObject, useLayoutEffect, useRef } from 'react';
import application from '../shim/pixi/application';

function useTick(callback: TickCallback | null) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useLayoutEffect(() => {
    callbackRefs.add(callbackRef);
    return () => {
      callbackRefs.delete(callbackRef);
    };
  }, []);
}

export type TickCallback = (deltaMs: number) => void;

function tick() {
  const lastPerceivedMs = perceivedMs;

  realMs += application.ticker.deltaMS;
  perceivedMs = Math.max(perceivedMs + 1000 / 60, realMs - 500);

  const lagMs = realMs - perceivedMs;
  perceivedMs += Math.min(lagMs, 2, Math.max(lagMs * 0.1, 0.1));

  const deltaMs = perceivedMs - lastPerceivedMs;
  for (const callbackRef of callbackRefs) {
    if (callbackRef.current) {
      callbackRef.current(deltaMs);
    }
  }
}

let realMs = 0;
let perceivedMs = 0;
const callbackRefs = new Set<RefObject<TickCallback>>();

application.ticker.add(tick);

export default useTick;
