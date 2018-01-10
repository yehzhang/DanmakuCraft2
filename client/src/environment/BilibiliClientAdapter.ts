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

class BilibiliClientAdapter extends BaseEnvironmentAdapter {
  constructor(private gameContainerProvider: GameContainerProvider = new BilibiliContainerProvider()) {
    super();
    if (!BilibiliClientAdapter.canRunOnThisWebPage()) {
      throw new Error('Script cannot run on this page');
    }
  }

  private static canRunOnThisWebPage() {
    if (__STAGE__) {
      return true;
    }
    return EnvironmentVariables.aid === Parameters.AID;
  }

  onProxySet() {
    let game = this.universeProxy.getGame();
    let textInput = $('.bilibili-player-video-danmaku-input');
    let sendButton = $('.bilibili-player-video-btn-send');
    let ignored = new InputInterceptor(game.input.keyboard, this.gameContainerProvider, textInput);

    let commentSender = new CommentSenderImpl();
    let commentProvider = new TextInputCommentProvider(
        this.universeProxy.getCommentPlacingPolicy(),
        textInput,
        sendButton);
    commentProvider.commentReceived.add(commentData => commentSender.send(commentData));
    commentProvider.connect();
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
