import TickSystem from './TickSystem';
import {MovableEntity, Renderable} from '../../alias';

class MoveDisplaySystem implements TickSystem {
  constructor(private anchor: MovableEntity & Renderable) {
  }

  tick() {
    this.anchor.display.position.add(
        this.anchor.movedOffset.x, this.anchor.movedOffset.y);
  }
}

export default MoveDisplaySystem;
