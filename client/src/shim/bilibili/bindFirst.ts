/**
 * Binds a JQuery event listener which is executed before all others.
 * Returns a destructor.
 */
function bindFirst<T extends EventTarget>(
  element: JQuery<T>,
  event: string,
  selector: JQuery.EventHandler<T>
): () => void {
  element.on(event, selector);

  const events = element.data('events');
  if (events == null) {
    console.error('Failed to bind handler to the first');
  } else {
    const bindings = events[event];
    bindings.unshift(bindings.pop());
  }

  return () => {
    element.off(event, selector);
  };
}

export default bindFirst;
