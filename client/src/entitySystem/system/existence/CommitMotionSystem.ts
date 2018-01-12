import ExistenceSystem from './ExistenceSystem';
import Motion from '../../component/Motion';

class CommitMotionSystem implements ExistenceSystem<Motion> {
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
