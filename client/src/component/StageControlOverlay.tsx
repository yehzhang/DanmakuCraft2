import clamp from 'lodash/clamp';
import find from 'lodash/find';
import subtract from 'lodash/subtract';
import * as React from 'react';
import {
  KeyboardEvent,
  TouchEvent,
  TouchList,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react';
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
    dispatchDrag(null);
    dispatch({ type: '[StageControlOverlay] blurred' });
  }, [dispatch]);
  const onContextMenu = useCallback(() => {
    dispatchDrag(null);
    dispatch({ type: '[StageControlOverlay] context menu opened' });
  }, [dispatch]);

  // Joystick.
  const [drag, dispatchDrag] = useReducer(dragReducer, null);
  const onTouchEvent = useCallback(({ touches }: TouchEvent) => {
    if (elementRef.current) {
      dispatchDrag({
        touches,
        parentElement: elementRef.current,
      });
    }
  }, []);
  useEffect(() => {
    if (!drag) {
      dispatch({ type: '[StageControlOverlay] drag ended' });
      return;
    }
    dispatch({
      type: '[StageControlOverlay] dragged',
      startOffsetRatio: map(drag.offset, (x) => x / maxDragOffset),
    });
  }, [dispatch, drag]);

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
      onTouchStart={onTouchEvent}
      onTouchMove={onTouchEvent}
      onTouchEnd={onTouchEvent}
      onTouchCancel={onTouchEvent}
    >
      {drag && (
        <Joystick
          {...drag.startPosition}
          ballTopOffsetX={drag.offset.x}
          ballTopOffsetY={drag.offset.y}
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

type DragState = {
  readonly id: number;
  readonly startPosition: Point;
  readonly offset: Point;
} | null;

type DragAction = {
  readonly touches: TouchList;
  readonly parentElement: Element;
} | null;

function dragReducer(state: DragState, action: DragAction): DragState {
  if (!action) {
    return null;
  }

  const { touches, parentElement } = action;
  if (!state) {
    if (!touches.length) {
      return state;
    }

    const touch = touches[0];
    return {
      startPosition: getLocalPositionFromClientArea(touch, parentElement),
      id: touch.identifier,
      offset: empty,
    };
  }

  const { id, startPosition, offset } = state;
  const touch = find(touches, (touch_) => touch_.identifier === id);
  if (!touch) {
    return dragReducer(/* state= */ null, action);
  }

  const currentPosition = getLocalPositionFromClientArea(touch, parentElement);
  // TODO circle
  const currentOffset = map(zip(currentPosition, startPosition, subtract), (x) =>
    clamp(x, -maxDragOffset, maxDragOffset)
  );
  if (equal(currentOffset, offset)) {
    return state;
  }
  return {
    ...state,
    offset: currentOffset,
  };
}

const maxDragOffset = 50;

function getLocalPositionFromClientArea(
  { clientX, clientY }: { clientX: number; clientY: number },
  parentElement: Element
): Point {
  const clientPosition = { x: clientX, y: clientY };
  const boundingClientRect = parentElement.getBoundingClientRect();
  return zip(clientPosition, boundingClientRect, subtract);
}

export default StageControlOverlay;
