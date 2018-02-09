import {StateChanged} from '../EntityFinder';
import Iterator from '../../syntax/Iterator';
import EntityRegister from '../EntityRegister';
import {asSequence} from 'sequency';

class GlobalEntityRegister<T> implements EntityRegister<T> {
  constructor(
      private entities: Set<T>, private onStateChanged: Phaser.Signal<StateChanged<T>>) {
  }

  register(entity: T) {
    if (this.entities.has(entity)) {
      return;
    }

    this.entities.add(entity);

    this.onStateChanged.dispatch(new StateChanged([entity]));
  }

  registerBatch(entities: Iterable<T>) {
    let addedEntities = asSequence(entities)
        .filter(entity => !this.entities.has(entity))
        .onEach(entity => this.entities.add(entity))
        .toArray();

    if (addedEntities.length === 0) {
      return;
    }
    this.onStateChanged.dispatch(new StateChanged(addedEntities));
  }

  deregister(entity: T) {
    let isEntityDeleted = this.entities.delete(entity);
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
