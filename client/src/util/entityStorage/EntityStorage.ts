import EntityFinder from './EntityFinder';
import EntityRegister from './EntityRegister';

interface EntityStorage<T> extends EntityRegister<T>, EntityFinder<T> {
}

export default EntityStorage;
