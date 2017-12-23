import BaseExistenceSystem from './BaseExistenceSystem';
import {Region, Renderable} from '../../alias';

class CollisionDetectionSystem<T extends PIXI.DisplayObjectContainer = PIXI.DisplayObjectContainer>
    extends BaseExistenceSystem<Region<Renderable<T>>> {
  constructor(private currentRegions: Set<Region<Renderable<T>>> = new Set()) {
    super();
  }

  enter(region: Region<Renderable<T>>) {
    this.currentRegions.add(region);
  }

  exit(region: Region<Renderable<T>>) {
    this.currentRegions.delete(region);
  }

  finish() {
  }

  collidesWith(display: PIXI.DisplayObjectContainer) {
    let bounds = display.getBounds();
    return this.collidesIf(entity => entity.display.getBounds().intersects(bounds, 0));
  }

  collidesIf(callback: (entity: Renderable<T>) => boolean) {
    for (let region of this.currentRegions) {
      for (let entity of region.container) {
        if (callback(entity)) {
          return true;
        }
      }
    }
    return false;
  }
}

export default CollisionDetectionSystem;
