import BilibiliAdapter from './bilibiliPlayer/BilibiliAdapter';
import BilibiliClientAdapter from './bilibiliPlayerClient/BilibiliClientAdapter';
import TestingAdapter from './testing';

export default class AdapterFactory {
  createAdapter() {
    if (__DEBUG__) {
      return this.createTestingAdapter();
    }

    return this.createBilibiliAdapter();
  }

  createTestingAdapter() {
    return new TestingAdapter();
  }

  createBilibiliAdapter() {
    return new BilibiliAdapter();
  }

  createBilibiliClientAdapter() {
    return new BilibiliClientAdapter();
  }
}
