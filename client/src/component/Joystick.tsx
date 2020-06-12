import * as React from 'react';
import { createStyleSheet, memo } from '../shim/react';

interface Props {
  x: number;
  y: number;
  ballTopOffsetX: number;
  ballTopOffsetY: number;
}

function Joystick({ x, y, ballTopOffsetX, ballTopOffsetY }: Props) {
  return (
    <div
      style={{
        ...styles.container,
        left: x,
        top: y,
      }}
    >
      <div style={styles.joystickBase}>Base</div>
      <div
        style={{
          ...styles.ballTop,
          left: ballTopOffsetX,
          top: ballTopOffsetY,
        }}
      >
        Ball Top
      </div>
    </div>
  );
}

const styles = createStyleSheet({
  container: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  joystickBase: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    background: 'red',
  },
  ballTop: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    background: 'yellow',
  },
});

export default memo(Joystick);
