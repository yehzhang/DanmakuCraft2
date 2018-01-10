import {Phaser} from '../../../util/alias/phaser';
import {bindFirst} from '../../util';
import GameContainerProvider from '../../interface/GameContainerProvider';

class InputInterceptor {
  constructor(
      private keyboard: Phaser.Keyboard,
      private gameContainerProvider: GameContainerProvider,
      private textInput: JQuery<HTMLElement>) {
    this.interceptKeyboardInputs();
  }

  private static onEveryOccurrence(eventType: string, callback: (event: JQuery.Event) => void) {
    bindFirst($(window), eventType, callback);
  }

  private static isEnterKeyDown(event: JQuery.Event) {
    return event.which === Phaser.KeyCode.ENTER;
  }

  private interceptKeyboardInputs() {
    InputInterceptor.onEveryOccurrence('keydown', event => {
      if (!InputInterceptor.isEnterKeyDown(event)) {
        this.interceptIfTextInputIsFocused(event, () => this.keyboard.processKeyDown(event as any));
        return;
      }

      // TODO check if text input focused first. if true, intercept phaser instead of not phaser
      if (this.isTextInputFocused()) {
        let inputValue = this.textInput.val();
        if (inputValue && inputValue.toString()) {
          // Let player handle it
          return;
        }

        // Focus on game (window)
        this.textInput.blur();

        event.stopImmediatePropagation();
      } else {
        // TODO focus on text input
      }

      // TODO Fix play progress bar and play button

      // TODO Let volume bar actually controls
    });
    InputInterceptor.onEveryOccurrence('keyup', event => {
      this.interceptIfTextInputIsFocused(event, () => this.keyboard.processKeyUp(event as any));
    });
    InputInterceptor.onEveryOccurrence('keypress', event => {
      this.interceptIfTextInputIsFocused(event, () => this.keyboard.processKeyPress(event as any));
    });
  }

  private interceptIfTextInputIsFocused(
      event: JQuery.Event, callback: (event: JQuery.Event) => void) {
    if (this.isTextInputFocused()) {
      return;
    }

    callback(event);

    event.stopImmediatePropagation();
  }

  private isTextInputFocused() {
    return this.textInput.is(':focus');
  }
}

export default InputInterceptor;
