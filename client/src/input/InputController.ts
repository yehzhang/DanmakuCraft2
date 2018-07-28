import {Phaser} from '../util/alias/phaser';
import Controller from './Controller';
import Input from './Input';

class InputController implements Controller {
  constructor(
      game: Phaser.Game,
      private readonly input: Input,
      private isGameFocused: boolean = true,
      private isReceivingInput: boolean = true) {
    game.onBlur.add(() => this.isGameFocused = false);
    game.onFocus.add(() => this.isGameFocused = true);
  }

  get moveLeft() {
    if (!this.canMove()) {
      return false;
    }
    return this.input.isLeftActive() && !this.input.isRightActive();
  }

  get moveRight() {
    if (!this.canMove()) {
      return false;
    }
    return !this.input.isLeftActive() && this.input.isRightActive();
  }

  get moveUp() {
    if (!this.canMove()) {
      return false;
    }
    return this.input.isUpActive() && !this.input.isDownActive();
  }

  get moveDown() {
    if (!this.canMove()) {
      return false;
    }
    return !this.input.isUpActive() && this.input.isDownActive();
  }

  receiveInput() {
    this.isReceivingInput = true;
    return this;
  }

  ignoreInput() {
    this.isReceivingInput = false;
    return this;
  }

  private canMove() {
    return this.isGameFocused && this.isReceivingInput;
  }
}

export default InputController;
