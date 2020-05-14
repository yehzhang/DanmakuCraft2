import * as PIXI from 'pixi.js';
import { defaultFontStyle, getTextStyleProperties } from '../../component/PlainText';
import { Point } from '../../data/point';
import { FontStyle } from '../reactPixi';

function measureTextDimensions({
  text,
  size,
  fontStyle = defaultFontStyle,
}: {
  readonly text: string;
  readonly size: number;
  readonly fontStyle?: FontStyle;
}): Point {
  dummyPixiText.text = text;
  dummyPixiText.style.fontSize = size;
  dummyPixiText.style.fontStyle = fontStyle;
  dummyPixiText.getLocalBounds(rectangleBuffer);

  const { left, right, top, bottom } = rectangleBuffer;
  return { x: right - left, y: bottom - top };
}

// Dummy `Text` object to measure text dimensions.
const dummyPixiText = new PIXI.Text('', getTextStyleProperties(0, null, null));
// `Rectangle` to be shared as a buffer.
const rectangleBuffer = new PIXI.Rectangle();

export default measureTextDimensions;
