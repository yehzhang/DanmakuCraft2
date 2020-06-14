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
      <div style={styles.base} />
      <div
        style={{
          ...styles.ballTop,
          left: ballTopOffsetX,
          top: ballTopOffsetY,
        }}
      />
    </div>
  );
}

const basePlateSize = 64;
const ballTopSize = 52;
const shadowStyle = '2px 0 2px silver, -2px 0 2px silver, 0 -2px 2px silver, 0 2px 2px silver';
const baseColor = 'white';
const styles = createStyleSheet({
  container: {
    position: 'absolute',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    KhtmlUserSelect: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  base: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    width: basePlateSize,
    height: basePlateSize,
    borderRadius: '50%',
    backgroundColor: baseColor,
    boxShadow: shadowStyle,
    opacity: 0.4,
  },
  ballTop: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    width: ballTopSize,
    height: ballTopSize,
    borderRadius: '50%',
    backgroundColor: '#fc331c',
    boxShadow: shadowStyle,
    opacity: 0.6,
  },
});

export default memo(Joystick);
