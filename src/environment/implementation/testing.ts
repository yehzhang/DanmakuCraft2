import {CommentData} from '../../entity/comment';
import EnvironmentAdapter from '../EnvironmentAdapter';
import SettingsManager, {SettingsOption} from '../SettingsManager';
import CommentProvider from '../CommentProvider';
import GameContainerProvider from '../GameContainerProvider';
import UniverseProxy from '../UniverseProxy';

export default class TestingAdapter implements EnvironmentAdapter {
  setProxy(universeProxy: UniverseProxy): void {
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
