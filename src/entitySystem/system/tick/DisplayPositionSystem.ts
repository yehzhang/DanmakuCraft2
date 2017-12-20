import Display from '../../component/Display';
import Motion from '../../component/Motion';
import BaseTickSystem from './BaseTickSystem';

class DisplayMoveSystem extends BaseTickSystem<Display & Motion> {
  tick(entity: Display & Motion): void {
    if (!entity.movedThisTick) {
      return;
    }

    entity.display.position.x += entity.movedDistanceThisTick.x;
    entity.display.position.y += entity.movedDistanceThisTick.y;
  }
}

export default DisplayMoveSystem;
