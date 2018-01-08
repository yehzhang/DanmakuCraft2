import BilibiliClientAdapter from './BilibiliClientAdapter';
import TestingAdapter from './TestingAdapter';

class AdapterFactory {
  createAdapter() {
    if (__DEV__) {
      return this.createTestingAdapter();
    }
    return this.createBilibiliClientAdapter(); // TODO create official adapter
  }

  createTestingAdapter() {
    return new TestingAdapter();
  }

  createBilibiliClientAdapter() {
    return new BilibiliClientAdapter();
  }
}

export default AdapterFactory;
