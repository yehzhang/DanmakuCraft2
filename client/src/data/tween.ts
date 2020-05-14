import { linear } from '../shim/tsEasing';
import { lerp } from './interpolation';

export interface Tween {
  /** Defaults to `to` of the last `Tween` or 0 if it is the first `Tween`. */
  readonly to?: number;
  /** Defaults to linear. */
  readonly easing?: (time: number) => number;
  /** Defaults to 0. */
  readonly durationMs?: number;
}

export type Tweens = readonly Tween[];

export function getTweenStateAtMs(ms: number, tweens: Tweens): TweenState {
  let remainingMs = ms;
  let from = 0;
  for (const { to = from, easing = linear, durationMs = 0 } of tweens) {
    if (durationMs <= remainingMs) {
      remainingMs -= durationMs;
      from = to;
      continue;
    }

    const easedT = easing(remainingMs / durationMs);
    return [lerp(from, to, easedT), false];
  }

  return [from, true];
}

export type TweenState = readonly [number, Done];
type Done = boolean;

export const initialTweenState: TweenState = [0, false];

export function equalTweenStates(tweenState: TweenState, other: TweenState): boolean {
  return tweenState[0] === other[0] && tweenState[1] === other[1];
}
