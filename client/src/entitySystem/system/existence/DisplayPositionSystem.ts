import ExistenceSystem from './ExistenceSystem';
import {RenderableEntity} from '../../alias';
import Point from '../../../util/syntax/Point';

class DisplayPositionSystem implements ExistenceSystem<RenderableEntity> {
  constructor(private anchor: RenderableEntity) {
  }

  enter(entity: RenderableEntity) {
    entity.display.position =
        Point.add(entity.asOffsetTo(this.anchor.coordinates), this.anchor.display.position);
  }

  exit(entity: RenderableEntity) {
  }

  finish() {
  }
}

export default DisplayPositionSystem;
