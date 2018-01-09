import BaseEntityRegister from '../BaseEntityRegister';
import {EntityExistenceUpdatedEvent} from '../EntityFinder';
import Iterator from '../../syntax/Iterator';

class GlobalEntityRegister<T> extends BaseEntityRegister<T> {
  constructor(
      private entities: Set<T>,
      private entityRegistered: Phaser.Signal<EntityExistenceUpdatedEvent<T>>) {
    super();
  }

  register(entity: T, silent?: boolean) {
    this.entities.add(entity);

    if (silent) {
      return;
    }
    this.entityRegistered.dispatch(new EntityExistenceUpdatedEvent<T>(entity, null));
  }

  deregister(entity: T, silent?: boolean) {
    let isEntityDeleted = this.entities.delete(entity);

    if (!isEntityDeleted) {
      console.error('Entity is not registered', entity);
      return;
    }
    if (silent) {
      return;
    }
    this.entityRegistered.dispatch(new EntityExistenceUpdatedEvent<T>(null, entity));
  }

  count() {
    return this.entities.size;
  }

  [Symbol.iterator](): Iterator<T> {
    return Iterator.of(this.entities);
  }
}

export default GlobalEntityRegister;
