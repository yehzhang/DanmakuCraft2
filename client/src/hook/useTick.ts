import { useLayoutEffect, useRef } from 'react';
import application from '../shim/pixi/application';

function useTick(callback: TickCallback | null) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useLayoutEffect(() => {
    const tick = () => {
      if (callbackRef.current) {
        callbackRef.current(application.ticker.deltaMS);
      }
    };

    application.ticker.add(tick);
    return () => {
      application.ticker.remove(tick);
    };
  }, []);
}

export type TickCallback = (deltaMs: number) => void;

export default useTick;
