import ExistenceSystem from './ExistenceSystem';
import {Renderable, RenderableEntity, StationaryEntity} from '../../alias';
import Point from '../../../util/syntax/Point';

class UnmovableDisplayPositioningSystem implements ExistenceSystem<StationaryEntity & Renderable> {
  constructor(private anchor: RenderableEntity) {
  }

  enter(entity: StationaryEntity & Renderable) {
    entity.display.position =
        Point.add(entity.asOffsetTo(this.anchor.coordinates), this.anchor.display.position);
  }

  update(entity: StationaryEntity & Renderable) {
  }

  exit(entity: StationaryEntity & Renderable) {
  }

  finish() {
  }
}

export default UnmovableDisplayPositioningSystem;
