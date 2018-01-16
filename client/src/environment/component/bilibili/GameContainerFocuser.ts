import Widgets from './Widgets';

class GameContainerFocuser {
  constructor(
      private widgets: Widgets,
      private isContainerFocused: boolean = !GameContainerFocuser.hasAnyOtherFocus()) {
    this.listenToGameFocusChanges();
  }

  private static hasAnyOtherFocus() {
    return !$(':focus').empty();
  }

  private static clearAllOtherFocuses() {
    return $(':focus').blur();
  }

  isFocused() {
    return this.isContainerFocused;
  }

  focus() {
    GameContainerFocuser.clearAllOtherFocuses();
    this.isContainerFocused = true;
  }

  unfocus() {
    this.isContainerFocused = false;
  }

  private listenToGameFocusChanges() {
    $(this.widgets.videoFrame).on('click', () => this.focus());
    $(window).on('focusin', () => this.unfocus());
  }
}

export default GameContainerFocuser;
