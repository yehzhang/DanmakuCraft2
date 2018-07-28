export function bindFirst<T extends Node>(
    element: JQuery<T>,
    event: string,
    selector: JQuery.EventHandler<T>) {
  element.on(event, selector);

  const events = element.data('events');
  if (events == null) {
    console.error('Failed to bind handler to the first');
    element.on(event, selector);
  } else {
    const bindings = events[event];
    bindings.unshift(bindings.pop());
  }
}

export function isLinux() {
  const ua = navigator.userAgent;
  return /Linux/i.test(ua);
}
