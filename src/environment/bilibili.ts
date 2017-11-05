import * as $ from 'jquery';
import {EnvironmentAdapter, GameContainerProvider} from './components';

class BilibiliContainerProvider implements GameContainerProvider {
  getContainer() {
    let $videoFrame = $('.bilibili-player-video-wrap');
    $videoFrame.empty();

    return $videoFrame[0];
  }
}

export default class BilibiliAdapter implements EnvironmentAdapter {
  getGameContainerProvider() {
    return new BilibiliContainerProvider();
  }
}
