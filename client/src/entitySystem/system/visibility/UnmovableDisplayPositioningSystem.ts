import {toWorldCoordinateOffset2d} from '../../../law/space';
import PhysicalConstants from '../../../PhysicalConstants';
import Point from '../../../util/syntax/Point';
import {DisplayableEntity, StationaryEntity} from '../../alias';
import Display from '../../component/Display';
import VisibilitySystem from './VisibilitySystem';

/**
 * Positions displays relative to the anchor, taking into consideration of the borderless world.
 */
class UnmovableDisplayPositioningSystem implements VisibilitySystem<StationaryEntity & Display> {
  constructor(private readonly anchor: DisplayableEntity) {
  }

  enter(entity: StationaryEntity & Display) {
    const offset = toWorldCoordinateOffset2d(
        entity.coordinates,
        this.anchor.coordinates,
        PhysicalConstants.WORLD_SIZE);
    entity.display.position = Point.add(this.anchor.display.position, offset);
  }

  update(entity: StationaryEntity & Display) {
  }

  exit(entity: StationaryEntity & Display) {
  }

  finish() {
  }
}

export default UnmovableDisplayPositioningSystem;
