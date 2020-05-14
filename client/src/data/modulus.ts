function modularSubtraction(a: number, b: number, n: number): number {
  return mod(mod(a, n) - mod(b, n), n);
}

/**
 * Returns the difference between two numbers under modular arithmetic, where difference has the
 * smallest possible absolute value.
 */
export function signedModularSubtraction(a: number, b: number, n: number): number {
  const difference = modularSubtraction(a, b, n);
  const negativeDifference = difference - n;
  return difference <= -negativeDifference ? difference : negativeDifference;
}

/** Returns the modulus. This is different than `%` operator which returns the remainder. */
export function mod(dividend: number, divisor: number) {
  return ((dividend % divisor) + divisor) % divisor;
}
