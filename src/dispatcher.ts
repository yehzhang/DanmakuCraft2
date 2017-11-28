export interface Typeful<T> {
  getType(): string;
}

export class EventDispatcher<E extends Event> {
  protected delegate: DocumentFragment;

  constructor() {
    this.delegate = document.createDocumentFragment();
  }

  addEventListener(type: string, listener: (event: E) => void, options?: any) {
    return this.delegate.addEventListener(type, listener as EventListener, options);
  }

  dispatchEvent(event: E) {
    return this.delegate.dispatchEvent(event);
  }

  removeEventListener(type: string, listener: (event: E) => void, options?: any) {
    return this.delegate.removeEventListener(type, listener as EventListener, options);
  }
}

export class TypedDispatcher {
  protected delegate: DocumentFragment;

  constructor() {
    this.delegate = document.createDocumentFragment();
  }

  addEventListener<K extends Typeful<V>, V>(
      typeful: K,
      listener: (event: UnaryEvent<V>) => void,
      options?: any) {
    return this.delegate.addEventListener(typeful.getType(), listener as EventListener, options);
  }

  dispatchEvent<K extends Typeful<V>, V>(event: TypedEvent<K, V>) {
    return this.delegate.dispatchEvent(event);
  }

  removeEventListener<K extends Typeful<V>, V>(
      typeful: K,
      listener: (event: UnaryEvent<V>) => void,
      options?: any) {
    return this.delegate.removeEventListener(typeful.getType(), listener as EventListener, options);
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

export class TypedEvent<K extends Typeful<V>, V> extends UnaryEvent<V> {
  constructor(typeful: K, detail: V) {
    super(typeful.getType(), detail);
  }
}
