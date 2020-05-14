import * as PIXI from 'pixi.js';
import { useMemo } from 'react';
import resolution from '../data/resolution';
import application from '../shim/pixi/application';

/** Uses textures generated from the draw functions. */
function useTexture(drawFrame: (graphics: PIXI.Graphics) => void): PIXI.Texture {
  return useMemo(() => {
    const graphics = new PIXI.Graphics();
    drawFrame(graphics);

    return application.renderer.generateTexture(graphics, PIXI.SCALE_MODES.NEAREST, resolution);
  }, [drawFrame]);
}

export default useTexture;
