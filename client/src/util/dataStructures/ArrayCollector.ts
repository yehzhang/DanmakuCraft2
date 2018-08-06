import {Collector} from '../entityStorage/EntityFinder';

class ArrayCollector<T> implements Collector<T> {
  constructor(readonly values: T[] = []) {
  }

  add(value: T) {
    this.values.push(value);
  }
}

export default ArrayCollector;
