import { render } from '@inlet/react-pixi';
import * as React from 'react';
import { isValidElement, KeyboardEvent, ReactElement, useCallback, useEffect, useRef } from 'react';
import { Provider, useStore } from 'react-redux';
import { Key } from 'ts-keycode-enum';
import { Action } from '../action';
import useUncontrolledFocus from '../hook/useUncontrolledFocus';
import { selectDomain } from '../shim/domain';
import application, { setRendererView } from '../shim/pixi/application';
import { createStyleSheet } from '../shim/react';
import { useDispatch, useSelector } from '../shim/redux';
import { ViewName } from '../state';

interface Props {
  readonly children: readonly (ReactElement | false)[];
}

function PixiStage({ children }: Props) {
  const view = useSelector((state) => state.view);
  const dispatch = useDispatch();
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      event.stopPropagation();

      let action;
      if (event.ctrlKey || event.altKey || event.metaKey) {
        action = getActionByKeyboardEvent(event, /* keyDown= */ false, view);
      } else {
        event.preventDefault();
        action = getActionByKeyboardEvent(event, /* keyDown= */ true, view);
      }

      if (action) {
        dispatch(action);
      }
    },
    [dispatch, view]
  );
  const onKeyUp = useCallback(
    (event: KeyboardEvent) => {
      event.stopPropagation();

      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      const action = getActionByKeyboardEvent(event, /* keyDown= */ false, view);
      if (action) {
        dispatch(action);
      }
    },
    [dispatch, view]
  );

  const elementRef = useRef<HTMLCanvasElement>(null);
  const { onFocus, onBlur } = useUncontrolledFocus({
    targetRef: elementRef,
    focusTarget: 'stage',
    onFocusActionType: '[PixiStage] focused',
    onBlurActionType: '[PixiStage] blurred',
  });
  const onContextMenu = useCallback(() => {
    dispatch({ type: '[PixiStage] context menu opened' });
  }, [dispatch]);

  useEffect(() => {
    if (elementRef.current) {
      setRendererView(elementRef.current);
    }
  }, []);

  const store = useStore();
  useEffect(() => {
    render(<Provider store={store}>{children.filter(isValidElement)}</Provider>, application.stage);
  }, [store, children]);

  return (
    <canvas
      ref={elementRef}
      style={styles.canvas}
      tabIndex={1}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onFocus={onFocus}
      onBlur={onBlur}
      onContextMenu={onContextMenu}
    />
  );
}

const styles = createStyleSheet({
  canvas: {
    boxShadow: selectDomain({
      danmakucraft: '0 3px 6px rgba(0, 0, 0, 0.05), 0 3px 6px rgba(0, 0, 0, 0.05)',
    }),

    // Make height compatible with parent.
    display: 'flex',

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
      return { type: '[PixiStage] up', keyDown };
    case Key.DownArrow:
    case Key.S:
      return { type: '[PixiStage] down', keyDown };
    case Key.LeftArrow:
    case Key.A:
      return { type: '[PixiStage] left', keyDown };
    case Key.RightArrow:
    case Key.D:
      return { type: '[PixiStage] right', keyDown };
    case Key.Enter:
      return { type: '[PixiStage] enter', keyDown, view };
    default:
      return null;
  }
}

export default PixiStage;
