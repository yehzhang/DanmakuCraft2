import {BuiltinAsyncIterable} from '../alias/builtin';

abstract class AsyncIterable<T> implements BuiltinAsyncIterable<T> {
  static async * of<T>(iterable: Iterable<T>): BuiltinAsyncIterable<T> {
    for (const value of iterable) {
      yield Promise.resolve(value);
    }
  }

  abstract [Symbol.asyncIterator](): AsyncIterator<T>;
}

export default AsyncIterable;
