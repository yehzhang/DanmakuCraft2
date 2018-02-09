import VisibilitySystem from './VisibilitySystem';
import {DisplayableEntity, StationaryEntity} from '../../alias';
import Point from '../../../util/syntax/Point';
import Display from '../../component/Display';
import {toWorldCoordinateOffset2d} from '../../../law/space';
import PhysicalConstants from '../../../PhysicalConstants';

class UnmovableDisplayPositioningSystem implements VisibilitySystem<StationaryEntity & Display> {
  constructor(private anchor: DisplayableEntity) {
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
