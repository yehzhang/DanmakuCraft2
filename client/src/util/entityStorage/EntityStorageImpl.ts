import EntityStorage from './EntityStorage';
import EntityRegister from './EntityRegister';
import EntityFinder from './EntityFinder';
import {DisplayableEntity} from '../../entitySystem/alias';

class EntityStorageImpl<T extends DisplayableEntity, U> implements EntityStorage<T, U> {
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
