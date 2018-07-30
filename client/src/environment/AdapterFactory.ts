import {frontend} from '../../../server/config/frontend';
import BilibiliClientAdapter from './BilibiliClientAdapter';
import ConfigProvider from './config/ConfigProvider';
import FrontendConfig from './config/FrontendConfig';
import EnvironmentAdapter from './interface/EnvironmentAdapter';
import OfficialWebsiteAdapter from './OfficialWebsiteAdapter';
import TestingAdapter from './TestingAdapter';

class AdapterFactory {
  constructor() {
    loadConfig();
  }

  createAdapter(): EnvironmentAdapter {
    if (location.hostname.includes('bilibili')) {
      return this.createBilibiliClientAdapter();
    }
    return this.createOfficialAdapter();
  }

  createTestingAdapter(): EnvironmentAdapter {
    return new TestingAdapter();
  }

  createBilibiliClientAdapter(): EnvironmentAdapter {
    return new BilibiliClientAdapter();
  }

  createOfficialAdapter(): EnvironmentAdapter {
    return new OfficialWebsiteAdapter();
  }
}

function loadConfig() {
  let baseUrl;
  if (__LOCAL__) {
    baseUrl = `http://${location.host}`;
  } else {
    baseUrl = frontend.baseUrl;
  }

  ConfigProvider.set(FrontendConfig.newBuilder()
      .setBaseUrl(baseUrl)
      .setCommentIdentity(frontend.commentIdentity)
      .setGameContainer(frontend.gameContainerId)
      .build());
}

export default AdapterFactory;
