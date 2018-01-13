import VisibilitySystem from './VisibilitySystem';
import {DisplayableEntity, StationaryEntity} from '../../alias';
import Point from '../../../util/syntax/Point';
import Display from '../../component/Display';

class UnmovableDisplayPositioningSystem implements VisibilitySystem<StationaryEntity & Display> {
  constructor(private anchor: DisplayableEntity) {
  }

  enter(entity: StationaryEntity & Display) {
    entity.display.position =
        Point.add(entity.asOffsetTo(this.anchor.coordinates), this.anchor.display.position);
  }

  update(entity: StationaryEntity & Display) {
  }

  exit(entity: StationaryEntity & Display) {
  }

  finish() {
  }
}

export default UnmovableDisplayPositioningSystem;
