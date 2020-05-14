import * as React from 'react';
import { useEffect } from 'react';
import { Color } from '../data/color';
import { Tweens } from '../data/tween';
import useTweens from '../hook/useTweens';
import { memo } from '../shim/react';
import { outQuad } from '../shim/tsEasing';
import FullscreenColor from './FullscreenColor';

interface Props {
  readonly color: Color;
  readonly onComplete: () => void;
}

function OpeningFadeOut({ color, onComplete }: Props) {
  const [alpha, tweenDone] = useTweens(alphaTweens, []);

  useEffect(() => {
    if (tweenDone) {
      onComplete();
    }
  }, [tweenDone]);

  return <FullscreenColor color={color} alpha={alpha} />;
}

const alphaTweens: Tweens = [
  { durationMs: 2400 },
  {
    to: 1,
    easing: outQuad,
    durationMs: 1000,
  },
];

export default memo(OpeningFadeOut);
