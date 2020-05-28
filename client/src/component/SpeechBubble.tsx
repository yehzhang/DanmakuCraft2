import { Container, Sprite } from '@inlet/react-pixi';
import add from 'lodash/add';
import * as PIXI from 'pixi.js';
import * as React from 'react';
import { useEffect } from 'react';
import { center } from '../data/anchors';
import { black, Color, toRgbNumber, white } from '../data/color';
import { I18nTextIdentifier } from '../data/i18n';
import i18nData from '../data/i18n/zh';
import { Point, zip } from '../data/point';
import { Tweens } from '../data/tween';
import useTexture from '../hook/useTexture';
import useTweens from '../hook/useTweens';
import wrapDrawWithShadow from '../shim/pixi/wrapDrawWithShadow';
import { useDispatch, useSelector } from '../shim/redux';
import { inQuad, outQuad } from '../shim/tsEasing';
import { JustText } from '../state';
import PlainText from './PlainText';

function SpeechBubble() {
  const texture = useTexture(draw);
  const notificationState = useSelector((state) => state.notification);
  if (notificationState === null) {
    return null;
  }
  const { id, message } = notificationState;
  return <SpeechBubble_ key={id} message={message} texture={texture} />;
}

interface Props {
  readonly message: I18nTextIdentifier | JustText;
  readonly texture: PIXI.Texture;
}

function SpeechBubble_({ message, texture }: Props) {
  const { x, y } = useBubblePosition();
  const [dy, tweenDone] = useTweens(bubbleTweens, []);

  const dispatch = useDispatch();
  useEffect(() => {
    if (tweenDone) {
      dispatch({ type: '[SpeechBubble] display expired' });
    }
  }, [dispatch, tweenDone]);

  const i18nText = useMessage(message);
  return (
    <Container x={x} y={y + dy}>
      <Sprite texture={texture} anchor={center} />
      <PlainText
        y={textCenteringYOffset}
        text={i18nText}
        color={black}
        size={18}
        fontWeight="bold"
        anchor={center}
        wordWrapWidth={150}
      />
    </Container>
  );
}

function useMessage(message: I18nTextIdentifier | JustText): string {
  if (typeof message === 'string') {
    return i18nData[message];
  }

  const { just }: JustText = message;
  return just;
}

function useBubblePosition(): Point {
  const playerPosition = useSelector((state) => state.player.position);
  return zip(playerPosition, bubbleTailToCenterOffsets, add);
}

const bubbleTailToCenterOffsets: Point = {
  x: 43,
  y: -90 - 50, // Offset from tail to center + top of the player
};

const textCenteringYOffset = -8;

const bubbleTweens: Tweens = [
  // Popup
  {
    to: -10,
    easing: outQuad,
    durationMs: 70,
  },
  {
    to: 0,
    easing: inQuad,
    durationMs: 70,
  },
  // Hold
  {
    durationMs: 6000,
  },
];

const draw = wrapDrawWithShadow(
  black,
  white,
  (graphics: PIXI.Graphics, outline: Color, fill: Color) => {
    graphics
      .moveTo(16, 16)
      .lineStyle(4, toRgbNumber(outline))
      .beginFill(toRgbNumber(fill))
      .lineTo(172, 4)
      .bezierCurveTo(198, 4, 194, 28, 194, 28)
      .lineTo(180, 130)
      .bezierCurveTo(178, 150, 158, 148, 158, 148)
      .lineTo(102, 148)
      .lineTo(58, 180)
      .lineTo(66, 148)
      .lineTo(28, 148)
      .bezierCurveTo(14, 148, 12, 130, 12, 130)
      .lineTo(4, 32)
      .bezierCurveTo(2, 18, 16, 16, 16, 16)
      .endFill();
  }
);

export default SpeechBubble;
