let builtInWindow = window;

class Widgets {
  constructor(
      readonly window: JQuery<HTMLElement> = $(builtInWindow),
      readonly videoFrame: JQuery<HTMLElement> = $('.bilibili-player-video-wrap'),
      readonly textInput: JQuery<HTMLElement> = $('.bilibili-player-video-danmaku-input'),
      readonly sendButton: JQuery<HTMLElement> = $('.bilibili-player-video-btn-send'),
      readonly colorInput: JQuery<HTMLElement> =
          $('.bilibili-player-video-sendbar .bilibili-player-color-picker-color-code'),
      readonly colorPalette: JQuery<HTMLElement> =
          $('.bilibili-player-video-sendbar .bilibili-player-color-picker-panel')) {
  }
}

export default Widgets;
