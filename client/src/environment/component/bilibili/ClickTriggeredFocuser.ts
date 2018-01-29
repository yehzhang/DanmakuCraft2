import {bindFirst} from '../../util';

class ClickTriggeredFocuser {
  private elements: Set<JQuery<HTMLElement>>;

  constructor(
      trackingWidgets: Iterable<JQuery<HTMLElement>>,
      private focusee: JQuery<HTMLElement> | null = null) {
    this.elements = new Set(trackingWidgets);
    for (let element of this.elements) {
      this.track(element);
    }

    if (focusee != null) {
      this.focus(focusee);
    }
  }

  private static clearAllOtherFocuses() {
    return $(':focus').blur();
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

    this.focusee = element;

    ClickTriggeredFocuser.clearAllOtherFocuses();
    element.focus();
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
      if (this.focusee === element) {
        return;
      }

      event.stopImmediatePropagation();

      setImmediate(() => element.blur());
    });
  }
}

export default ClickTriggeredFocuser;
