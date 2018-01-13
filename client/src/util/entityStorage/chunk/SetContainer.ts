import ImmutableContainer from '../ImmutableContainer';
import Iterator from '../../syntax/Iterator';

class SetContainer<T> implements ImmutableContainer<T> {
  constructor(private items: Set<T> = new Set()) {
  }

  add(item: T) {
    let newItems = new Set(this.items);
    newItems.add(item);

    return new SetContainer(newItems);
  }

  addAll(items: T[]): ImmutableContainer<T> {
    let newItems = new Set(this.items);
    for (let item of items) {
      newItems.add(item);
    }

    return new SetContainer(newItems);
  }

  count() {
    return this.items.size;
  }

  [Symbol.iterator](): Iterator<T> {
    return Iterator.of(this.items);
  }
}

export default SetContainer;
