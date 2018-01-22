import {BuiltinAsyncIterator} from '../alias/builtin';

abstract class AsyncIterator<T> implements BuiltinAsyncIterator<T> {
  static of<T>(iterable: AsyncIterable<T>): BuiltinAsyncIterator<T> {
    return iterable[Symbol.asyncIterator]();
  }

  abstract next(value?: any): Promise<IteratorResult<T>>;
}

export default AsyncIterator;
