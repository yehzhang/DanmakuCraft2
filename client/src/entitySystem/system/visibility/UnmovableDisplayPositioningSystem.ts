import VisibilitySystem from './VisibilitySystem';
import {StationaryEntity} from '../../alias';
import Point from '../../../util/syntax/Point';
import Entity from '../../Entity';
import Display from '../../component/Display';

class UnmovableDisplayPositioningSystem implements VisibilitySystem<StationaryEntity & Display> {
  constructor(private anchor: Entity & Display) {
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
