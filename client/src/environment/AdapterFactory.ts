import BilibiliClientAdapter from './BilibiliClientAdapter';
import TestingAdapter from './TestingAdapter';
import ConfigProvider from './config/ConfigProvider';
import FrontendConfig from './config/FrontendConfig';
import {frontend} from '../../../server/config/frontend';
import OfficialWebsiteAdapter from './OfficialWebsiteAdapter';

class AdapterFactory {
  constructor() {
    AdapterFactory.loadConfig();
  }

  private static loadConfig() {
    ConfigProvider.set(FrontendConfig.newBuilder()
        .setBaseUrl(frontend.baseUrl)
        .setCommentIdentity(frontend.commentIdentity)
        .setGameContainer(frontend.gameContainerId)
        .build());
  }

  createAdapter() {
    if (location.hostname.includes('bilibili')) {
      return this.createBilibiliClientAdapter();
    }
    return this.createOfficialAdapter();
  }

  createTestingAdapter() {
    return new TestingAdapter();
  }

  createBilibiliClientAdapter() {
    return new BilibiliClientAdapter();
  }

  createOfficialAdapter() {
    return new OfficialWebsiteAdapter();
  }
}

export default AdapterFactory;
