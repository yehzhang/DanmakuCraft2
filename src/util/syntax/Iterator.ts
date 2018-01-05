import BuiltinIterator from './BuiltinIterator';

abstract class Iterator<T> implements BuiltinIterator<T> {
  static of<T>(iterable: Iterable<T>): BuiltinIterator<T> {
    return iterable[Symbol.iterator]();
  }

  abstract next(value?: any): IteratorResult<T>;
}

export default Iterator;
