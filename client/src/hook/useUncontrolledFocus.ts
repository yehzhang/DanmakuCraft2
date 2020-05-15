import { DependencyList, RefCallback, useCallback, useEffect, useRef } from 'react';
import { Action } from '../action';
import { useDispatch, useSelector } from '../shim/redux';
import { FocusTarget } from '../state';

function useUncontrolledFocus<T extends HTMLElement>({
  focusTarget,
  onFocusActionType,
  onBlurActionType,
  extraDeps = [],
}: {
  focusTarget: FocusTarget;
  onFocusActionType: SimpleAction['type'];
  onBlurActionType: SimpleAction['type'];
  extraDeps?: DependencyList;
}): {
  refCallback: RefCallback<T | null>;
  onFocus: () => void;
  onBlur: () => void;
} {
  const dispatch = useDispatch();
  const onFocus = useCallback(() => {
    dispatch({ type: onFocusActionType });
  }, [dispatch, onFocusActionType]);
  const onBlur = useCallback(() => {
    dispatch({ type: onBlurActionType });
  }, [dispatch, onBlurActionType]);

  const focused = useSelector((state) => state.focus === focusTarget);
  const targetRef = useRef<T | null>(null);
  const dispatchFocusedState = useCallback(
    (target: T) => {
      if (focused) {
        target.focus();
      } else {
        target.blur();
      }
    },
    [focused]
  );
  useEffect(() => {
    if (targetRef.current) {
      dispatchFocusedState(targetRef.current);
    }
  }, [dispatchFocusedState, ...extraDeps]);

  const refCallback = useCallback(
    (instance: T | null) => {
      if (!instance) {
        return;
      }
      targetRef.current = instance;
      dispatchFocusedState(instance);
    },
    [dispatchFocusedState]
  );

  return {
    refCallback,
    onFocus,
    onBlur,
  };
}

type SimpleAction = GetSimpleActionDistributiveHack<Action>;

type GetSimpleActionDistributiveHack<T extends Action> = T extends unknown
  ? GetSimpleAction<T>
  : never;

type GetSimpleAction<T extends Action> = Pick<T, 'type'> extends T ? T : never;

export default useUncontrolledFocus;
