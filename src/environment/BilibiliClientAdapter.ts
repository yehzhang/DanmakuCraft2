import BilibiliAdapter from './BilibiliAdapter';
import SendButtonInjector from './component/official/SendButtonInjector';
import OfficialCommentProvider from './component/official/OfficialCommentProvider';
import AdapterFactory from './AdapterFactory';
import GameContainerProvider from './interface/GameContainerProvider';
import SettingsManager from './interface/SettingsManager';
import BaseEnvironmentAdapter from './BaseEnvironmentAdapter';

class BilibiliClientAdapter extends BaseEnvironmentAdapter {
  private bilibiliAdapter: BilibiliAdapter;
  private sendButtonInjector: SendButtonInjector;

  constructor(adapterFactory: AdapterFactory) {
    super();
    this.bilibiliAdapter = adapterFactory.createBilibiliAdapter();
  }

  onProxySet() {
    this.sendButtonInjector = new SendButtonInjector(this.universeProxy);
  }

  getCommentProvider() {
    return new OfficialCommentProvider(new Phaser.Signal());
  }

  getGameContainerProvider(): GameContainerProvider {
    return this.bilibiliAdapter.getGameContainerProvider();
  }

  getSettingsManager(): SettingsManager {
    return this.bilibiliAdapter.getSettingsManager();
  }
}

export default BilibiliClientAdapter;
