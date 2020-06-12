import * as React from 'react';
import { KeyboardEvent, MouseEvent, useCallback, useRef, useState } from 'react';
import { Key } from 'ts-keycode-enum';
import { Action } from '../action';
import { Point } from '../data/point';
import useFocusState from '../hook/useFocusState';
import { createStyleSheet } from '../shim/react';
import { useDispatch, useStore } from '../shim/redux';
import { State } from '../state';

interface Props {
  children: React.ReactNode;
}

function StageBodyControl({ children }: Props) {
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

  const elementRef = useRef<HTMLDivElement>(null);
  useFocusState({
    targetRef: elementRef,
    focusTarget: 'stage',
  });
  const onFocus = useCallback(() => {
    dispatch({ type: '[StageBodyControl] focused' });
  }, [dispatch]);
  const onBlur = useCallback(() => {
    dispatch({ type: '[StageBodyControl] blurred' });
  }, [dispatch]);
  const onContextMenu = useCallback(() => {
    dispatch({ type: '[StageBodyControl] context menu opened' });
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
    >
      {children}
    </div>
  );
}

const styles = createStyleSheet({
  container: {
    // Inherit height from parent.
    display: 'flex',
    // Hides the outline introduced by `tabIndex`.
    outline: 'none',
  },
});

function getActionByKeyboardEvent(
  event: KeyboardEvent,
  keyDown: boolean,
  { view, commentInputSubmitting }: State
): Action | null {
  switch (event.which || event.keyCode) {
    case Key.UpArrow:
    case Key.W:
      return { type: '[StageBodyControl] up', keyDown };
    case Key.DownArrow:
    case Key.S:
      return { type: '[StageBodyControl] down', keyDown };
    case Key.LeftArrow:
    case Key.A:
      return { type: '[StageBodyControl] left', keyDown };
    case Key.RightArrow:
    case Key.D:
      return { type: '[StageBodyControl] right', keyDown };
    case Key.Enter:
      return { type: '[StageBodyControl] enter', keyDown, view, commentInputSubmitting };
    default:
      return null;
  }
}

export default StageBodyControl;
