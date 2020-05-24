import add from 'lodash/add';
import subtract from 'lodash/subtract';
import * as React from 'react';
import { useState } from 'react';
import { Channel1, Channel255, maxChannel255Value } from '../data/channel';
import { fromRgb, mapRgb, Rgb, toRgb, visiblyEqualColors, zipRgb } from '../data/color';
import useTick from '../hook/useTick';
import environmentAwareColorSelector from '../selector/environmentAwareColorSelector';
import { useSelector } from '../shim/redux';
import FullscreenColor from './FullscreenColor';

function EnvironmentAwareFullscreenColor() {
  const targetColor = useSelector(environmentAwareColorSelector, visiblyEqualColors);
  const targetTRgb = mapRgb(toRgb(targetColor), normalizeChannel255);
  const [tRgb, setTRgb] = useState<Rgb<Channel1>>(targetTRgb);
  useTick((deltaMs: number) => {
    if (tRgb.r === targetTRgb.r && tRgb.g === targetTRgb.g && tRgb.b === targetTRgb.b) {
      return;
    }
    const nextTRgb = approximateTRgb(tRgb, targetTRgb, deltaMs);
    setTRgb(nextTRgb);
  });
  const color = fromRgb(mapRgb(tRgb, toChannel255));
  return <FullscreenColor color={color} />;
}

function approximateTRgb(
  tRgb: Rgb<Channel1>,
  targetTRgb: Rgb<Channel1>,
  deltaMs: number
): Rgb<Channel1> {
  const deltaTRgb = zipRgb(targetTRgb, tRgb, subtract);
  const normalizedDeltaTRgb = normalizeDeltaTRgb(deltaTRgb, deltaMs);
  return zipRgb(tRgb, normalizedDeltaTRgb, add);
}

const endToEndTransitionMs = 10 * 1000;

function normalizeDeltaTRgb(deltaTRgb: Rgb<Channel1>, deltaMs: number): Rgb<Channel1> {
  const maxDeltaTToTransition = deltaMs / endToEndTransitionMs;
  const maxDeltaTPerChannel = Math.max(
    Math.abs(deltaTRgb.r),
    Math.abs(deltaTRgb.g),
    Math.abs(deltaTRgb.b)
  );
  const deltaTCappingRatio = Math.min(maxDeltaTToTransition / maxDeltaTPerChannel, 1);
  return mapRgb(deltaTRgb, (x) => x * deltaTCappingRatio);
}

function normalizeChannel255(value: Channel255): Channel1 {
  return (value / maxChannel255Value) ** 2;
}

function toChannel255(value: Channel1): Channel255 {
  return Math.sqrt(value) * maxChannel255Value;
}

export default EnvironmentAwareFullscreenColor;
