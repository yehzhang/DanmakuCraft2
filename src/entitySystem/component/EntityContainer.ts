import Entity from '../Entity';
import Container from '../../util/entityFinder/Container';

class EntityContainer<T extends Entity> {
  constructor(public container: Container<T>) {
  }
}

export default EntityContainer;
