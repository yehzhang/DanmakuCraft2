import SettingsManager, {SettingsOption} from './interface/SettingsManager';
import CommentProvider from './interface/CommentProvider';
import GameContainerProvider from './interface/GameContainerProvider';
import CommentData from '../comment/CommentData';
import BaseEnvironmentAdapter from './BaseEnvironmentAdapter';

class TestingAdapter extends BaseEnvironmentAdapter {
  onProxySet(): void {
  }

  getSettingsManager(): SettingsManager {
    return new TestingSettingsManager(new Phaser.Signal());
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

class TestingSettingsManager implements SettingsManager {
  private storage: { [key: string]: any };

  constructor(readonly fontFamilyChanged: Phaser.Signal<string>) {
    this.storage = {};
  }

  getSetting<T>(option: SettingsOption<T>): T {
    return this.storage[option.key];
  }

  setSetting<T>(option: SettingsOption<T>, value: T): void {
    this.storage[option.key] = value;
  }
}
