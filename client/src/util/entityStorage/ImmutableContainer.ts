import Container from './Container';

interface ImmutableContainer<T> extends Container<T> {
  /**
   * Ignores {@param item} if it is already added.
   */
  add(item: T): ImmutableContainer<T>;
}

export default ImmutableContainer;
