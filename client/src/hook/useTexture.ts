import { SCALE_MODES } from '@pixi/constants';
import { Texture } from '@pixi/core';
import { Graphics } from '@pixi/graphics';
import { useMemo } from 'react';
import resolution from '../data/resolution';
import application from '../shim/pixi/application';

/** Uses textures generated from the draw functions. */
function useTexture(drawFrame: (graphics: Graphics) => void): Texture {
  return useMemo(() => {
    const graphics = new Graphics();
    drawFrame(graphics);

    return application.renderer.generateTexture(graphics, SCALE_MODES.NEAREST, resolution);
  }, [drawFrame]);
}

export default useTexture;
