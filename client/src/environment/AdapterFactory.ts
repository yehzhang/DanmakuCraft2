import {frontend} from '../../../server/config/frontend';
import BilibiliClientAdapter from './BilibiliClientAdapter';
import ConfigProvider from './config/ConfigProvider';
import FrontendConfig from './config/FrontendConfig';
import OfficialWebsiteAdapter from './OfficialWebsiteAdapter';
import TestingAdapter from './TestingAdapter';

class AdapterFactory {
  constructor() {
    loadConfig();
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

function loadConfig() {
  const config: any = Object.assign({}, frontend);
  if (__LOCAL__) {
    config.baseUrl = 'http://localhost:1337';
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
