import BaseEnvironmentAdapter from './BaseEnvironmentAdapter';
import SettingsManager from './interface/SettingsManager';
import OfficialGameContainerProvider from './component/officialWebsite/OfficialGameContainerProvider';
import OfficialCommentProvider from './component/officialWebsite/OfficialCommentProvider';
import {TestingSettingsManager} from './TestingAdapter';

class OfficialWebsiteAdapter extends BaseEnvironmentAdapter {
  getGameContainerProvider() {
    return new OfficialGameContainerProvider();
  }

  getCommentProvider() {
    return new OfficialCommentProvider();
  }

  getSettingsManager(): SettingsManager {
    // TODO
    return new TestingSettingsManager();
  }

  onProxySet() {
  }
}

export default OfficialWebsiteAdapter;
