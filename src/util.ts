export class EventDispatcher<T extends Event> {
  private delegate: DocumentFragment;

  constructor() {
    this.delegate = document.createDocumentFragment();
  }

  addEventListener(type: string, listener: (event: T) => void, options?: any) {
    return this.delegate.addEventListener(type, listener, options);
  }

  dispatchEvent(event: T) {
    return this.delegate.dispatchEvent(event);
  }

  removeEventListener(type: string, listener: (event: T) => void, options?: any) {
    return this.delegate.removeEventListener(type, listener, options);
  }
}

export class UnaryEvent<T> extends CustomEvent {
  constructor(eventType: string, detail: T) {
    super(eventType, {detail});
  }

  getDetail(): T {
    return this.detail;
  }
}
