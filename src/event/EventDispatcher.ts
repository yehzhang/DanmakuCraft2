import Event, {EventType} from './Event';

export default class EventDispatcher<T extends EventType> {
  private listeners: Map<Event<T, any>, Array<(value: any) => void>>;

  constructor() {
    this.listeners = new Map();
  }

  addEventListener<E extends Event<T, U>, U extends V, V>(
      event: E, listener: (value: V) => void, thisArg?: any) {
    if (thisArg !== undefined) {
      listener = listener.bind(thisArg);
    }

    let listeners = this.listeners.get(event);
    if (listeners === undefined) {
      listeners = [];
      this.listeners.set(event, listeners);
    }

    listeners.push(listener);
  }

  dispatchEvent<E extends Event<T, U>, U extends V, V>(event: E, value: V) {
    let listeners = this.listeners.get(event);
    if (listeners === undefined) {
      return;
    }

    for (let listener of listeners) {
      listener(value);
    }
  }

  /**
   * Delegates all occurrences of {@param event} to {@param dispatcher}.
   *
   * Avoid delegating dispatchers cyclically.
   */
  delegateEvent<E extends Event<T, any>>(event: E, dispatcher: EventDispatcher<T>) {
    if (dispatcher as any === this) {
      throw new TypeError('Cannot delegate to dispatcher itself');
    }

    this.addEventListener(event, value => dispatcher.dispatchEvent(event, value));
  }
}
