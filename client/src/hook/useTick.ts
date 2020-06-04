import { RefObject, useLayoutEffect, useRef } from 'react';
import application from '../shim/pixi/application';

function useTick(callback: TickCallback | null) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useLayoutEffect(() => {
    listenerRefs.add(callbackRef);
    return () => {
      listenerRefs.delete(callbackRef);
    };
  }, []);
}

export type TickCallback = (deltaMs: number) => void;

function tick() {
  const lastPerceivedMs = perceivedMs;

  realMs += application.ticker.elapsedMS;
  perceivedMs = Math.max(perceivedMs + 1000 / 60, realMs - 500);

  const lagMs = realMs - perceivedMs;
  perceivedMs += Math.min(lagMs, 2, Math.max(lagMs * 0.1, 0.1));

  const deltaMs = perceivedMs - lastPerceivedMs;
  for (const listenerRef of listenerRefs) {
    if (listenerRef.current) {
      listenerRef.current(deltaMs);
    }
  }
}

let realMs = 0;
let perceivedMs = 0;
const listenerRefs = new Set<RefObject<TickCallback>>();

application.ticker.add(tick);

export default useTick;
