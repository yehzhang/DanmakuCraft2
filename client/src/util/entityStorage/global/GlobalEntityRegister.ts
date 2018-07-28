import {asSequence} from 'sequency';
import Iterator from '../../syntax/Iterator';
import {StateChanged} from '../EntityFinder';
import EntityRegister from '../EntityRegister';

class GlobalEntityRegister<T> implements EntityRegister<T> {
  constructor(
      private readonly entities: Set<T>,
      private readonly onStateChanged: Phaser.Signal<StateChanged<T>>) {
  }

  register(entity: T) {
    if (this.entities.has(entity)) {
      return;
    }

    this.entities.add(entity);

    this.onStateChanged.dispatch(new StateChanged([entity]));
  }

  registerBatch(entities: Iterable<T>) {
    const addedEntities = asSequence(entities)
        .filter(entity => !this.entities.has(entity))
        .onEach(entity => this.entities.add(entity))
        .toArray();

    if (addedEntities.length === 0) {
      return;
    }
    this.onStateChanged.dispatch(new StateChanged(addedEntities));
  }

  deregister(entity: T) {
    const isEntityDeleted = this.entities.delete(entity);
    if (!isEntityDeleted) {
      console.error('Entity was not registered', entity);
      return;
    }

    this.onStateChanged.dispatch(new StateChanged([], [entity]));
  }

  [Symbol.iterator](): Iterator<T> {
    return Iterator.of(this.entities);
  }
}

export default GlobalEntityRegister;
