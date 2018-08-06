import {Collector} from '../entityStorage/EntityFinder';
import StreamJoiner from './StreamJoiner';

/**
 * An implementation optimized for memory allocations and iteration performance.
 */
class SetStreamJoiner<T> implements StreamJoiner<T>, Collector<T> {
  constructor(
      public leftValues = new Set<T>(),
      public innerValues = new Set<T>(),
      public rightValues = new Set<T>()) {
  }

  flush() {
    this.rightValues.clear();

    const innerLeftValues = this.innerValues;
    for (const value of this.leftValues) {
      innerLeftValues.add(value);
    }
    this.leftValues.clear();

    [this.leftValues, this.innerValues, this.rightValues] =
        [this.rightValues, this.leftValues, innerLeftValues];
  }

  add(value: T) {
    if (this.rightValues.has(value)) {
      this.rightValues.delete(value);
      this.innerValues.add(value);

      return;
    }

    if (this.innerValues.has(value)) {
      return;
    }

    this.leftValues.add(value);
  }
}

export default SetStreamJoiner;
