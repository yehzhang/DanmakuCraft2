import {DisplayableEntity, DisplayableRegion} from '../../alias';
import VisibilitySystem from './VisibilitySystem';
import {toWorldCoordinateOffset2d} from '../../../law/space';
import PhysicalConstants from '../../../PhysicalConstants';

class AddChildToRegionSystem implements VisibilitySystem<DisplayableRegion<DisplayableEntity>> {
  enter(region: DisplayableRegion<DisplayableEntity>) {
    for (let entity of region) {
      region.display.addChild(entity.display);
      entity.display.position = toWorldCoordinateOffset2d(
          entity.coordinates,
          region.coordinates,
          PhysicalConstants.WORLD_SIZE);
    }
  }

  update(region: DisplayableRegion<DisplayableEntity>, time: Phaser.Time) {
  }

  exit(region: DisplayableRegion<DisplayableEntity>) {
  }

  finish() {
  }
}

export default AddChildToRegionSystem;
