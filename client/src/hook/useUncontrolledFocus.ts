import { DependencyList, RefObject, useCallback, useEffect } from 'react';
import { Action } from '../action';
import { useDispatch, useSelector } from '../shim/redux';
import { FocusTarget } from '../state';

function useUncontrolledFocus<T extends HTMLElement>({
  targetRef,
  focusTarget,
  onFocusActionType,
  onBlurActionType,
  extraDeps = [],
}: {
  targetRef: RefObject<T>;
  focusTarget: FocusTarget;
  onFocusActionType: SimpleAction['type'];
  onBlurActionType: SimpleAction['type'];
  extraDeps?: DependencyList;
}): {
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
  useEffect(() => {
    if (focused) {
      targetRef.current?.focus();
    } else {
      targetRef.current?.blur();
    }
  }, [focused, ...extraDeps]);

  return {
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
