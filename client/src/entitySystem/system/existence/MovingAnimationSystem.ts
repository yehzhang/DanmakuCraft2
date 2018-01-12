import MovingAnimation from '../../component/MovingAnimation';
import Motion from '../../component/Motion';
import ExistenceSystem from './ExistenceSystem';

class MovingAnimationSystem implements ExistenceSystem<Motion & MovingAnimation> {
  enter(entity: Motion & MovingAnimation) {
  }

  update(entity: Motion & MovingAnimation) {
    if (entity.movedOffset.isZero()) {
      if (entity.movingAnimation.isPlaying) {
        entity.movingAnimation.stop(true);
      }
    } else {
      if (!entity.movingAnimation.isPlaying) {
        entity.movingAnimation.play();
        entity.movingAnimation.frame = 1;
      }
    }
  }

  exit(entity: Motion & MovingAnimation) {
  }

  finish() {
  }
}

export default MovingAnimationSystem;
