import VisibilitySystem from './VisibilitySystem';
import {DisplayableEntity, Region} from '../../alias';
import {asSequence} from 'sequency';
import {PIXI} from '../../../util/alias/phaser';

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

  collidesWith(display: PIXI.DisplayObjectContainer) {
    let bounds = display.getBounds();
    return this.collidesIf(entity => {
      if (display === entity.display) {
        return false;
      }
      return entity.display.getBounds().intersects(bounds);
    });
  }

  collidesIf(callback: (entity: DisplayableEntity) => boolean) {
    return asSequence(this.currentRegions)
        .flatMap(region => asSequence(region.container))
        .any(callback);
  }
}

export default CollisionDetectionSystem;
