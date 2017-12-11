class IterablesIterator<T> implements IterableIterator<T> {
  private generator: Iterator<T>;

  private constructor(private iterables: Iterable<Iterable<T>>) {
    this.generator = this.createGenerator();
  }

  static of<T>(iterables: Iterable<Iterable<T>>) {
    return new this(iterables);
  }

  next() {
    return this.generator.next();
  }

  [Symbol.iterator]() {
    return this;
  }

  private * createGenerator() {
    for (let iterable of this.iterables) {
      for (let iteratee of iterable) {
        yield iteratee;
      }
    }
  }
}

export default IterablesIterator;
