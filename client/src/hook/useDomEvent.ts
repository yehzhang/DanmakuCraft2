import { useEffect, useRef } from 'react';

function useDomEvent<T extends HTMLDivElement, K extends keyof HTMLElementEventMap>(
  element: T | null,
  type: K,
  listener: EventListener<HTMLElementEventMap[K] & ElementTargetEvent>
) {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useEffect(() => {
    if (!element) {
      return;
    }

    element.addEventListener(type, listener as EventListener<HTMLElementEventMap[K]>);
    return () => {
      element.removeEventListener(type, listener as EventListener<HTMLElementEventMap[K]>);
    };
  }, [element]);
}

type EventListener<T> = (event: T) => void;

export interface ElementTargetEvent {
  readonly target: Element;
}

export default useDomEvent;
