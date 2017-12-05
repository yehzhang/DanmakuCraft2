import EnvironmentAdapter from './interface/EnvironmentAdapter';
import UniverseProxy from './interface/UniverseProxy';
import CommentProvider from './interface/CommentProvider';
import GameContainerProvider from './interface/GameContainerProvider';
import SettingsManager from './interface/SettingsManager';
import BilibiliContainerProvider from './component/bilibili/BilibiliContainerProvider';
import BilibiliCommentProvider from './component/bilibili/BilibiliCommentProvider';
import LocalStorageSettingsManager from './component/bilibili/LocalStorageSettingsManager';
import LocalCommentInjector from './component/bilibili/LocalCommentInjector';
import EnvironmentVariables from './component/bilibili/EnvironmentVariables';
import Parameters from './component/bilibili/Parameters';

export default class BilibiliAdapter implements EnvironmentAdapter {
  private universeProxy: UniverseProxy;
  private injector: LocalCommentInjector;

  constructor() {
    if (!BilibiliAdapter.canRunOnThisWebPage()) {
      throw new Error('Script cannot run on this page');
    }
  }

  private static canRunOnThisWebPage() {
    return EnvironmentVariables.aid === Parameters.AID;
  }

  setProxy(universeProxy: UniverseProxy) {
    this.universeProxy = universeProxy;
    this.injector = new LocalCommentInjector(universeProxy);
  }

  getCommentProvider(): CommentProvider {
    return new BilibiliCommentProvider();
  }

  getGameContainerProvider(): GameContainerProvider {
    return new BilibiliContainerProvider();
  }

  getSettingsManager(): SettingsManager {
    return new LocalStorageSettingsManager();
  }
}
