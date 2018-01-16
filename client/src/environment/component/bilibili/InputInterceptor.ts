import {Phaser} from '../../../util/alias/phaser';
import GameContainerMonitor from './GameContainerFocuser';
import {bindFirst} from '../../util';

class InputInterceptor {
  private keyboard: KeyboardExtended;

  constructor(
      keyboard: Phaser.Keyboard,
      private gameContainerFocuser: GameContainerMonitor,
      private commentTextInput: JQuery<HTMLElement>) {
    this.keyboard = keyboard as KeyboardExtended;
    this.interceptKeyboardInputs();
  }

  private interceptKeyboardInputs() {
    window.removeEventListener('keydown', this.keyboard._onKeyDown, false);
    window.removeEventListener('keyup', this.keyboard._onKeyUp, false);
    window.removeEventListener('keypress', this.keyboard._onKeyPress, false);

    bindFirst($(window), 'keydown', event => {
      if (event.which === Phaser.KeyCode.ENTER) {
        return;
      }
      this.interceptIfGameIsFocused(event, () => this.keyboard.processKeyDown(event));
    });
    $(window).on('keydown', event => {
      if (event.which === Phaser.KeyCode.ENTER) {
        this.switchFocusBetweenGameAndText(event);
      }
    });

    bindFirst($(window), 'keyup', event => {
      this.interceptIfGameIsFocused(event, () => this.keyboard.processKeyUp(event));
    });
    bindFirst($(window), 'keypress', event => {
      this.interceptIfGameIsFocused(event, () => this.keyboard.processKeyPress(event));
    });
  }

  private static stop(event: JQuery.Event) {
    event.stopImmediatePropagation();
  }

  private switchFocusBetweenGameAndText(event: JQuery.Event) {
    if (this.gameContainerFocuser.isFocused()) {
      this.commentTextInput.focus();
    } else if (this.isCommentTextInputFocused()) {
      this.gameContainerFocuser.focus();
    }
  }

  private isCommentTextInputFocused() {
    return this.commentTextInput.is(':focus');
  }

  private interceptIfGameIsFocused(event: JQuery.Event, callback: (event: JQuery.Event) => void) {
    if (!this.gameContainerFocuser.isFocused()) {
      return;
    }

    callback(event);

    InputInterceptor.stop(event);
  }
}

export default InputInterceptor;

interface KeyboardExtended extends Phaser.Keyboard {
  _onKeyDown(): void;

  _onKeyUp(): void;

  _onKeyPress(): void;

  processKeyDown(event: Event | JQuery.Event): void;

  processKeyUp(event: Event | JQuery.Event): void;

  processKeyPress(event: Event | JQuery.Event): void;
}
