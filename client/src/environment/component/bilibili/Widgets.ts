const builtInWindow = window;

class Widgets {
  constructor(
      readonly window: JQuery<Window> = $(builtInWindow),
      readonly videoFrame: JQuery<HTMLElement> = $('.bilibili-player-video-wrap'),
      readonly textInput: JQuery<HTMLElement> = $('.bilibili-player-video-danmaku-input'),
      readonly sendButton: JQuery<HTMLElement> = $('.bilibili-player-video-btn-send'),
      readonly volumeButton = $('.bilibili-player-video-control .bilibili-player-video-btn-volume'),
      readonly volumeText = volumeButton.find('.bilibili-player-video-volume-num'),
      readonly colorInput: JQuery<HTMLElement> =
          $('.bilibili-player-video-sendbar .bilibili-player-color-picker-color-code'),
      readonly colorPalette: JQuery<HTMLElement> =
          $('.bilibili-player-video-sendbar .bilibili-player-color-picker-panel')) {
  }
}

export default Widgets;
