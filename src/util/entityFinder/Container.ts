interface Container<T> extends Iterable<T> {
  /**
   * Ignores {@param item} if it is already added.
   */
  add(item: T): void;

  count(): number;

  // TODO add listAround method, which is decalred in EntityContainer and implemented in BaseContainer
}

export default Container;
