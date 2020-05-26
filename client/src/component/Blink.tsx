import { Container } from '@inlet/react-pixi';
import times from 'lodash/times';
import * as React from 'react';
import { ReactNode } from 'react';
import { Tweens } from '../data/tween';
import useTweens from '../hook/useTweens';
import { inQuad, outQuad } from '../shim/tsEasing';

interface Props {
  readonly children: ReactNode;
}

function Blink({ children }: Props) {
  const [alpha] = useTweens(alphaTweens, []);
  return <Container alpha={alpha}>{children}</Container>;
}

const alphaTweens: Tweens = [
  {
    to: 1,
  },
  ...times(2, () => [
    {
      to: 0,
      durationMs: 100,
      easing: outQuad,
    },
    {
      to: 1,
      durationMs: 100,
      easing: inQuad,
    },
  ]).flat(),
];

export default Blink;
