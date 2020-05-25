import * as React from 'react';
import { useRef, useState } from 'react';
import { Channel255 } from '../data/channel';
import { Color, fromRgbNumbers } from '../data/color';
import { lerp } from '../data/interpolation';
import useTick from '../hook/useTick';
import { memo } from '../shim/react';
import ShadowedText from './ShadowedText';

interface Props {
  readonly x?: number;
  readonly y?: number;
  readonly text: string;
  readonly size: number;
}

function ChromaticComment({ x, y, text, size }: Props) {
  const color = useChromaticColor();
  return <ShadowedText x={x} y={y} text={text} size={size} tint={color} />;
}

function useChromaticColor(): Color {
  const r = usePausablyBouncingChannel();
  const g = usePausablyBouncingChannel();
  const b = usePausablyBouncingChannel();
  return fromRgbNumbers(r, g, b);
}

function usePausablyBouncingChannel(): Channel255 {
  const [value, setValue] = useState(maxChannelValue);
  const pauseMsRef = useRef(0);
  const transitionVelocityRef = useRef(0);
  useTick((deltaMs: number) => {
    pauseMsRef.current -= deltaMs;
    if (pauseMsRef.current > 0) {
      return;
    }

    let nextValue = value + transitionVelocityRef.current;
    if (maxChannelValue <= nextValue) {
      nextValue = maxChannelValue;
      transitionVelocityRef.current = -nextChannelTransitionVelocity();
    } else if (nextValue <= minChannelValue) {
      nextValue = minChannelValue;
      transitionVelocityRef.current = nextChannelTransitionVelocity();
    }
    setValue(nextValue);

    if (Math.random() < 0.00012 * deltaMs) {
      pauseMsRef.current = lerp(4000, 7000, Math.random());
    }
  });

  return value;
}

function nextChannelTransitionVelocity(): number {
  return lerp(0.1, 4, Math.random());
}

const maxChannelValue = 255;
const minChannelValue = 128;

export default memo(ChromaticComment);
