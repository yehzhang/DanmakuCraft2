import { RefObject, useEffect, useRef } from 'react';

function useDomEvent<T extends HTMLDivElement, K extends keyof HTMLElementEventMap>(
  elementRef: RefObject<T>,
  type: K,
  callback: EventListener<HTMLElementEventMap[K] & ElementTargetEvent>
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const listener = ((event: HTMLElementEventMap[K] & ElementTargetEvent) => {
      callbackRef.current(event);
    }) as EventListener<HTMLElementEventMap[K]>;
    element.addEventListener(type, listener);
    return () => {
      element.removeEventListener(type, listener);
    };
  }, []);
}

type EventListener<T> = (event: T) => void;

export interface ElementTargetEvent {
  readonly target: Element;
}

export default useDomEvent;
