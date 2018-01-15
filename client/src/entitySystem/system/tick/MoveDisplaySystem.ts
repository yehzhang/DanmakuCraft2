import TickSystem from './TickSystem';
import {MovableEntity} from '../../alias';
import Display from '../../component/Display';

class MoveDisplaySystem implements TickSystem {
  constructor(private anchor: MovableEntity & Display) {
  }

  tick() {
    this.anchor.display.position.add(this.anchor.movedOffset.x, this.anchor.movedOffset.y);
  }
}

export default MoveDisplaySystem;
