import VisibilitySystem from './VisibilitySystem';
import {DisplayableEntity, Region} from '../../alias';
import {asSequence} from 'sequency';
import Rectangle from '../../../util/syntax/Rectangle';

class CollisionDetectionSystem<T extends DisplayableEntity = DisplayableEntity>
    implements VisibilitySystem<Region<T>> {
  constructor(private currentRegions: Set<Region<T>> = new Set()) {
  }

  enter(region: Region<T>) {
    this.currentRegions.add(region);
  }

  update(region: Region<T>) {
  }

  exit(region: Region<T>) {
    this.currentRegions.delete(region);
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
    return asSequence(this.currentRegions)
        .flatMap(region => asSequence(region.container))
        .any(callback);
  }
}

export default CollisionDetectionSystem;
