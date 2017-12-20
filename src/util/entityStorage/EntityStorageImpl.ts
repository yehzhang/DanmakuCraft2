import EntityStorage from './EntityStorage';
import EntityRegister from './EntityRegister';
import EntityFinder from './EntityFinder';

class EntityStorageImpl<T, U> implements EntityStorage<T, U> {
  constructor(private entityRegister: EntityRegister<T>, private entityFinder: EntityFinder<U>) {
  }

  getRegister() {
    return this.entityRegister;
  }

  getFinder() {
    return this.entityFinder;
  }
}

export default EntityStorageImpl;
