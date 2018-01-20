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
        .setBatchCommentsPath(frontend.commentsPath)
        .setDefaultBatchCommentsPath(frontend.defaultBatchCommentsPath)
        .setGameContainer(frontend.gameContainerId)
        .build());
  }

  createAdapter() {
    if (__DEV__) {
      return this.createTestingAdapter();
    }
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
