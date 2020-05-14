import { DependencyList } from 'react';
import {
  equalTweenStates,
  getTweenStateAtMs,
  initialTweenState,
  Tweens,
  TweenState,
} from '../data/tween';
import useTimerState from './useTimerState';

/**
 * @param tweens Pauses playing if `null`.
 * @param deps Does not include `tweens`.
 */
function useTweens(tweens: Tweens | null, deps: DependencyList): TweenState {
  const state = useTimerState(
    tweens && ((elapsedMs: number) => getTweenStateAtMs(elapsedMs, tweens)),
    () => (tweens ? getTweenStateAtMs(0, tweens) : initialTweenState),
    deps,
    equalTweenStates
  );
  return state;
}

export default useTweens;
