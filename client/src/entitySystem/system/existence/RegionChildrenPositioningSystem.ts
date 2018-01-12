import {Region, RenderableEntity} from '../../alias';
import ExistenceSystem from './ExistenceSystem';

class RegionChildrenPositioningSystem implements ExistenceSystem<Region<RenderableEntity>> {
  adopt(region: Region<RenderableEntity>) {
    for (let entity of region.container) {
      entity.display.position = entity.asOffsetTo(region.coordinates);
      region.display.addChild(entity.display);
    }
  }

  abandon(region: Region<RenderableEntity>) {
  }
}

export default RegionChildrenPositioningSystem;
