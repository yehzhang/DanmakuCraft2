import AsyncIterable from '../syntax/AsyncIterable';
import Sleep from './Sleep';

class IntermittentIterable {
  static async * of<T>(values: Iterable<T>): AsyncIterable<T> {
    for (let value of values) {
      await Sleep.moment();
      yield value;
    }
  }
}

export default IntermittentIterable;
