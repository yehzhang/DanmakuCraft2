import OfficialCommentProvider from './component/officialWebsite/OfficialCommentProvider';
import GameContainerProvider from './interface/GameContainerProvider';
import BaseEnvironmentAdapter from './BaseEnvironmentAdapter';
import TextInputCommentProvider from './component/bilibili/TextInputCommentProvider';
import EnvironmentVariables from './component/bilibili/EnvironmentVariables';
import Parameters from './component/bilibili/Parameters';
import BilibiliContainerProvider from './component/bilibili/BilibiliContainerProvider';
import LocalStorageSettingsManager from './component/bilibili/LocalStorageSettingsManager';
import CommentSenderImpl from './component/officialWebsite/CommentSenderImpl';
import InputInterceptor from './component/bilibili/InputInterceptor';
import Widgets from './component/bilibili/Widgets';
import Socket from './component/officialWebsite/Socket';
import Jar from './component/officialWebsite/Jar';
import ClickTriggeredFocuser from './component/bilibili/ClickTriggeredFocuser';

class BilibiliClientAdapter extends BaseEnvironmentAdapter {
  constructor(
      private widgets: Widgets = new Widgets(),
      private gameContainerProvider: GameContainerProvider =
          new BilibiliContainerProvider(widgets),
      private socket: Socket = new Socket(),
      private nextCommentCreationTokenJar: Jar = new Jar()) {
    super();

    if (!BilibiliClientAdapter.canRunOnThisWebPage()) {
      throw new Error('Script cannot run on this page');
    }

    BilibiliClientAdapter.disablePlayerControls();
  }

  private static canRunOnThisWebPage() {
    if (__DEV__) {
      return true;
    }
    return EnvironmentVariables.aid === Parameters.AID;
  }

  private static disablePlayerControls() {
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
    let commentProvider =
        new TextInputCommentProvider(this.universeProxy.getCommentPlacingPolicy(), this.widgets);
    let ignored = new CommentSenderImpl(
        this.socket,
        commentProvider,
        this.nextCommentCreationTokenJar,
        this.universeProxy.getNotifier());
    commentProvider.connect();

    let game = this.universeProxy.getGame();
    let focuser = new ClickTriggeredFocuser(
        [this.widgets.videoFrame, this.widgets.textInput], this.widgets.videoFrame);
    let ignored2 = new InputInterceptor(game.input.keyboard, focuser, this.widgets);

    // TODO Let volume bar actually controls
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
