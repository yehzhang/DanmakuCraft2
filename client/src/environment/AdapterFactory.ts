import BilibiliClientAdapter from './BilibiliClientAdapter';
import TestingAdapter from './TestingAdapter';
import ConfigProvider from './config/ConfigProvider';
import Config from './config/ApiConfig';
import * as config from '../../../server/config/api.json';

class AdapterFactory {
  constructor() {
    AdapterFactory.loadConfig();
  }

  private static loadConfig() {
    ConfigProvider.set(Config.newBuilder()
        .setBaseUrl(config.baseUrl)
        .setBatchCommentsPath(config.batchCommentsPath)
        .setDefaultBatchCommentsPath(config.defaultBatchCommentsPath)
        .setNewCommentBroadcastPath(config.newCommentBroadcastPath)
        .build());
  }

  createAdapter() {
    if (__DEV__) {
      return this.createTestingAdapter();
    }
    // TODO create official adapter according to host
    return this.createBilibiliClientAdapter();
  }

  createTestingAdapter() {
    return new TestingAdapter();
  }

  createBilibiliClientAdapter() {
    return new BilibiliClientAdapter();
  }
}

export default AdapterFactory;
