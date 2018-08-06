/**
 * An optimization that joins two sets, exactly one of which is a *stream set*.
 */
interface StreamJoiner<T> {
  /**
   * Values in the stream set but not in the other.
   */
  readonly leftValues: Iterable<T>;

  /**
   * Values in both sets.
   */
  readonly innerValues: Iterable<T>;

  /**
   * Values not in the stream set but in the other.
   */
  readonly rightValues: Iterable<T>;

  /**
   * Adds {@param value} to the stream set.
   */
  add(value: T): void;

  /**
   * Moves all values from the stream set to the other, after emptying the latter one.
   */
  flush(): void;
}

export default StreamJoiner;
