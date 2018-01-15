import GameContainerProvider from '../../interface/GameContainerProvider';

class BilibiliContainerProvider implements GameContainerProvider {
  private static readonly CONTAINER_ID = 'danmaku-craft-container';

  constructor(videoFrame: JQuery<HTMLElement>) {
    videoFrame.empty();
    videoFrame.attr('id', BilibiliContainerProvider.CONTAINER_ID);
    // videoFrame is not recovered when player's size is changed.
  }

  getContainerId(): string {
    return BilibiliContainerProvider.CONTAINER_ID;
  }
}

export default BilibiliContainerProvider;
