import { Text } from '@inlet/react-pixi';
import * as React from 'react';
import { topLeft } from '../data/anchors';
import { black, Color, toRgbNumber, white } from '../data/color';
import resolution from '../data/resolution';
import { memo } from '../shim/react';
import { FontStyle, FontWeight, PointLike, TextStyleProperties } from '../shim/reactPixi';

interface Props {
  readonly x?: number;
  readonly y?: number;
  readonly text: string;
  readonly color: Color;
  readonly size: number;
  readonly anchor?: PointLike;
  readonly scale?: PointLike;
  readonly fontStyle?: FontStyle;
  readonly fontWeight?: FontWeight;
  readonly wordWrapWidth?: number;
  readonly shadowAngle?: number;
  readonly alpha?: number;
}

function PlainText({
  text,
  color,
  size,
  x = 0,
  y = 0,
  fontStyle,
  anchor = topLeft,
  scale = 1,
  shadowAngle,
  fontWeight,
  wordWrapWidth,
  alpha = 1,
}: Props) {
  return (
    <Text
      style={getTextStyleProperties(
        size,
        shadowAngle === undefined ? null : shadowAngle,
        wordWrapWidth === undefined ? null : wordWrapWidth,
        fontWeight,
        fontStyle
      )}
      x={x}
      y={y}
      text={text}
      anchor={anchor}
      scale={scale}
      tint={toRgbNumber(color)}
      alpha={alpha}
    />
  );
}

export function getTextStyleProperties(
  fontSize: number,
  shadowAngle: number | null,
  wordWrapWidth: number | null,
  fontWeight: FontWeight = 'normal',
  fontStyle: FontStyle = defaultFontStyle
): TextStyleProperties {
  return {
    fontFamily: 'SimHei, "Microsoft JhengHei", Arial, Helvetica, sans-serif',
    fontWeight,
    fill: toRgbNumber(white),
    fontSize,
    lineHeight: fontSize,
    fontStyle,

    // Apply text shadow.
    dropShadow: shadowAngle !== null,
    dropShadowColor: toRgbNumber(black),
    // The original style is one pixel blur and one pixel offset.
    // However, resolution is not supported for shadow, so we do this.
    dropShadowBlur: resolution,
    dropShadowDistance: resolution,
    dropShadowAngle: shadowAngle || 0,

    // Hack to prevent Chinese characters from being clipped.
    // For font size 25, padding 5 is ok.
    // For font size 94, padding 13 is ok.
    padding: Math.ceil(((fontSize - 25) / 69) * 8 + 5),

    wordWrap: wordWrapWidth !== null,
    wordWrapWidth: wordWrapWidth || 0,
    breakWords: true,
  };
}

export const defaultFontStyle: FontStyle = 'normal';

export default memo(PlainText);
