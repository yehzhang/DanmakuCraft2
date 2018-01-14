import {Phaser} from '../../util/alias/phaser';

class Blink {
  constructor(private blinkTween: Phaser.Tween | null = null) {
  }

  hasBlink() {
    return this.blinkTween != null;
  }

  isBlinking() {
    if (this.blinkTween == null) {
      return false;
    }
    return this.blinkTween.isRunning;
  }

  releaseBlink() {
    if (this.blinkTween == null) {
      throw new TypeError('Blink is already released');
    }

    this.blinkTween.stop();
    this.blinkTween = null;
  }

  setBlink(blinkTween: Phaser.Tween) {
    if (this.blinkTween != null) {
      throw new TypeError('Blink is already set');
    }
    this.blinkTween = blinkTween;
  }
}

export default Blink;
