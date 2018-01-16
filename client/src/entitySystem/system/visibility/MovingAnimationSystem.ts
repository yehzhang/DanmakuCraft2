import MovingAnimation from '../../component/MovingAnimation';
import Motion from '../../component/Motion';
import VisibilitySystem from './VisibilitySystem';

class MovingAnimationSystem implements VisibilitySystem<Motion & MovingAnimation> {
  enter(entity: Motion & MovingAnimation) {
  }

  update(entity: Motion & MovingAnimation) {
    if (entity.isMoving && !entity.movingAnimation.isPlaying) {
      entity.movingAnimation.play();
      entity.movingAnimation.frame = 1;
    } else if (!entity.isMoving && entity.movingAnimation.isPlaying) {
      entity.movingAnimation.stop(true);
    }
  }

  exit(entity: Motion & MovingAnimation) {
  }

  finish() {
  }
}

export default MovingAnimationSystem;
