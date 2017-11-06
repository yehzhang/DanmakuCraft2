export class EventDispatcher<T extends Event> {
  private delegate: DocumentFragment;

  constructor() {
    this.delegate = document.createDocumentFragment();
  }

  addEventListener(type: EventType, listener: (event: T) => void, options?: any) {
    return this.delegate.addEventListener(type, listener, options);
  }

  dispatchEvent(event: T) {
    return this.delegate.dispatchEvent(event);
  }

  removeEventListener(type: EventType, listener: (event: T) => void, options?: any) {
    return this.delegate.removeEventListener(type, listener, options);
  }
}

export type EventType = string;
