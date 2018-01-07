import ExistenceSystem from './ExistenceSystem';
import {Region, Renderable} from '../../alias';
import PIXI = require('phaser-ce-type-updated/build/custom/pixi');

class CollisionDetectionSystem<T extends PIXI.DisplayObjectContainer = PIXI.DisplayObjectContainer>
    implements ExistenceSystem<Region<Renderable<T>>> {
  constructor(private currentRegions: Set<Region<Renderable<T>>> = new Set()) {
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
    return this.collidesIf(entity => entity.display.getBounds().intersects(bounds));
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
