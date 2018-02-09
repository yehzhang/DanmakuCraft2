import {BuiltinIterator} from '../alias/builtin';

abstract class Iterator<T> implements BuiltinIterator<T> {
  static of<T>(iterable: Iterable<T>): BuiltinIterator<T> {
    return iterable[Symbol.iterator]();
  }

  static empty<T>(): BuiltinIterator<T> {
    return this.of([]);
  }

  static single<T>(value: T): BuiltinIterator<T> {
    return this.of([value]);
  }

  abstract next(value?: any): IteratorResult<T>;
}

export default Iterator;
