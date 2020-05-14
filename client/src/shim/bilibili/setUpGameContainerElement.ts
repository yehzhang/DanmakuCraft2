/** Resolves to the ID of the container element. */
import { toHexString, white } from '../../data/color';

async function setUpGameContainerElement(): Promise<string> {
  const videoFrameElement = await waitUntilHtml5PlayerIsReady();

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

async function waitUntilHtml5PlayerIsReady(): Promise<HTMLElement> {
  // TODO click only if necessary
  // (window as any).GrayManager.clickMenu('change_h5');

  return new Promise((resolve) => {
    function tryToResolvePlayerElement() {
      const videoFrameElement = document.querySelector<HTMLElement>('.bilibili-player-video-wrap');
      if (videoFrameElement) {
        // Wait a while after the element is first created.
        setTimeout(() => resolve(videoFrameElement), 2000);
        return;
      }
      setTimeout(tryToResolvePlayerElement, 100);
    }

    tryToResolvePlayerElement();
  });
}

function addGameContainerElement(elementId: string, videoFrameElement: Element) {
  // It is assumed that the element is not modified after the injection.
  // Verified it is not modified when the player's size is changed.
  videoFrameElement.innerHTML = '';
  videoFrameElement.id = elementId;
}

export default setUpGameContainerElement;
