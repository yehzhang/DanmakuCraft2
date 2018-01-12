import Controller from './Controller';
import {Phaser} from '../util/alias/phaser';

type ValidInputKeyNames = 'up' | 'down' | 'left' | 'right' | 'w' | 's' | 'a' | 'd';

class InputController implements Controller {
  private keys: { [keyName in ValidInputKeyNames]: Phaser.Key };

  constructor(
      game: Phaser.Game,
      private isGameFocused: boolean = true,
      private isReceivingInput: boolean = true) {
    this.keys = game.input.keyboard.addKeys({
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

    game.onBlur.add(() => {
      this.isGameFocused = false;
      this.resetKeysStates();
    });
    game.onFocus.add(() => this.isGameFocused = true);
  }

  get moveLeft() {
    if (!this.canMove()) {
      return false;
    }
    return this.isLeftKeyDown() && !this.isRightKeyDown();
  }

  get moveRight() {
    if (!this.canMove()) {
      return false;
    }
    return !this.isLeftKeyDown() && this.isRightKeyDown();
  }

  get moveUp() {
    if (!this.canMove()) {
      return false;
    }
    return this.isUpKeyDown() && !this.isDownKeyDown();
  }

  get moveDown() {
    if (!this.canMove()) {
      return false;
    }
    return !this.isUpKeyDown() && this.isDownKeyDown();
  }

  receiveInput() {
    this.isReceivingInput = true;
    return this;
  }

  ignoreInput() {
    this.isReceivingInput = false;
    return this;
  }

  private resetKeysStates() {
    for (let key of Object.values(this.keys)) {
      key.reset(false);
    }
  }

  private canMove() {
    return this.isGameFocused && this.isReceivingInput;
  }

  private isLeftKeyDown() {
    return this.keys.left.isDown || this.keys.a.isDown;
  }

  private isRightKeyDown() {
    return this.keys.right.isDown || this.keys.d.isDown;
  }

  private isUpKeyDown() {
    return this.keys.up.isDown || this.keys.w.isDown;
  }

  private isDownKeyDown() {
    return this.keys.down.isDown || this.keys.s.isDown;
  }
}

export default InputController;
