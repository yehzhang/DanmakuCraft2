import BaseEntityRegister from '../BaseEntityRegister';
import {EntityExistenceUpdatedEvent} from '../EntityFinder';

class GlobalEntityRegister<T> extends BaseEntityRegister<T> {
  constructor(
      private entities: T[],
      private entityRegistered: Phaser.Signal<EntityExistenceUpdatedEvent<T>>) {
    super();
  }

  register(entity: T, dispatchEvent?: boolean): void {
    this.entities.push(entity);
    if (dispatchEvent) {
      this.entityRegistered.dispatch(new EntityExistenceUpdatedEvent<T>(entity, null));
    }
  }
}

export default GlobalEntityRegister;
