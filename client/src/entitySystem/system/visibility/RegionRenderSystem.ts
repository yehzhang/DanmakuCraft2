import {Region, RenderableEntity} from '../../alias';
import VisibilitySystem from './VisibilitySystem';

class RegionRenderSystem implements VisibilitySystem<Region<RenderableEntity>> {
  enter(region: Region<RenderableEntity>) {
    for (let entity of region.container) {
      entity.display.position = entity.asOffsetTo(region.coordinates);
      region.display.addChild(entity.display);
    }
  }

  update(region: Region<RenderableEntity>) {
  }

  exit(region: Region<RenderableEntity>) {
    // region.display.removeChildren();
  }

  finish() {
  }
}

export default RegionRenderSystem;
