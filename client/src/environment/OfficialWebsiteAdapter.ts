import BaseEnvironmentAdapter from './BaseEnvironmentAdapter';
import Jar from './component/officialWebsite/Jar';
import OfficialCommentProvider from './component/officialWebsite/OfficialCommentProvider';
import OfficialGameContainerProvider from './component/officialWebsite/OfficialGameContainerProvider';
import Socket from './component/officialWebsite/Socket';
import SettingsManager from './interface/SettingsManager';
import {TestingSettingsManager} from './TestingAdapter';

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

  setProxy() {
  }
}

export default OfficialWebsiteAdapter;
