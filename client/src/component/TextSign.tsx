import * as React from 'react';
import { gold } from '../data/color';
import { memo } from '../shim/react';
import ShadowedText from './ShadowedText';

interface Props {
  readonly x: number;
  readonly y: number;
  readonly text: string;
}

function TextSign(props: Props) {
  return <ShadowedText {...props} color={gold} size={size} />;
}

export const size = 94;

export default memo(TextSign);
