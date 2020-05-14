import * as _ from 'lodash';
import { createSelector } from 'reselect';
import { Color, fromHsl, toHsl, white } from '../data/color';
import { cartesianToPolar, polarToCartesian } from '../data/coordinate';
import { empty, Point, zip } from '../data/point';
import { outQuad } from '../shim/tsEasing';
import environmentCommentEntityNodesSelector from './environmentCommentEntityNodesSelector';
import environmentSamplingSizeSelector from './environmentSamplingSizeSelector';
import createVisibleEntityNodesSelector from './visibleEntityNodesSelector';

const environmentAwareColorSelector = createSelector(
  environmentCommentEntityNodesSelector,
  createVisibleEntityNodesSelector(
    environmentSamplingSizeSelector,
    (state) => state.signEntities.index
  ),
  (commentEntityNodes, signEntityNodes) => {
    if (signEntityNodes.some(({ entity: { type } }) => type === 'spawn_point')) {
      return white;
    }

    let hSVector = empty;
    let lightnessCounter = 0;
    for (const { entity } of commentEntityNodes) {
      hSVector = addColorToHSVector(hSVector, entity.type === 'chromatic' ? white : entity.color);
      lightnessCounter += getEffectiveLightnessWeight(yesterdayMs < entity.creationMs);
    }

    const [h, s] = getHueSaturation(hSVector);
    const l = getLightness(lightnessCounter);
    return fromHsl(h, s, l);
  }
);

const yesterdayMs = Date.now() - 24 * 3600 * 1000;

function addColorToHSVector(hSVector: Point, color: Color): Point {
  const { h, s } = toHsl(color);
  const colorHSVector = polarToCartesian({ azimuth: (h / 360) * Math.PI * 2, radius: s });
  return zip(hSVector, colorHSVector, _.add);
}

function getEffectiveLightnessWeight(bright: boolean): number {
  if (bright) {
    return colorCountToReachMaxLightness / brightColorCountToReachMaxLightness;
  }
  return 1;
}

function getHueSaturation(hSVector: Point): [number, number] {
  const { azimuth, radius } = cartesianToPolar(hSVector);
  const h = (azimuth / (Math.PI * 2)) * 360;
  const s = Math.min(radius / colorCountToReachMaxSaturation, maxMixedSaturation);
  return [h, s];
}

function getLightness(lightnessCounter: number): number {
  const lightness = Math.min(lightnessCounter / colorCountToReachMaxLightness, 1);
  // Make it as dark as possible, so that the effect of a newly-sent comment is salient.
  return outQuad(lightness);
}

const colorCountToReachMaxSaturation = 10;
const colorCountToReachMaxLightness = 100;
const maxMixedSaturation = 0.15;
const brightColorCountToReachMaxLightness = 7;

export default environmentAwareColorSelector;
