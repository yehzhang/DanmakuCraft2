import BilibiliClientAdapter from './BilibiliClientAdapter';
import TestingAdapter from './TestingAdapter';
import ConfigProvider from './config/ConfigProvider';
import BackendConfig from './config/BackendConfig';
import {apis} from '../../../server/config/apis';
import {parameters} from '../../../server/config/parameters';
import OfficialWebsiteAdapter from './OfficialWebsiteAdapter';

class AdapterFactory {
  constructor() {
    AdapterFactory.loadConfig();
  }

  private static loadConfig() {
    ConfigProvider.set(BackendConfig.newBuilder()
        .setBaseUrl(apis.baseUrl)
        .setBatchCommentsPath(apis.batchCommentsPath)
        .setDefaultBatchCommentsPath(apis.defaultBatchCommentsPath)
        .setNewCommentBroadcastPath(apis.newCommentBroadcastPath)
        .setGameContainer(parameters.gameContainerId)
        .setOfficialWebsiteHostname(parameters.officialWebsiteHostname)
        .build());
  }

  createAdapter() {
    if (__DEV__) {
      return this.createTestingAdapter();
    }
    if (location.hostname === ConfigProvider.get().officialWebsiteHostname) {
      return this.createOfficialAdapter();
    }
    return this.createBilibiliClientAdapter();
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
