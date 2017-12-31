import SettingsManager from './interface/SettingsManager';
import CommentProvider from './interface/CommentProvider';
import GameContainerProvider from './interface/GameContainerProvider';
import CommentData from '../comment/CommentData';
import BaseEnvironmentAdapter from './BaseEnvironmentAdapter';
import LocalStorageSettingsManager from './component/bilibili/LocalStorageSettingsManager';

class TestingAdapter extends BaseEnvironmentAdapter {
  onProxySet(): void {
  }

  getSettingsManager(): SettingsManager {
    return new LocalStorageSettingsManager();
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

  connect(): void {
  }

  async getAllComments(): Promise<CommentData[]> {
    return new Promise<CommentData[]>(resolve => resolve([]));
  }
}
