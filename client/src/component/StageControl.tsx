import * as React from 'react';
import { KeyboardEvent, useCallback, useRef } from 'react';
import { Key } from 'ts-keycode-enum';
import { Action } from '../action';
import useUncontrolledFocus from '../hook/useUncontrolledFocus';
import { createStyleSheet } from '../shim/react';
import { useDispatch, useStore } from '../shim/redux';
import { State } from '../state';

interface Props {
  children: React.ReactNode;
}

function StageControl({ children }: Props) {
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
  const { onFocus, onBlur } = useUncontrolledFocus({
    targetRef: elementRef,
    focusTarget: 'stage',
    onFocusActionType: '[StageControl] focused',
    onBlurActionType: '[StageControl] blurred',
  });
  const onContextMenu = useCallback(() => {
    dispatch({ type: '[StageControl] context menu opened' });
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
      return { type: '[StageControl] up', keyDown };
    case Key.DownArrow:
    case Key.S:
      return { type: '[StageControl] down', keyDown };
    case Key.LeftArrow:
    case Key.A:
      return { type: '[StageControl] left', keyDown };
    case Key.RightArrow:
    case Key.D:
      return { type: '[StageControl] right', keyDown };
    case Key.Enter:
      return { type: '[StageControl] enter', keyDown, view, commentInputSubmitting };
    default:
      return null;
  }
}

export default StageControl;
