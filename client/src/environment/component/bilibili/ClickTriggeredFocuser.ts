import {bindFirst} from '../../util';

class ClickTriggeredFocuser {
  private elements: Set<JQuery<HTMLElement>>;

  constructor(
      trackingWidgets: Iterable<JQuery<HTMLElement>>,
      private focusee: JQuery<HTMLElement> | null = null,
      private isSettingFocusee: boolean = false) {
    $(window).focusin(e => this.focusee = $(e.target));

    this.elements = new Set(trackingWidgets);
    for (const element of this.elements) {
      this.track(element);
    }

    if (focusee != null) {
      this.focus(focusee);
    }
  }

  isFocused(element: JQuery<HTMLElement>) {
    if (!this.elements.has(element)) {
      throw new TypeError('Widget is not tracked');
    }
    return this.focusee === element;
  }

  focus(element: JQuery<HTMLElement>) {
    if (!this.elements.has(element)) {
      throw new TypeError('Widget is not tracked');
    }

    clearAllOtherFocuses();

    this.isSettingFocusee = true;
    element.focus();
    this.isSettingFocusee = false;

    this.focusee = element;
  }

  unfocus() {
    if (this.focusee == null) {
      return;
    }

    this.focusee.blur();

    this.focusee = null;
  }

  private track(element: JQuery<HTMLElement>) {
    element.on('click', () => this.focus(element));
    bindFirst(element, 'focusin', event => {
      if (this.isSettingFocusee) {
        return;
      }

      if (this.focusee === element) {
        return;
      }

      event.stopImmediatePropagation();

      setImmediate(() => element.blur());
    });
  }
}

function clearAllOtherFocuses() {
  return $(':focus').blur();
}

export default ClickTriggeredFocuser;
