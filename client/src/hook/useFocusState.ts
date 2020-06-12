import { DependencyList, RefObject, useEffect } from 'react';
import { useSelector } from '../shim/redux';
import { FocusTarget } from '../state';

function useFocusState<T extends HTMLElement>({
  targetRef,
  focusTarget,
  extraDeps = [],
}: {
  targetRef: RefObject<T>;
  focusTarget: FocusTarget;
  extraDeps?: DependencyList;
}) {
  const focused = useSelector((state) => state.focus === focusTarget);
  useEffect(() => {
    if (focused) {
      targetRef.current?.focus();
    } else {
      targetRef.current?.blur();
    }
  }, [focused, ...extraDeps]);
}

export default useFocusState;
