import {asSequence} from 'sequency';
import DataTransformer from './DataTransformer';

class Weighted<T> implements DataTransformer<number, T> {
  constructor(private readonly entries: Array<WeightedEntry<T>>) {
  }

  static newBuilder<T>(): WeightedBuilder<T> {
    return new WeightedBuilder();
  }

  transform(data: number) {
    return asSequence(this.entries).first(entry => data <= entry.weightSum).item;
  }
}

export default Weighted;

class WeightedEntry<T> {
  constructor(readonly item: T, readonly weightSum: number) {
  }
}

class WeightedBuilder<T> {
  constructor(
      private readonly entries: Array<WeightedEntry<T>> = [],
      private weightSum: number = 0) {
  }

  add(item: T, weight: number): this {
    this.weightSum += weight;
    this.entries.push(new WeightedEntry(item, this.weightSum));

    return this;
  }

  build(): Weighted<T> {
    if (this.entries.length === 0) {
      throw new Error('No item was added');
    }

    const normalizedEntries =
        this.entries.map(entry => new WeightedEntry(entry.item, entry.weightSum / this.weightSum));
    return new Weighted(normalizedEntries);
  }
}
