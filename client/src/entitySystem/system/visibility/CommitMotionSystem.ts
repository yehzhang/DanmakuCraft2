import VisibilitySystem from './VisibilitySystem';
import Motion from '../../component/Motion';

class CommitMotionSystem implements VisibilitySystem<Motion> {
  enter(motion: Motion) {
  }

  update(motion: Motion, time: Phaser.Time) {
    motion.movedOffset.setTo(0, 0);
  }

  exit(motion: Motion) {
  }

  finish() {
  }
}

export default CommitMotionSystem;
