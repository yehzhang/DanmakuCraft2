import Event, {EventType} from './Event';

export default class EventDispatcher<T extends EventType> {
  private listeners: Map<Event<T, any>, Listener[]>;

  constructor() {
    this.listeners = new Map();
  }

  addEventListener<E extends Event<T, U>, U extends V, V>(
      event: E, listener: (value: V) => void, thisArg?: any) {
    let listeners = this.listeners.get(event);
    if (listeners === undefined) {
      listeners = [];
      this.listeners.set(event, listeners);
    }

    listeners.push(new Listener(listener, thisArg));
  }

  dispatchEvent<E extends Event<T, U>, U extends V, V>(event: E, value: V) {
    let listeners = this.listeners.get(event);
    if (listeners === undefined) {
      return;
    }

    for (let listener of listeners) {
      listener.notify(value);
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

  /**
   * Removes an event listener identified by {@param event}, {@param listener}, and
   * {@param thisArg}.
   */
  removeEventListener<E extends Event<T, U>, U extends V, V>(
      event: E, listener: (value: V) => void, thisArg?: any) {
    let listeners = this.listeners.get(event);
    if (listeners === undefined) {
      return;
    }

    let i = 0;
    for (let internalListener of listeners) {
      if (internalListener.equals(listener, thisArg)) {
        listeners.splice(i, 1);
        break;
      }
      i++;
    }
  }
}

class Listener {
  constructor(readonly callback: (value: any) => void, readonly context?: any) {
  }

  notify(value: any) {
    this.callback.call(this.context, value);
  }

  equals(callback: (value: any) => void, context?: any) {
    return callback === this.callback && context === this.context;
  }
}
