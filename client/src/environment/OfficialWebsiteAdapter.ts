import BaseEnvironmentAdapter from './BaseEnvironmentAdapter';
import SettingsManager from './interface/SettingsManager';
import OfficialGameContainerProvider from './component/officialWebsite/OfficialGameContainerProvider';
import OfficialCommentProvider from './component/officialWebsite/OfficialCommentProvider';
import {TestingSettingsManager} from './TestingAdapter';
import Socket from './component/officialWebsite/Socket';
import Jar from './component/officialWebsite/Jar';

class OfficialWebsiteAdapter extends BaseEnvironmentAdapter {
  constructor(
      private socket: Socket = new Socket(), private nextCommentCreationJar: Jar = new Jar()) {
    super();
  }

  getGameContainerProvider() {
    return new OfficialGameContainerProvider();
  }

  getCommentProvider() {
    return new OfficialCommentProvider(this.socket, this.nextCommentCreationJar);
  }

  getSettingsManager(): SettingsManager {
    // TODO
    return new TestingSettingsManager();
  }

  onProxySet() {
  }
}

export default OfficialWebsiteAdapter;
