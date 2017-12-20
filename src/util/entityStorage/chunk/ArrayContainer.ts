import Container from '../Container';

/**
 * Implements {@link Container} with an array.
 */

class ArrayContainer<T> implements Container<T> {
  private items: T[];

  constructor() {
    this.items = [];
  }

  add(item: T) {
    if (this.items.includes(item)) {
      return;
    }
    this.items.push(item);
  }

  count() {
    return this.items.length;
  }

  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }
}

export default ArrayContainer;
