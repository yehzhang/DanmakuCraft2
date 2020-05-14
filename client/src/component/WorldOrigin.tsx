import * as React from 'react';
import { gold } from '../data/color';
import { memo } from '../shim/react';
import { FontStyle } from '../shim/reactPixi';
import ShadowedText from './ShadowedText';
import { size as textSignSize } from './TextSign';

interface Props {
  readonly x: number;
  readonly y: number;
}

function WorldOrigin(props: Props) {
  return (
    <ShadowedText {...props} text={text} fontStyle={fontStyle} color={gold} size={textSignSize} />
  );
}

export const fontStyle: FontStyle = 'italic';

export const text = 'O';

export default memo(WorldOrigin);
