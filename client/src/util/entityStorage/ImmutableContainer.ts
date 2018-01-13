interface ImmutableContainer<T> extends Iterable<T> {
  /**
   * Ignores {@param item} if it is already added.
   */
  add(item: T): ImmutableContainer<T>;

  addAll(items: T[]): ImmutableContainer<T>;

  count(): number;
}

export default ImmutableContainer;
