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
  const config: any = Object.assign({}, frontend);
  if (__LOCAL__) {
    config.baseUrl = `http://${location.host}`;
  } else {
    config.baseUrl = 'https://danmakucraft.com';
  }

  ConfigProvider.set(FrontendConfig.newBuilder()
      .setBaseUrl(config.baseUrl)
      .setCommentIdentity(config.commentIdentity)
      .setGameContainer(config.gameContainerId)
      .build());
}

export default AdapterFactory;
