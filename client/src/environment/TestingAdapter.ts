import SettingsManager from './interface/SettingsManager';
import CommentProvider from './interface/CommentProvider';
import GameContainerProvider from './interface/GameContainerProvider';
import CommentData from '../comment/CommentData';
import BaseEnvironmentAdapter from './BaseEnvironmentAdapter';
import BaseSettingsManager from './component/BaseSettingsManager';
import Provider from '../util/syntax/Provider';

class TestingAdapter extends BaseEnvironmentAdapter {
  onProxySet(): void {
  }

  getSettingsManager(): SettingsManager {
    return new TestingSettingsManager();
  }

  getCommentProvider(): CommentProvider {
    return new TestingCommentProvider(new Phaser.Signal());
  }

  getGameContainerProvider(): GameContainerProvider {
    return new TestingContainerProvider();
  }
}

export default TestingAdapter;

export class TestingContainerProvider implements GameContainerProvider {
  getContainerId(): string {
    return 'container';
  }
}

export class TestingCommentProvider implements CommentProvider {
  constructor(readonly commentReceived: Phaser.Signal<CommentData> = new Phaser.Signal()) {
  }

  connect() {
  }

  async getAllComments() {
    return new Promise<Provider<CommentData[]>>(resolve => resolve(() => []));
  }
}

export class TestingSettingsManager extends BaseSettingsManager {
  protected loadSettings() {
  }
}
