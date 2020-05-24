import { render } from '@inlet/react-pixi';
import * as React from 'react';
import { isValidElement, KeyboardEvent, ReactElement, useCallback, useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { Key } from 'ts-keycode-enum';
import { Action } from '../action';
import useUncontrolledFocus from '../hook/useUncontrolledFocus';
import { selectDomain } from '../shim/domain';
import application, { setRendererView } from '../shim/pixi/application';
import { createStyleSheet } from '../shim/react';
import { useDispatch, useStore } from '../shim/redux';
import { State } from '../state';
import ErrorBoundary from './ErrorBoundary';

interface Props {
  readonly children: readonly (ReactElement | false)[];
}

function PixiStage({ children }: Props) {
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

  useEffect(() => {
    render(
      <Provider store={store}>
        <ErrorBoundary>{children.filter(isValidElement)}</ErrorBoundary>
      </Provider>,
      application.stage
    );
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
  { view, commentInputSubmitting }: State
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
      return { type: '[PixiStage] enter', keyDown, view, commentInputSubmitting };
    default:
      return null;
  }
}

export default PixiStage;
