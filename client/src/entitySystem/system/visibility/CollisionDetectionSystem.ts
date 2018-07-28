import {asSequence} from 'sequency';
import Rectangle from '../../../util/syntax/Rectangle';
import {DisplayableEntity} from '../../alias';
import VisibilitySystem from './VisibilitySystem';

class CollisionDetectionSystem<T extends DisplayableEntity = DisplayableEntity>
    implements VisibilitySystem<T> {
  constructor(private activeEntities: Set<T> = new Set()) {
  }

  enter(entity: T) {
    this.activeEntities.add(entity);
  }

  update(entity: T) {
  }

  exit(entity: T) {
    this.activeEntities.delete(entity);
  }

  finish() {
  }

  collidesIn(bounds: Rectangle): boolean {
    return this.collidesIf(entity => intersectsNegative(bounds, entity.getDisplayWorldBounds()));
  }

  collidesIf(callback: (entity: DisplayableEntity) => boolean): boolean {
    return asSequence(this.activeEntities).any(callback);
  }
}

function intersectsNegative(bounds: Rectangle, other: Rectangle): boolean {
  if (bounds.right < other.x
      || bounds.bottom < other.y
      || bounds.x > other.right
      || bounds.y > other.bottom) {
    return false;
  }
  return true;
}

export default CollisionDetectionSystem;
