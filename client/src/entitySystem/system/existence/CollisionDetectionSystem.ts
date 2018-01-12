import ExistenceSystem from './ExistenceSystem';
import {Region, Renderable} from '../../alias';
import {asSequence} from 'sequency';
import {PIXI} from '../../../util/alias/phaser';

class CollisionDetectionSystem<T extends PIXI.DisplayObjectContainer = PIXI.DisplayObjectContainer>
    implements ExistenceSystem<Region<Renderable<T>>> {
  constructor(private currentRegions: Set<Region<Renderable<T>>> = new Set()) {
  }

  enter(region: Region<Renderable<T>>) {
    this.currentRegions.add(region);
  }

  update(region: Region<Renderable<T>>) {
  }

  exit(region: Region<Renderable<T>>) {
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

  collidesIf(callback: (entity: Renderable<T>) => boolean) {
    return asSequence(this.currentRegions)
        .flatMap(region => asSequence(region.container))
        .any(callback);
  }
}

export default CollisionDetectionSystem;
