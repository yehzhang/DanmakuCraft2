import {DisplayableEntity, Region} from '../../alias';
import ExistenceSystem from './ExistenceSystem';

class AddChildToRegionSystem implements ExistenceSystem<Region<DisplayableEntity>> {
  adopt(region: Region<DisplayableEntity>) {
    for (let entity of region.container) {
      entity.display.position = entity.asOffsetTo(region.coordinates);
      region.display.addChild(entity.display);
    }
  }

  abandon(region: Region<DisplayableEntity>) {
  }
}

export default AddChildToRegionSystem;
