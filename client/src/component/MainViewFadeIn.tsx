import * as React from 'react';
import { white } from '../data/color';
import { Tweens } from '../data/tween';
import useTweens from '../hook/useTweens';
import { inQuad } from '../shim/tsEasing';
import FullscreenColor from './FullscreenColor';

function MainViewFadeIn() {
  const [alpha] = useTweens(alphaTweens, []);
  return <FullscreenColor color={white} alpha={alpha} />;
}

const alphaTweens: Tweens = [
  {
    to: 1,
  },
  {
    durationMs: 500,
  },
  {
    to: 0,
    easing: inQuad,
    durationMs: 2500,
  },
];

export default MainViewFadeIn;
