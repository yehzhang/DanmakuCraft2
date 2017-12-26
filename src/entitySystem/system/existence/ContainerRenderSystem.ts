import {Region, RenderableEntity} from '../../alias';
import BaseExistenceSystem from './BaseExistenceSystem';
import Point from '../../../util/syntax/Point';

class ContainerRenderSystem extends BaseExistenceSystem<Region<RenderableEntity>> {
  constructor(
      private parentDisplay: PIXI.DisplayObject, private container: PIXI.DisplayObjectContainer) {
    super();
  }

  enter(region: Region<RenderableEntity>) {
    for (let entity of region.container) {
      region.display.addChild(entity.display);
      entity.display.position = entity.asOffsetTo(region.coordinates);
    }

    this.container.addChild(region.display);
    region.display.position =
        Point.add(region.asOffsetTo(this.parentDisplay.position), this.parentDisplay.position);
  }

  exit(region: Region<RenderableEntity>) {
    this.container.removeChild(region.display);
    region.display.removeChildren();
  }

  finish() {
  }
}

export default ContainerRenderSystem;
