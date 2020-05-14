import { Container } from '@inlet/react-pixi';
import * as React from 'react';
import { center } from '../data/anchors';
import { Color } from '../data/color';
import { memo } from '../shim/react';
import { FontStyle, PointLike } from '../shim/reactPixi';
import PlainText from './PlainText';

interface Props {
  readonly x?: number;
  readonly y?: number;
  readonly text: string;
  readonly color: Color;
  readonly size: number;
  readonly anchor?: PointLike;
  readonly fontStyle?: FontStyle;
  readonly scale?: PointLike;
}

function ShadowedText({
  x = 0,
  y = 0,
  text,
  size,
  color,
  anchor = center,
  fontStyle,
  scale,
}: Props) {
  return (
    <Container x={x} y={y}>
      <PlainText
        size={size}
        text={text}
        anchor={anchor}
        color={color}
        shadowAngle={0}
        fontStyle={fontStyle}
        scale={scale}
      />
      <PlainText
        size={size}
        text={text}
        anchor={anchor}
        color={color}
        shadowAngle={Math.PI / 2}
        fontStyle={fontStyle}
        scale={scale}
      />
      <PlainText
        size={size}
        text={text}
        anchor={anchor}
        color={color}
        shadowAngle={Math.PI}
        fontStyle={fontStyle}
        scale={scale}
      />
      <PlainText
        size={size}
        text={text}
        anchor={anchor}
        color={color}
        shadowAngle={(Math.PI / 2) * 3}
        fontStyle={fontStyle}
        scale={scale}
      />
    </Container>
  );
}

export default memo(ShadowedText);
