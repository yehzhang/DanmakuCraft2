import Display from '../../component/Display';
import Motion from '../../component/Motion';
import TickSystem from './TickSystem';

class DisplayMoveSystem implements TickSystem<Display & Motion> {
  update(entity: Display & Motion): void {
    if (!entity.movedThisTick) {
      return;
    }
    entity.display.position.add(entity.movedDistanceThisTick.x, entity.movedDistanceThisTick.y);
  }

  tick() {
  }
}

export default DisplayMoveSystem;
