import CommentData from '../comment/CommentData';
import {BuiltinAsyncIterable} from '../util/alias/builtin';
import BaseEnvironmentAdapter from './BaseEnvironmentAdapter';
import BaseSettingsManager from './component/BaseSettingsManager';
import CommentProvider from './interface/CommentProvider';
import GameContainerProvider from './interface/GameContainerProvider';
import SettingsManager, {SettingsOption} from './interface/SettingsManager';
import UniverseProxy from './interface/UniverseProxy';

class TestingAdapter extends BaseEnvironmentAdapter {
  setProxy(universeProxy: UniverseProxy) {
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
  protected loadSetting<T>(option: SettingsOption<T>): T {
    return option.getDefaultValue();
  }

  protected persistSetting<T>(option: SettingsOption<T>, value: T) {
  }

  protected loadPresetSettings() {
  }
}
