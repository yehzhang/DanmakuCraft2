import Display from '../../component/Display';
import Motion from '../../component/Motion';
import TickSystem from './TickSystem';

class DisplayMoveSystem implements TickSystem<Display & Motion> {
  update(entity: Display & Motion): void {
    if (!entity.movedThisTick) {
      return;
    }
    entity.display.position.add(entity.movedOffsetThisTick.x, entity.movedOffsetThisTick.y);
  }

  tick() {
  }
}

export default DisplayMoveSystem;
