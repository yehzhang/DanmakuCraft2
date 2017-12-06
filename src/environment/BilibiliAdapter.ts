import EnvironmentAdapter from './interface/EnvironmentAdapter';
import BilibiliContainerProvider from './component/bilibili/BilibiliContainerProvider';
import BilibiliCommentProvider from './component/bilibili/BilibiliCommentProvider';
import LocalStorageSettingsManager from './component/bilibili/LocalStorageSettingsManager';
import LocalCommentInjector from './component/bilibili/LocalCommentInjector';
import EnvironmentVariables from './component/bilibili/EnvironmentVariables';
import Parameters from './component/bilibili/Parameters';
import {WebSocketManager} from './util';

export default class BilibiliAdapter extends EnvironmentAdapter {
  private injector: LocalCommentInjector;

  constructor() {
    if (!BilibiliAdapter.canRunOnThisWebPage()) {
      throw new Error('Script cannot run on this page');
    }
    super();
  }

  private static canRunOnThisWebPage() {
    return EnvironmentVariables.aid === Parameters.AID;
  }

  onProxySet() {
    this.injector = new LocalCommentInjector(this.universeProxy);
  }

  getCommentProvider() {
    let webSocketManager = new WebSocketManager();
    return new BilibiliCommentProvider(webSocketManager);
  }

  getGameContainerProvider() {
    return new BilibiliContainerProvider();
  }

  getSettingsManager() {
    return new LocalStorageSettingsManager();
  }
}
