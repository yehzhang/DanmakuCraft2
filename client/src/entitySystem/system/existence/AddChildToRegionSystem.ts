import {toWorldCoordinateOffset2d} from '../../../law/space';
import PhysicalConstants from '../../../PhysicalConstants';
import {DisplayableEntity, DisplayableRegion} from '../../alias';
import ExistenceSystem from './ExistenceSystem';

class AddChildToRegionSystem implements ExistenceSystem<DisplayableRegion<DisplayableEntity>> {
  static adopt<T extends DisplayableEntity>(entity: T, region: DisplayableRegion<T>) {
    entity.display.position = toWorldCoordinateOffset2d(
        entity.coordinates,
        region.coordinates,
        PhysicalConstants.WORLD_SIZE);
    region.display.addChild(entity.display);
  }

  adopt(region: DisplayableRegion<DisplayableEntity>) {
    for (const entity of region) {
      AddChildToRegionSystem.adopt(entity, region);
    }
  }

  abandon(region: DisplayableRegion<DisplayableEntity>) {
  }
}

export default AddChildToRegionSystem;
