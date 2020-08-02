import { Container } from '@inlet/react-pixi';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { center } from '../data/anchors';
import { Color } from '../data/color';
import visibleCommentEntityNodesSelector from '../selector/visibleCommentEntityNodesSelector';
import application from '../shim/pixi/application';
import { memo } from '../shim/react';
import { FontStyle, PointLike } from '../shim/reactPixi';
import store from '../store';
import PlainText from './PlainText';

interface Props {
  readonly x?: number;
  readonly y?: number;
  readonly text: string;
  readonly color?: Color;
  readonly tint?: Color;
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
  tint,
  anchor = center,
  fontStyle,
  scale,
}: Props) {
  const [render, setRender] = useState(false);
  useEffect(() => {
    setRenders.push(setRender);
  }, []);

  return !render ? null : (
    <Container x={x} y={y}>
      <PlainText
        size={size}
        text={text}
        anchor={anchor}
        color={color}
        tint={tint}
        shadowAngle={0}
        fontStyle={fontStyle}
        scale={scale}
      />
      <PlainText
        size={size}
        text={text}
        anchor={anchor}
        color={color}
        tint={tint}
        shadowAngle={Math.PI / 2}
        fontStyle={fontStyle}
        scale={scale}
      />
      <PlainText
        size={size}
        text={text}
        anchor={anchor}
        color={color}
        tint={tint}
        shadowAngle={Math.PI}
        fontStyle={fontStyle}
        scale={scale}
      />
      <PlainText
        size={size}
        text={text}
        anchor={anchor}
        color={color}
        tint={tint}
        shadowAngle={(Math.PI / 2) * 3}
        fontStyle={fontStyle}
        scale={scale}
      />
    </Container>
  );
}

const setRenders: ((render: boolean) => void)[] = [];
let lastCommentEntities: object | null = null;

application.ticker.add(() => {
  const commentEntities = visibleCommentEntityNodesSelector(store.getState());
  if (commentEntities !== lastCommentEntities) {
    lastCommentEntities = commentEntities;
    return;
  }

  const setRender = setRenders.pop();
  if (!setRender) {
    return;
  }

  setRender(true);
});

export default memo(ShadowedText);
