import * as $ from 'jquery';
import {CommentData} from '../../entity/comment';
import EnvironmentAdapter from '../EnvironmentAdapter';
import SettingsManager, {SettingsOption} from '../SettingsManager';
import CommentProvider from '../CommentProvider';
import GameContainerProvider from '../GameContainerProvider';

export default class TestingAdapter implements EnvironmentAdapter {
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
  getContainer(): HTMLElement {
    let $elem = $('#container');
    return $elem[0];
  }
}

class TestingCommentProvider extends CommentProvider {
  connect(): void {
    this.connected = true;
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
