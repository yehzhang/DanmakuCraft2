import { Container } from '@inlet/react-pixi';
import * as React from 'react';
import { bottom, center, left, top } from '../data/anchors';
import { gold } from '../data/color';
import { memo } from '../shim/react';
import { PointLike } from '../shim/reactPixi';
import ShadowedText from './ShadowedText';
import { size as textSignSize } from './TextSign';

interface Props {
  readonly x: number;
  readonly y: number;
}

function WorldCenter(props: Props) {
  return (
    <Container {...props} anchor={center}>
      <ShadowedText text={'•'} color={gold} size={textSignSize / 2} />
      <ShadowedText y={textSignSize / 4} text={'⬆'} anchor={top} color={gold} size={textSignSize} />
      <ShadowedText
        y={-textSignSize / 4}
        text={'⬇'}
        anchor={bottom}
        color={gold}
        size={textSignSize}
      />
      <ShadowedText
        x={textSignSize / 4}
        text={'⬅'}
        anchor={left}
        color={gold}
        size={textSignSize}
      />
      <ShadowedText
        x={-textSignSize / 4}
        text={'⬅'}
        anchor={left}
        scale={verticalMirror}
        color={gold}
        size={textSignSize}
      />
    </Container>
  );
}

const verticalMirror: PointLike = [-1, 1];

export default memo(WorldCenter);
