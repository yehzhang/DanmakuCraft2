import {CommentData} from '../entity/comment';
import EnvironmentAdapter from './interface/EnvironmentAdapter';
import SettingsManager, {SettingsOption} from './interface/SettingsManager';
import CommentProvider from './interface/CommentProvider';
import GameContainerProvider from './interface/GameContainerProvider';

export default class TestingAdapter extends EnvironmentAdapter {
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

class TestingContainerProvider implements GameContainerProvider {
  getContainerId(): string {
    return 'container';
  }
}

class TestingCommentProvider extends CommentProvider {
  connect(): void {
  }

  async getAllComments(): Promise<CommentData[]> {
    return new Promise<CommentData[]>(resolve => resolve([]));
  }
}

class TestingSettingsManager extends SettingsManager {
  private storage: { [key: string]: any };

  constructor() {
    super();

    this.storage = {};
  }

  getSetting<T>(option: SettingsOption<T>): T {
    return this.storage[option.key];
  }

  setSetting<T>(option: SettingsOption<T>, value: T): void {
    this.storage[option.key] = value;
  }
}
