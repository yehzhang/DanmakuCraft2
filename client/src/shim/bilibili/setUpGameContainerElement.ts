/** Resolves to the ID of the container element. */
import { toHexString, white } from '../../data/color';

async function setUpGameContainerElement($: JQueryStatic): Promise<string> {
  const $videoFrameElement = await waitUntilHtml5PlayerIsReady($);

  configureBilibiliPlayer($videoFrameElement);

  const gameContainerElementId = 'danmakucraft-bilibili-container';
  addGameContainerElement(gameContainerElementId, $videoFrameElement, $);

  return gameContainerElementId;
}

function configureBilibiliPlayer($videoFrameElement: JQuery) {
  // Make background of the container consistent with that of the game.
  $videoFrameElement.css('background-color', toHexString(white));

  // Remove danmaku enablement button.
  $('.bilibili-player-video-danmaku-root .bilibili-player-video-danmaku-switch').remove();
  // Remove danmaku settings button.
  $('.bilibili-player-video-danmaku-root .bilibili-player-video-danmaku-setting').remove();
}

async function waitUntilHtml5PlayerIsReady($: JQueryStatic): Promise<JQuery> {
  return new Promise((resolve) => {
    function tryToResolvePlayerElement() {
      const $videoFrameElement = $('.bilibili-player-video-wrap');
      if ($videoFrameElement?.length) {
        // Wait a while after the element is first created.
        setTimeout(() => resolve($videoFrameElement), 2000);
        return;
      }
      setTimeout(tryToResolvePlayerElement, 100);
    }

    tryToResolvePlayerElement();
  });
}

function addGameContainerElement(elementId: string, $videoFrameElement: JQuery, $: JQueryStatic) {
  $videoFrameElement.empty();
  $videoFrameElement.attr('id', elementId);
  // It is assumed that the element is not modified after the injection.
  // Verified it is not modified when the player's size is changed.

  $('.bilibili-player-ending-panel').remove();
}

export default setUpGameContainerElement;
