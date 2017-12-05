import GameContainerProvider from '../interface/GameContainerProvider';

export default class BilibiliContainerProvider implements GameContainerProvider {
  private static readonly CONTAINER_ID = 'danmaku-craft-container';

  getContainerId(): string {
    let $videoFrame = $('.bilibili-player-video-wrap');
    $videoFrame.empty();
    // $videoFrame is not recovered when player's size is changed.

    $videoFrame.attr('id', BilibiliContainerProvider.CONTAINER_ID);

    return BilibiliContainerProvider.CONTAINER_ID;
  }
}
