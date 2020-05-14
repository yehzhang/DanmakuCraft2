import * as React from 'react';
import { KeyboardEvent, ReactNode, useCallback } from 'react';
import { Key } from 'ts-keycode-enum';
import { Action } from '../action';
import useUncontrolledFocus from '../hook/useUncontrolledFocus';
import { createStyleSheet } from '../shim/react';
import { useDispatch, useSelector } from '../shim/redux';
import { ViewName } from '../state';

interface Props {
  children: ReactNode;
}

function StageControls({ children }: Props) {
  const view = useSelector((state) => state.view);
  const dispatch = useDispatch();
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.stopPropagation();

      let action;
      if (e.ctrlKey || e.altKey || e.metaKey) {
        action = getActionByKeyboardEvent(e, /* keyDown= */ false, view);
      } else {
        e.preventDefault();
        action = getActionByKeyboardEvent(e, /* keyDown= */ true, view);
      }

      if (action) {
        dispatch(action);
      }
    },
    [dispatch, view]
  );
  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      e.stopPropagation();

      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      const action = getActionByKeyboardEvent(e, /* keyDown= */ false, view);
      if (action) {
        dispatch(action);
      }
    },
    [dispatch, view]
  );

  const { refCallback, onFocus, onBlur } = useUncontrolledFocus<HTMLInputElement>({
    focusTarget: 'stage',
    onFocusActionType: '[StageControls] focused',
    onBlurActionType: '[StageControls] blurred',
  });
  const onContextMenu = useCallback(() => {
    dispatch({ type: '[StageControls] context menu opened' });
  }, [dispatch]);

  return (
    <div
      ref={refCallback}
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
    // Hides the outline introduced by `tabIndex`.
    outline: 'none',
  },
});

function getActionByKeyboardEvent(
  event: KeyboardEvent,
  keyDown: boolean,
  view: ViewName
): Action | null {
  switch (event.which || event.keyCode) {
    case Key.UpArrow:
    case Key.W:
      return { type: '[StageControls] up', keyDown };
    case Key.DownArrow:
    case Key.S:
      return { type: '[StageControls] down', keyDown };
    case Key.LeftArrow:
    case Key.A:
      return { type: '[StageControls] left', keyDown };
    case Key.RightArrow:
    case Key.D:
      return { type: '[StageControls] right', keyDown };
    case Key.Enter:
      return { type: '[StageControls] enter', keyDown, view };
    default:
      return null;
  }
}

export default StageControls;
