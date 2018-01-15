import VisibilitySystem from './VisibilitySystem';
import {DisplayableEntity, Region} from '../../alias';
import {asSequence} from 'sequency';

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

  collidesWith(entity: DisplayableEntity) {
    let bounds = entity.getDisplayWorldBounds();
    return this.collidesIf(other => {
      if (entity === other) {
        return false;
      }
      return other.getDisplayWorldBounds().intersects(bounds);
    });
  }

  collidesIf(callback: (entity: DisplayableEntity) => boolean) {
    return asSequence(this.currentRegions)
        .flatMap(region => asSequence(region.container))
        .any(callback);
  }
}

export default CollisionDetectionSystem;
