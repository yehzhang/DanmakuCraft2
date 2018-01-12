import {VisibilityUpdatedEvent} from '../EntityFinder';
import Iterator from '../../syntax/Iterator';
import EntityRegister from '../EntityRegister';

class GlobalEntityRegister<T> implements EntityRegister<T> {
  constructor(
      private entities: Set<T>,
      private entityRegistered: Phaser.Signal<VisibilityUpdatedEvent<T>>) {
  }

  register(entity: T) {
    this.entities.add(entity);
    this.entityRegistered.dispatch(new VisibilityUpdatedEvent([entity]));
  }

  registerBatch(entities: Iterable<T>): void {
    let entitiesArray = Array.from(entities);

    if (entitiesArray.length === 0) {
      return;
    }

    for (let entity of entitiesArray) {
      this.entities.add(entity);
    }

    this.entityRegistered.dispatch(new VisibilityUpdatedEvent(entitiesArray));
  }

  deregister(entity: T) {
    let isEntityDeleted = this.entities.delete(entity);
    if (!isEntityDeleted) {
      console.error('Entity was not registered', entity);
      return;
    }

    this.entityRegistered.dispatch(new VisibilityUpdatedEvent<T>([], [entity]));
  }

  count() {
    return this.entities.size;
  }

  [Symbol.iterator](): Iterator<T> {
    return Iterator.of(this.entities);
  }
}

export default GlobalEntityRegister;
