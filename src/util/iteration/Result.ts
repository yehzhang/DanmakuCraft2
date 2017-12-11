class Result<T> implements IteratorResult<T> {
  private constructor(public done: boolean, public value: T) {
  }

  static of<T>(value: T) {
    return new this(false, value);
  }

  static done<T>() {
    return new this(true, null as any as T);
  }
}

export default Result;
