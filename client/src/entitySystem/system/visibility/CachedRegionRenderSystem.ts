import RegionRenderSystem from './RegionRenderSystem';
import {Region, RenderableEntity} from '../../alias';

class CachedRegionRenderSystem extends RegionRenderSystem {
  enter(region: Region<RenderableEntity>) {
    if (region.display.cacheAsBitmap) {
      return;
    }

    region.display.cacheAsBitmap = true;

    region.display.removeChildren();
  }
}

export default CachedRegionRenderSystem;
