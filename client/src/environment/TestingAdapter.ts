import SettingsManager from './interface/SettingsManager';
import CommentProvider from './interface/CommentProvider';
import GameContainerProvider from './interface/GameContainerProvider';
import CommentData from '../comment/CommentData';
import BaseEnvironmentAdapter from './BaseEnvironmentAdapter';
import BaseSettingsManager from './component/BaseSettingsManager';
import {BuiltinAsyncIterable} from '../util/alias/builtin';

class TestingAdapter extends BaseEnvironmentAdapter {
  onProxySet(): void {
  }

  getSettingsManager(): SettingsManager {
    return new TestingSettingsManager();
  }

  getCommentProvider(): CommentProvider {
    return new TestingCommentProvider();
  }

  getGameContainerProvider(): GameContainerProvider {
    return new TestingContainerProvider();
  }
}

export default TestingAdapter;

export class TestingContainerProvider implements GameContainerProvider {
  getContainerId() {
    return 'container';
  }
}

export class TestingCommentProvider implements CommentProvider {
  connect() {
  }

  async getAllComments() {
    return [];
  }

  async * getNewComments(): BuiltinAsyncIterable<CommentData> {
  }
}

export class TestingSettingsManager extends BaseSettingsManager {
  protected loadSettings() {
  }
}
