export * from '@pixi/constants';
export * from '@pixi/math';
export * from '@pixi/runner';
export * from '@pixi/settings';
export * from '@pixi/ticker';
// Application plugins
import { Application } from '@pixi/app';
// Renderer plugins
import { BatchRenderer, Renderer } from '@pixi/core';
import { ParticleRenderer } from '@pixi/particles';
import { Prepare } from '@pixi/prepare';
import { TickerPlugin } from '@pixi/ticker';
import * as utils from '@pixi/utils';

export { utils };
export * from '@pixi/display';
export * from '@pixi/core';
export * from '@pixi/particles';
export * from '@pixi/sprite';
export * from '@pixi/app';
export * from '@pixi/graphics';
export * from '@pixi/sprite-animated';
export * from '@pixi/text';
export * from '@pixi/prepare';

Renderer.registerPlugin('batch', BatchRenderer);
Renderer.registerPlugin('particle', ParticleRenderer as any);
Renderer.registerPlugin('prepare', Prepare as any);

Application.registerPlugin(TickerPlugin as any);
