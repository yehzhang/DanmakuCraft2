import EntityFinder from './EntityFinder';
import EntityLoader from './EntityRegister';

interface EntityStorage<T, U = T> {
  getRegister(): EntityLoader<T>;

  getFinder(): EntityFinder<U>;
}

export default EntityStorage;
