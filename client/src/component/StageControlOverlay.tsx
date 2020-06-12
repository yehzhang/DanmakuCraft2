import clamp from 'lodash/clamp';
import subtract from 'lodash/subtract';
import * as React from 'react';
import { KeyboardEvent, MouseEvent, useCallback, useRef, useState } from 'react';
import { Key } from 'ts-keycode-enum';
import { Action } from '../action';
import { empty, equal, map, Point, zip } from '../data/point';
import useFocusState from '../hook/useFocusState';
import { createStyleSheet } from '../shim/react';
import { useDispatch, useStore } from '../shim/redux';
import { State } from '../state';
import Joystick from './Joystick';

function StageControlOverlay() {
  // Keyboard.
  const store = useStore();
  const dispatch = useDispatch();
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      event.stopPropagation();

      const state = store.getState();
      let action;
      if (event.ctrlKey || event.altKey || event.metaKey) {
        action = getActionByKeyboardEvent(event, /* keyDown= */ false, state);
      } else {
        event.preventDefault();
        action = getActionByKeyboardEvent(event, /* keyDown= */ true, state);
      }

      if (action) {
        dispatch(action);
      }
    },
    [dispatch, store]
  );
  const onKeyUp = useCallback(
    (event: KeyboardEvent) => {
      event.stopPropagation();

      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      const action = getActionByKeyboardEvent(event, /* keyDown= */ false, store.getState());
      if (action) {
        dispatch(action);
      }
    },
    [dispatch, store]
  );

  // Focus and blur.
  const elementRef = useRef<HTMLDivElement>(null);
  useFocusState({
    targetRef: elementRef,
    focusTarget: 'stage',
  });
  const onFocus = useCallback(() => {
    dispatch({ type: '[StageControlOverlay] focused' });
  }, [dispatch]);
  const onBlur = useCallback(() => {
    setDragStartPosition(null);
    dispatch({ type: '[StageControlOverlay] blurred' });
  }, [dispatch]);
  const onContextMenu = useCallback(() => {
    setDragStartPosition(null);
    dispatch({ type: '[StageControlOverlay] context menu opened' });
  }, [dispatch]);

  // Joystick.
  const [dragStartPosition, setDragStartPosition] = useState<Point | null>(null);
  const [dragStartOffset, setDragStartOffset] = useState<Point>(empty);
  const onMouseDown = useCallback(
    (event: MouseEvent) => {
      if (!elementRef.current) {
        return;
      }

      const startPosition = getMousePosition(event, elementRef.current);
      if (dragStartPosition && equal(startPosition, dragStartPosition)) {
        return;
      }

      setDragStartPosition(startPosition);
      setDragStartOffset(empty);
    },
    [dragStartPosition]
  );
  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!dragStartPosition || !elementRef.current) {
        return;
      }

      const currentPosition = getMousePosition(event, elementRef.current);
      const startOffset = map(zip(currentPosition, dragStartPosition, subtract), (x) =>
        clamp(x, -maxDragOffset, maxDragOffset)
      );
      if (equal(startOffset, dragStartOffset)) {
        return;
      }
      setDragStartOffset(startOffset);

      dispatch({
        type: '[StageControlOverlay] mouse dragged',
        startOffsetRatio: map(startOffset, (x) => x / maxDragOffset),
      });
    },
    [dispatch, dragStartPosition, dragStartOffset]
  );
  const onMouseUp = useCallback(() => {
    setDragStartPosition(null);
    dispatch({ type: '[StageControlOverlay] mouse up' });
  }, [dispatch]);
  const onMouseOut = useCallback(() => {
    setDragStartPosition(null);
    dispatch({ type: '[StageControlOverlay] mouse out' });
  }, [dispatch]);

  return (
    <div
      ref={elementRef}
      style={styles.container}
      tabIndex={1}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onFocus={onFocus}
      onBlur={onBlur}
      onContextMenu={onContextMenu}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseOut={onMouseOut}
    >
      {dragStartPosition && (
        <Joystick
          {...dragStartPosition}
          ballTopOffsetX={dragStartOffset.x}
          ballTopOffsetY={dragStartOffset.y}
        />
      )}
    </div>
  );
}

const styles = createStyleSheet({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    // Hides the outline introduced by `tabIndex`.
    outline: 'none',
  },
});

const maxDragOffset = 100;

function getActionByKeyboardEvent(
  event: KeyboardEvent,
  keyDown: boolean,
  { commentInputSubmitting }: State
): Action | null {
  switch (event.which || event.keyCode) {
    case Key.UpArrow:
    case Key.W:
      return { type: '[StageControlOverlay] up', keyDown };
    case Key.DownArrow:
    case Key.S:
      return { type: '[StageControlOverlay] down', keyDown };
    case Key.LeftArrow:
    case Key.A:
      return { type: '[StageControlOverlay] left', keyDown };
    case Key.RightArrow:
    case Key.D:
      return { type: '[StageControlOverlay] right', keyDown };
    case Key.Enter:
      return { type: '[StageControlOverlay] enter', keyDown, commentInputSubmitting };
    default:
      return null;
  }
}

function getMousePosition({ clientX, clientY }: MouseEvent, parentElement: Element): Point {
  const clientPosition = { x: clientX, y: clientY };
  const boundingClientRect = parentElement.getBoundingClientRect();
  return zip(clientPosition, boundingClientRect, subtract);
}

export default StageControlOverlay;
