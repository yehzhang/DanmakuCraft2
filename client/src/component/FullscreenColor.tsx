import { Sprite } from '@inlet/react-pixi';
import { Texture } from '@pixi/core';
import * as React from 'react';
import { Color, toRgbNumber } from '../data/color';
import { useSelector } from '../shim/redux';

interface Props {
  readonly color: Color;
  readonly alpha?: number;
}

function FullscreenColor({ color, alpha = 1 }: Props) {
  const { x: width, y: height } = useSelector((state) => state.containerSize);
  return (
    <Sprite
      width={width}
      height={height}
      texture={Texture.WHITE}
      tint={toRgbNumber(color)}
      alpha={alpha}
    />
  );
}

export default FullscreenColor;
