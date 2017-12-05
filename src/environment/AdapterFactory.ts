import BilibiliAdapter from './BilibiliAdapter';
import BilibiliClientAdapter from './BilibiliClientAdapter';
import TestingAdapter from './TestingAdapter';

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
