import {Phaser} from '../util/alias/phaser';
import Input from './Input';

class PhaserInput implements Input {
  constructor(
      game: Phaser.Game,
      private readonly keys = game.input.keyboard.addKeys({
        up: Phaser.KeyCode.UP,
        down: Phaser.KeyCode.DOWN,
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        w: Phaser.KeyCode.W,
        s: Phaser.KeyCode.S,
        a: Phaser.KeyCode.A,
        d: Phaser.KeyCode.D,
        enter: Phaser.KeyCode.ENTER,
      })) {
    // TODO support for pointer / cursor
    // this.game.input.

    game.onBlur.add(() => this.resetKeysStates());
  }

  isLeftActive() {
    return this.keys.left.isDown || this.keys.a.isDown;
  }

  isRightActive() {
    return this.keys.right.isDown || this.keys.d.isDown;
  }

  isUpActive() {
    return this.keys.up.isDown || this.keys.w.isDown;
  }

  isDownActive() {
    return this.keys.down.isDown || this.keys.s.isDown;
  }

  isEnterActive() {
    return this.keys.enter.isDown;
  }

  private resetKeysStates() {
    for (const key of Object.values(this.keys)) {
      key.reset(false);
    }
  }
}

export default PhaserInput;
