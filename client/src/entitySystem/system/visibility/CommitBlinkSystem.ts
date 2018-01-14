import VisibilitySystem from './VisibilitySystem';
import Blink from '../../component/Blink';

class CommitBlinkSystem implements VisibilitySystem<Blink> {
  enter(blink: Blink) {
  }

  update(blink: Blink, time: Phaser.Time) {
  }

  exit(blink: Blink) {
    if (blink.hasBlink()) {
      return;
    }
    if (blink.isBlinking()) {
      return;
    }
    blink.releaseBlink();
  }

  finish() {
  }
}

export default CommitBlinkSystem;
