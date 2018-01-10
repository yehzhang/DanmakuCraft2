import Controller from './Controller';
import {Phaser} from '../util/alias/phaser';

type ValidInputKeyNames = 'up' | 'down' | 'left' | 'right' | 'w' | 's' | 'a' | 'd';

class InputController implements Controller {
  private keys: { [keyName in ValidInputKeyNames]: Phaser.Key };

  constructor(private input: Phaser.Input) {
    this.keys = input.keyboard.addKeys({
      up: Phaser.KeyCode.UP,
      down: Phaser.KeyCode.DOWN,
      left: Phaser.KeyCode.LEFT,
      right: Phaser.KeyCode.RIGHT,
      w: Phaser.KeyCode.W,
      s: Phaser.KeyCode.S,
      a: Phaser.KeyCode.A,
      d: Phaser.KeyCode.D,
    });

    // TODO support for pointer
    // this.game.input.
  }

  get moveLeft() {
    return this.left && !this.right;
  }

  get moveRight() {
    return !this.left && this.right;
  }

  get moveUp() {
    return this.up && !this.down;
  }

  get moveDown() {
    return !this.up && this.down;
  }

  get left() {
    return this.keys.left.isDown || this.keys.a.isDown;
  }

  get right() {
    return this.keys.right.isDown || this.keys.d.isDown;
  }

  get up() {
    return this.keys.up.isDown || this.keys.w.isDown;
  }

  get down() {
    return this.keys.down.isDown || this.keys.s.isDown;
  }

  receiveInput() {
    this.input.enabled = true;
    return this;
  }

  ignoreInput() {
    this.input.enabled = false;
    return this;
  }
}

export default InputController;
