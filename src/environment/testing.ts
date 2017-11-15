import * as $ from 'jquery';
import {
  CommentProvider, EnvironmentAdapter, GameContainerProvider, Settings,
  SettingsProvider
} from './inwardAdapter';
import {CommentData} from '../comment';

export default class TestingAdapter implements EnvironmentAdapter {
  getSettingsProvider(): SettingsProvider {
    return new TestingSettingsProvider();
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
  async getAllComments(): Promise<CommentData[]> {
    return new Promise<CommentData[]>(resolve => resolve([]));
  }
}

class TestingSettingsProvider extends SettingsProvider {
  getSettings() {
    return new Settings('SimHei');
  }
}
