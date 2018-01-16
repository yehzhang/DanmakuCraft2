import OfficialCommentProvider from './component/officialWebsite/OfficialCommentProvider';
import GameContainerProvider from './interface/GameContainerProvider';
import SettingsManager from './interface/SettingsManager';
import BaseEnvironmentAdapter from './BaseEnvironmentAdapter';
import TextInputCommentProvider from './component/bilibili/TextInputCommentProvider';
import EnvironmentVariables from './component/bilibili/EnvironmentVariables';
import Parameters from './component/bilibili/Parameters';
import BilibiliContainerProvider from './component/bilibili/BilibiliContainerProvider';
import LocalStorageSettingsManager from './component/bilibili/LocalStorageSettingsManager';
import CommentSenderImpl from './component/officialWebsite/CommentSenderImpl';
import {TestingCommentProvider} from './TestingAdapter';
import InputInterceptor from './component/bilibili/InputInterceptor';
import GameContainerFocuser from './component/bilibili/GameContainerFocuser';
import Widgets from './component/bilibili/Widgets';

class BilibiliClientAdapter extends BaseEnvironmentAdapter {
  constructor(
      private widgets: Widgets = new Widgets(),
      private gameContainerProvider: GameContainerProvider =
          new BilibiliContainerProvider(widgets)) {
    super();

    if (!BilibiliClientAdapter.canRunOnThisWebPage()) {
      throw new Error('Script cannot run on this page');
    }

    BilibiliClientAdapter.disableControls();
  }

  private static canRunOnThisWebPage() {
    if (__STAGE__) {
      return true;
    }
    return EnvironmentVariables.aid === Parameters.AID;
  }

  private static disableControls() {
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
    let commentSender = new CommentSenderImpl();
    commentProvider.commentReceived.add(commentData => commentSender.send(commentData));
    commentProvider.connect();

    let game = this.universeProxy.getGame();
    let gameContainerFocuser = new GameContainerFocuser(this.widgets);
    let ignored = new InputInterceptor(game.input.keyboard, gameContainerFocuser, this.widgets);

    // TODO Let volume bar actually controls
  }

  getCommentProvider() {
    if (__STAGE__) {
      // TODO remove
      return new TestingCommentProvider();
    }
    return new OfficialCommentProvider();
  }

  getGameContainerProvider(): GameContainerProvider {
    return this.gameContainerProvider;
  }

  getSettingsManager(): SettingsManager {
    return new LocalStorageSettingsManager();
  }
}

export default BilibiliClientAdapter;
