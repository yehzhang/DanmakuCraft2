import BaseEnvironmentAdapter from './BaseEnvironmentAdapter';
import BilibiliContainerProvider from './component/bilibili/BilibiliContainerProvider';
import ClickTriggeredFocuser from './component/bilibili/ClickTriggeredFocuser';
import InputInterceptor from './component/bilibili/InputInterceptor';
import LocalStorageSettingsManager from './component/bilibili/LocalStorageSettingsManager';
import TextInputCommentProvider from './component/bilibili/TextInputCommentProvider';
import Widgets from './component/bilibili/Widgets';
import CommentSenderImpl from './component/officialWebsite/CommentSenderImpl';
import Jar from './component/officialWebsite/Jar';
import OfficialCommentProvider from './component/officialWebsite/OfficialCommentProvider';
import Socket from './component/officialWebsite/Socket';
import GameContainerProvider from './interface/GameContainerProvider';
import {bindFirst} from './util';

class BilibiliClientAdapter extends BaseEnvironmentAdapter {
  constructor(
      private widgets: Widgets = new Widgets(),
      private gameContainerProvider: GameContainerProvider =
          new BilibiliContainerProvider(widgets),
      private socket: Socket = new Socket(),
      private nextCommentCreationTokenJar: Jar = new Jar()) {
    super();
    this.disablePlayerControls();
  }

  private disablePlayerControls() {
    // Disable progress bar.
    $('.bilibili-player-video-control .bilibili-player-video-progress-bar .bpui-slider-tracker-wrp')
        .off();
    $('.bilibili-player-video-control .bilibili-player-video-progress-bar .bpui-slider-handle')
        .off();

    // Disable previews above progress bar.
    $('.bilibili-player-video-control .bilibili-player-video-progress-bar').off();

    // Disable play button.
    $('.bilibili-player-video-control .bilibili-player-video-btn-start').off();

    // Disable quality button.
    $('.bilibili-player-video-control .bilibili-player-video-quality-menu').off();

    // Disable comment visibility button.
    $('.bilibili-player-video-control .bilibili-player-video-btn-danmaku').off();

    // Disable playback button.
    $('.bilibili-player-video-control .bilibili-player-video-btn-repeat').off();

    // Disable time input.
    $('.bilibili-player-video-control .bilibili-player-video-time-wrap').off();

    // Disable keyboard controls to the video player.
    $(window).off('keydown');

    // Disable context menu of the player.
    bindFirst($(window), 'contextmenu', e => e.stopImmediatePropagation());

    // Player controls not disabled: volume, widescreen, and fullscreen.

    // Disable control bar hiding in fullscreen mode.
    $('#bilibiliPlayer').off('video_mousemove.bilibiliplayer');
    $('.bilibili-player-video-control .bilibili-player-video-btn-fullscreen').on('click', () => {
      setTimeout(() => {
        $('.bilibili-player-video-sendbar').add('.bilibili-player-video-control')
            .stop()
            .attr('opacity', 1);
      }, 5010);
    });
  }

  onProxySet() {
    // Setup receiving and sending of new comments.
    const commentProvider =
        new TextInputCommentProvider(this.universeProxy.getCommentPlacingPolicy(), this.widgets);
    const ignored = new CommentSenderImpl(
        this.socket,
        commentProvider,
        this.nextCommentCreationTokenJar,
        this.universeProxy.getNotifier());
    commentProvider.connect();

    // Manages focus of widgets and game.
    const game = this.universeProxy.getGame();
    const focuser = new ClickTriggeredFocuser(
        [this.widgets.videoFrame, this.widgets.textInput], this.widgets.videoFrame);
    const ignored2 = new InputInterceptor(game.input.keyboard, focuser, this.widgets);

    this.updateVolume();
    const updateVolume = () => setTimeout(this.updateVolume(), 0);
    this.widgets.volumeButton.children().click(updateVolume).on('wheel', updateVolume);
  }

  private updateVolume() {
    const volumeText = this.widgets.volumeText.text();
    let volume = parseInt(volumeText, 10) / 100;
    if (!(volume >= 0 && volume <= 1)) {
      console.error('Failed to parse volume', volumeText);
      if (volume < 0) {
        volume = 0;
      } else {
        volume = 1;
      }
    }

    this.universeProxy.getBackgroundMusicPlayer().setVolume(volume);
  }

  getCommentProvider() {
    return new OfficialCommentProvider(this.socket, this.nextCommentCreationTokenJar);
  }

  getGameContainerProvider() {
    return this.gameContainerProvider;
  }

  getSettingsManager() {
    return new LocalStorageSettingsManager();
  }
}

export default BilibiliClientAdapter;
