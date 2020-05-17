import { toHexString, white } from '../../data/color';
import sleep from '../sleep';
import poll from './poll';

/** Resolves to the ID of the container element. */
async function setUpGameContainerElement(): Promise<string> {
  const videoFrameElement = await poll(checkAndEnableHtml5Player);

  configureBilibiliPlayer(videoFrameElement);

  const gameContainerElementId = 'danmakucraft-bilibili-container';
  addGameContainerElement(gameContainerElementId, videoFrameElement);

  return gameContainerElementId;
}

function configureBilibiliPlayer(videoFrameElement: HTMLElement) {
  // Make background of the container consistent with that of the game.
  videoFrameElement.style.backgroundColor = toHexString(white);

  // Remove danmaku enablement button.
  document
    .querySelector('.bilibili-player-video-danmaku-root .bilibili-player-video-danmaku-switch')
    ?.remove();
  // Remove danmaku settings button.
  document
    .querySelector('.bilibili-player-video-danmaku-root .bilibili-player-video-danmaku-setting')
    ?.remove();
}

async function checkAndEnableHtml5Player(): Promise<HTMLElement | null> {
  const videoFrameElement = document.querySelector<HTMLElement>('.bilibili-player-video-wrap');
  if (videoFrameElement) {
    // Wait a while after the element is first created.
    await sleep(2000);

    return videoFrameElement;
  }

  // Enable HTML5 player if flash player is enabled.
  const flashPlayerElement = document.querySelector(
    'object.player[type="application/x-shockwave-flash"]'
  );
  if (flashPlayerElement) {
    const { GrayManager } = window as any;
    try {
      GrayManager.clickMenu('change_h5');
    } catch {
      GrayManager.clickMenu('change_new_h5');
    }
  }

  return null;
}

function addGameContainerElement(elementId: string, videoFrameElement: Element) {
  // It is assumed that the element is not modified after the injection.
  // Verified it is not modified when the player's size is changed.
  videoFrameElement.innerHTML = '';
  videoFrameElement.id = elementId;
}

export default setUpGameContainerElement;
