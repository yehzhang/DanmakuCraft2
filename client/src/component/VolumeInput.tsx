import * as React from 'react';
import { useCallback } from 'react';
import useHovered from '../hook/useHovered';
import useTimerState from '../hook/useTimerState';
import { createStyleSheet } from '../shim/react';
import { useDispatch, useSelector } from '../shim/redux';

function VolumeInput() {
  const speakerOn = useSelector((state) => state.volume > 0);

  const dispatch = useDispatch();
  const onClick = useCallback(() => {
    dispatch({ type: '[VolumeInput] turned', on: !speakerOn });
  }, [dispatch, speakerOn]);

  const { hovered, onMouseOver, onMouseOut } = useHovered();
  const opacity = useTimerState(
    (elapsedMs) => {
      if (elapsedMs < 3000) {
        return 0;
      }
      if (elapsedMs < 10000) {
        return 1;
      }
      return hovered ? 1 : 0.1;
    },
    0,
    []
  );
  return (
    <span
      style={{
        ...styles.button,
        opacity,
      }}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onClick={onClick}
    >
      {speakerOn ? '🔊' : '🔇'}
    </span>
  );
}

const styles = createStyleSheet({
  button: {
    position: 'absolute',
    transform: 'translateX(8px) translateY(8px)',
    cursor: 'pointer',
    transitionProperty: 'opacity',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease-in-out',
    fontSize: 18,
    userSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    KhtmlUserSelect: 'none',
    WebkitUserSelect: 'none',
  },
});

export default VolumeInput;
