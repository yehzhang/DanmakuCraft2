import BaseEntityRegister from '../BaseEntityRegister';
import {EntityExistenceUpdatedEvent} from '../EntityFinder';

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
}

export default GlobalEntityRegister;
