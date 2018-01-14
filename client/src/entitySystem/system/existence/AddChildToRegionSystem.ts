import {DisplayableEntity, Region} from '../../alias';
import ExistenceSystem from './ExistenceSystem';

class AddChildToRegionSystem implements ExistenceSystem<Region<DisplayableEntity>> {
  static adopt<T extends DisplayableEntity>(entity: T, region: Region<T>) {
    entity.display.position = entity.asOffsetTo(region.coordinates);
    region.display.addChild(entity.display);
  }

  adopt(region: Region<DisplayableEntity>) {
    for (let entity of region.container) {
      AddChildToRegionSystem.adopt(entity, region);
    }
  }

  abandon(region: Region<DisplayableEntity>) {
  }
}

export default AddChildToRegionSystem;
