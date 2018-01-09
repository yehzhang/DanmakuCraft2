class Pair<T, U> {
  constructor(readonly first: T, readonly second: U) {
  }

  static of<T, U>(first: T, second: U) {
    return new this(first, second);
  }
}

export default Pair;
