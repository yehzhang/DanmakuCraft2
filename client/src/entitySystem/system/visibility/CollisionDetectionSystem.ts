import VisibilitySystem from './VisibilitySystem';
import {DisplayableEntity} from '../../alias';
import {asSequence} from 'sequency';
import Rectangle from '../../../util/syntax/Rectangle';
import Container from '../../../util/entityStorage/Container';

class CollisionDetectionSystem<T extends DisplayableEntity = DisplayableEntity>
    implements VisibilitySystem<Container<T>> {
  constructor(private currentContainers: Set<Container<T>> = new Set()) {
  }

  enter(container: Container<T>) {
    this.currentContainers.add(container);
  }

  update(container: Container<T>) {
  }

  exit(container: Container<T>) {
    this.currentContainers.delete(container);
  }

  finish() {
  }

  static intersectsNegative(bounds: Rectangle, other: Rectangle) {
    if (bounds.right < other.x
        || bounds.bottom < other.y
        || bounds.x > other.right
        || bounds.y > other.bottom) {
      return false;
    }
    return true;
  }

  collidesIn(bounds: Rectangle) {
    return this.collidesIf(entity => CollisionDetectionSystem.intersectsNegative(
        bounds, entity.getDisplayWorldBounds()));
  }

  collidesIf(callback: (entity: DisplayableEntity) => boolean) {
    return asSequence(this.currentContainers).flatten().any(callback);
  }
}

export default CollisionDetectionSystem;
