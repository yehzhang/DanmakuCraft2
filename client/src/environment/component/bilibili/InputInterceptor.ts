import {Phaser} from '../../../util/alias/phaser';
import {bindFirst} from '../../util';
import Widgets from './Widgets';
import ClickTriggeredFocuser from './ClickTriggeredFocuser';

class InputInterceptor {
  private keyboard: KeyboardExtended;

  constructor(
      keyboard: Phaser.Keyboard,
      private focuser: ClickTriggeredFocuser,
      private widgets: Widgets) {
    this.keyboard = keyboard as KeyboardExtended;
    this.interceptKeyboardInputs();
  }

  private interceptKeyboardInputs() {
    window.removeEventListener('keydown', this.keyboard._onKeyDown, false);
    window.removeEventListener('keyup', this.keyboard._onKeyUp, false);
    window.removeEventListener('keypress', this.keyboard._onKeyPress, false);
    this.handleKeyEvents($(window));
  }

  private handleKeyEvents(target: JQuery<HTMLElement>) {
    bindFirst(target, 'keydown', event => {
      if (event.which === Phaser.KeyCode.ENTER) {
        return;
      }
      this.interceptIfGameIsFocused(event, () => this.keyboard.processKeyDown(event));
    });
    target.on('keydown', event => {
      if (event.which === Phaser.KeyCode.ENTER) {
        this.switchFocusBetweenGameAndText();
      }
    });

    bindFirst(target, 'keyup', event => {
      this.interceptIfGameIsFocused(event, () => this.keyboard.processKeyUp(event));
    });
    bindFirst(target, 'keypress', event => {
      this.interceptIfGameIsFocused(event, () => this.keyboard.processKeyPress(event));
    });
  }

  private switchFocusBetweenGameAndText() {
    if (this.focuser.isFocused(this.widgets.videoFrame)) {
      this.focuser.focus(this.widgets.textInput);
    } else if (this.focuser.isFocused(this.widgets.textInput)) {
      this.focuser.focus(this.widgets.videoFrame);
    }
  }

  private interceptIfGameIsFocused(event: JQuery.Event, callback: (event: JQuery.Event) => void) {
    if (!this.focuser.isFocused(this.widgets.videoFrame)) {
      return;
    }

    callback(event);

    event.stopImmediatePropagation();
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
