import {bindFirst} from '../../util';

class ClickTriggeredFocuser {
  private readonly elements: Set<JQuery<EventTarget>>;

  constructor(
      trackingWidgets: Iterable<JQuery<EventTarget>>,
      private focusee: JQuery<EventTarget> | null = null,
      private isSettingFocusee: boolean = false) {
    $(window).on('focusin', e => this.focusee = $(e.target));

    this.elements = new Set(trackingWidgets);
    for (const element of this.elements) {
      this.track(element);
    }

    if (focusee != null) {
      this.focus(focusee);
    }
  }

  isFocused(element: JQuery<EventTarget>) {
    if (!this.elements.has(element)) {
      throw new TypeError('Widget is not tracked');
    }
    return this.focusee === element;
  }

  focus(element: JQuery<EventTarget>) {
    if (!this.elements.has(element)) {
      throw new TypeError('Widget is not tracked');
    }

    clearAllOtherFocuses();

    this.isSettingFocusee = true;
    element.trigger('focus');
    this.isSettingFocusee = false;

    this.focusee = element;
  }

  unfocus() {
    if (this.focusee == null) {
      return;
    }

    this.focusee.trigger('blur');

    this.focusee = null;
  }

  private track(element: JQuery<EventTarget>) {
    element.on('click', () => this.focus(element));
    bindFirst(element, 'focusin', event => {
      if (this.isSettingFocusee) {
        return;
      }

      if (this.focusee === element) {
        return;
      }

      event.stopImmediatePropagation();

      setImmediate(() => element.trigger('blur'));
    });
  }
}

function clearAllOtherFocuses() {
  return $(':focus').trigger('blur');
}

export default ClickTriggeredFocuser;
