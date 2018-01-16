class GameContainerFocuser {
  constructor(
      private gameContainer: JQuery<HTMLElement>,
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
    $(this.gameContainer).on('click', () => this.focus());
    $(window).on('focusin', () => this.unfocus());
  }
}

export default GameContainerFocuser;
