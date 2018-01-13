import VisibilitySystem from './VisibilitySystem';
import {Region} from '../../alias';
import {asSequence} from 'sequency';
import {PIXI} from '../../../util/alias/phaser';
import Display from '../../component/Display';

class CollisionDetectionSystem<T extends PIXI.DisplayObjectContainer = PIXI.DisplayObjectContainer>
    implements VisibilitySystem<Region<Display<T>>> {
  constructor(private currentRegions: Set<Region<Display<T>>> = new Set()) {
  }

  enter(region: Region<Display<T>>) {
    this.currentRegions.add(region);
  }

  update(region: Region<Display<T>>) {
  }

  exit(region: Region<Display<T>>) {
    this.currentRegions.delete(region);
  }

  finish() {
  }

  collidesWith(display: PIXI.DisplayObjectContainer) {
    let bounds = display.getBounds();
    return this.collidesIf(entity => {
      if (entity.display === display) {
        return false;
      }
      return entity.display.getBounds().intersects(bounds);
    });
  }

  collidesIf(callback: (entity: Display<T>) => boolean) {
    return asSequence(this.currentRegions)
        .flatMap(region => asSequence(region.container))
        .any(callback);
  }
}

export default CollisionDetectionSystem;
