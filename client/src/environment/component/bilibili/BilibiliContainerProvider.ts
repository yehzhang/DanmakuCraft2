import GameContainerProvider from '../../interface/GameContainerProvider';
import Widgets from './Widgets';

class BilibiliContainerProvider implements GameContainerProvider {
  private static readonly CONTAINER_ID = 'danmaku-craft-container';

  constructor(widgets: Widgets) {
    widgets.videoFrame.empty();
    widgets.videoFrame.attr('id', BilibiliContainerProvider.CONTAINER_ID);
    // videoFrame is not recovered when player's size is changed.

    $('.bilibili-player-ending-panel').remove();
  }

  getContainerId() {
    return BilibiliContainerProvider.CONTAINER_ID;
  }
}

export default BilibiliContainerProvider;
