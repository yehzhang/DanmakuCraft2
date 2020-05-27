import { Application } from '@pixi/app';
import { autoDetectRenderer } from '@pixi/core';
import { toRgbNumber, white } from '../../data/color';
import resolution from '../../data/resolution';

const application = new Application({
  sharedTicker: true,
});

export function setRendererView(view: HTMLCanvasElement) {
  application.renderer.destroy();
  application.renderer = autoDetectRenderer({
    view,
    autoDensity: true,
    antialias: false,
    backgroundColor: toRgbNumber(white),
    resolution,
  });
}

export default application;
