export function lerp(p0: number, p1: number, t: number): number {
  return (p1 - p0) * t + p0;
}

/** `lerp` that is easier to converge. */
export function convergingLerp(p0: number, p1: number, t: number): number {
  const fastConvergenceThreshold = 1;
  const diff = Math.abs(p1 - p0);
  if (diff < fastConvergenceThreshold) {
    t = Math.min((fastConvergenceThreshold / diff) * t, 1);
  }
  return lerp(p0, p1, t);
}
