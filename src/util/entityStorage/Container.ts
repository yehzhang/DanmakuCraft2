interface Container<T> extends Iterable<T> {
  /**
   * Ignores {@param item} if it is already added.
   */
  add(item: T): void;

  count(): number;
}

export default Container;
