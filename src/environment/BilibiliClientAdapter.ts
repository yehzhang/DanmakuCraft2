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

class BilibiliClientAdapter extends BaseEnvironmentAdapter {
  constructor() {
    super();
    if (!BilibiliClientAdapter.canRunOnThisWebPage()) {
      throw new Error('Script cannot run on this page');
    }
  }

  private static canRunOnThisWebPage() {
    return EnvironmentVariables.aid === Parameters.AID;
  }

  onProxySet() {
    let commentSender = new CommentSenderImpl();
    let commentProvider = new TextInputCommentProvider(this.universeProxy.getCommentPlacingPolicy());
    commentProvider.commentReceived.add(commentData => commentSender.send(commentData));
    commentProvider.connect();
  }

  getCommentProvider() {
    return new OfficialCommentProvider();
  }

  getGameContainerProvider(): GameContainerProvider {
    return new BilibiliContainerProvider();
  }

  getSettingsManager(): SettingsManager {
    return new LocalStorageSettingsManager();
  }
}

export default BilibiliClientAdapter;
