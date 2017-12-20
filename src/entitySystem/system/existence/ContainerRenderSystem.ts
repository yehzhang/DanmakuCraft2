import {Region, RenderableEntity} from '../../alias';
import BaseExistenceSystem from './BaseExistenceSystem';

class ContainerRenderSystem extends BaseExistenceSystem<Region<RenderableEntity>> {
  constructor(private parentDisplay: PIXI.DisplayObjectContainer) {
    super();
  }

  enter(region: Region<RenderableEntity>) {
    for (let entity of region.container) {
      region.display.addChild(entity.display);
      entity.display.position = entity.asOffsetTo(region.coordinates);
    }

    this.parentDisplay.addChild(region.display);
  }

  exit(region: Region<RenderableEntity>) {
    this.parentDisplay.removeChild(region.display);
    region.display.removeChildren();
  }

  finish() {
  }
}

export default ContainerRenderSystem;
