import MovingAnimation from '../../component/MovingAnimation';
import Motion from '../../component/Motion';
import BaseTickSystem from './BaseTickSystem';

class MovingAnimationSystem extends BaseTickSystem<Motion & MovingAnimation> {
  tick(entity: Motion & MovingAnimation): void {
    if (entity.movedThisTick) {
      if (!entity.movingAnimation.isPlaying) {
        entity.movingAnimation.play();
        entity.movingAnimation.frame = 1;
      }
      entity.movedThisTick = false;
    } else {
      if (entity.movingAnimation.isPlaying) {
        entity.movingAnimation.stop(true);
      }
    }
  }
}

export default MovingAnimationSystem;
