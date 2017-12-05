import BilibiliAdapter from './BilibiliAdapter';
import SendButtonInjector from './component/official/SendButtonInjector';
import OfficialCommentProvider from './component/official/OfficialCommentProvider';
import EnvironmentAdapter from './interface/EnvironmentAdapter';
import AdapterFactory from './AdapterFactory';

export default class BilibiliClientAdapter extends EnvironmentAdapter {
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
    return new OfficialCommentProvider();
  }

  getGameContainerProvider() {
    return this.bilibiliAdapter.getGameContainerProvider();
  }

  getSettingsManager() {
    return this.bilibiliAdapter.getSettingsManager();
  }
}
