import DataTransformer from './DataTransformer';

class Const<T, U> implements DataTransformer<T, U> {
  constructor(private readonly callback: (data: T) => U) {
  }

  static of<T, U>(callback: (data: T) => U): DataTransformer<T, U> {
    return new Const(callback);
  }

  transform(data: T): U {
    return this.callback(data);
  }
}

export default Const;
