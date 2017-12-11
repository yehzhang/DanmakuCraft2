import Result from './Result';

class OnceIterator<T> implements Iterator<T> {
  private done: boolean;

  private constructor(private value: T) {
    this.done = false;
  }

  static of<T>(value: T) {
    return new this(value);
  }

  next(): IteratorResult<T> {
    if (this.done) {
      return Result.done();
    }

    let result = Result.of(this.value);

    this.done = true;

    return result;
  }
}

export default OnceIterator;
