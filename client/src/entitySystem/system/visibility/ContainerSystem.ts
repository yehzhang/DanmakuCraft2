import VisibilitySystem from './VisibilitySystem';
import Iterator from '../../../util/syntax/Iterator';
import Container from '../../../util/entityStorage/Container';

class ContainerSystem<T> implements VisibilitySystem<T>, Container<T> {
  constructor(private currentEntities: Set<T> = new Set()) {
  }

  enter(entity: T) {
    this.currentEntities.add(entity);
  }

  update() {
  }

  exit(entity: T) {
    this.currentEntities.delete(entity);
  }

  finish() {
  }

  [Symbol.iterator]() {
    return Iterator.of(this.currentEntities);
  }

  count() {
    return this.currentEntities.size;
  }
}

export default ContainerSystem;
