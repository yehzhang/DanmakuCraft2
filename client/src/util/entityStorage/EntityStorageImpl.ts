import EntityFinder from './EntityFinder';
import EntityRegister from './EntityRegister';
import EntityStorage from './EntityStorage';

class EntityStorageImpl<T, U> implements EntityStorage<T, U> {
  constructor(
      private readonly entityRegister: EntityRegister<T>,
      private readonly entityFinder: EntityFinder<U>) {
  }

  getRegister() {
    return this.entityRegister;
  }

  getFinder() {
    return this.entityFinder;
  }
}

export default EntityStorageImpl;
