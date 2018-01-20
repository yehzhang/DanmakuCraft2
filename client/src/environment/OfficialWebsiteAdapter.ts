import BaseEnvironmentAdapter from './BaseEnvironmentAdapter';
import SettingsManager from './interface/SettingsManager';
import OfficialGameContainerProvider from './component/officialWebsite/OfficialGameContainerProvider';
import OfficialCommentProvider from './component/officialWebsite/OfficialCommentProvider';
import {TestingSettingsManager} from './TestingAdapter';
import Socket from './component/officialWebsite/Socket';

class OfficialWebsiteAdapter extends BaseEnvironmentAdapter {
  constructor(private socket: Socket = new Socket()) {
    super();
  }

  getGameContainerProvider() {
    return new OfficialGameContainerProvider();
  }

  getCommentProvider() {
    return new OfficialCommentProvider(this.socket);
  }

  getSettingsManager(): SettingsManager {
    // TODO
    return new TestingSettingsManager();
  }

  onProxySet() {
  }
}

export default OfficialWebsiteAdapter;
