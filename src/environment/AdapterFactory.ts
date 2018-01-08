import BilibiliClientAdapter from './BilibiliClientAdapter';
import TestingAdapter from './TestingAdapter';

export default class AdapterFactory {
  createAdapter() {
    if (__DEBUG__) {
      return this.createTestingAdapter();
    }
    return this.createBilibiliClientAdapter();
  }

  createTestingAdapter() {
    return new TestingAdapter();
  }

  createBilibiliClientAdapter() {
    return new BilibiliClientAdapter();
  }
}
