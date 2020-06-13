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
      <div style={styles.base}>
        <span style={styles.arrowUp}>⬆</span>
        <div style={styles.baseMiddleRow}>
          <span>⬅</span>
          <span style={styles.arrowRight}>⬅</span>
        </div>
        <span style={styles.basePlate} />
        <span style={styles.arrowDown}>⬇</span>
      </div>
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
const ballTopSize = 48;
const shadowStyle = '3px 0 3px silver, -3px 0 3px silver, 0 -3px 3px silver, 0 3px 3px silver';
const baseColor = 'white';
const arrowVerticalMargin = -31;
const styles = createStyleSheet({
  container: {
    position: 'absolute',
    pointerEvents: 'none',
    fontSize: 48,
    userSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    KhtmlUserSelect: 'none',
    WebkitUserSelect: 'none',
  },
  base: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: baseColor,
    textShadow: shadowStyle,
    opacity: 0.6,
  },
  baseMiddleRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: 112,
    justifyContent: 'space-between',
  },
  arrowUp: {
    marginBottom: arrowVerticalMargin,
  },
  arrowDown: {
    marginTop: arrowVerticalMargin,
  },
  arrowRight: {
    transform: 'scaleX(-1)',
  },
  basePlate: {
    width: basePlateSize,
    height: basePlateSize,
    borderRadius: '50%',
    backgroundColor: baseColor,
    boxShadow: shadowStyle,
    marginTop: -65,
    zIndex: -1,
  },
  ballTop: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    width: ballTopSize,
    height: ballTopSize,
    backgroundColor: '#fc331c',
    boxShadow: shadowStyle,
    borderRadius: '50%',
    opacity: 0.8,
  },
});

export default memo(Joystick);
