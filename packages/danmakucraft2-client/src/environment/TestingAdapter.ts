import SettingsManager from './interface/SettingsManager';
import CommentProvider from './interface/CommentProvider';
import GameContainerProvider from './interface/GameContainerProvider';
import CommentData from '../comment/CommentData';
import BaseEnvironmentAdapter from './BaseEnvironmentAdapter';
import BaseSettingsManager from './component/BaseSettingsManager';

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

class TestingContainerProvider implements GameContainerProvider {
  getContainerId(): string {
    return 'container';
  }
}

class TestingCommentProvider implements CommentProvider {
  constructor(readonly commentReceived: Phaser.Signal<CommentData>) {
  }

  connect() {
  }

  async getAllComments(): Promise<CommentData[]> {
    return new Promise<CommentData[]>(resolve => resolve([]));
  }
}

class TestingSettingsManager extends BaseSettingsManager {
  protected loadSettings() {
  }
}
