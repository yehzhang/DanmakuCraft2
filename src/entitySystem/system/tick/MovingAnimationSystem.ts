import MovingAnimation from '../../component/MovingAnimation';
import Motion from '../../component/Motion';
import TickSystem from './TickSystem';

class MovingAnimationSystem implements TickSystem<Motion & MovingAnimation> {
  update(entity: Motion & MovingAnimation) {
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

  tick() {
  }
}

export default MovingAnimationSystem;
