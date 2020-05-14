import { mod, signedModularSubtraction } from './modulus';

/** The world is finite but unbounded. */
export const worldSize = 42000;

/**
 * Gets the signed distance between two world coordinates where the absolute value of distance is
 * minimal.
 * A world coordinate is the set of all coordinates congruent to the given coordinate under
 * unbounded world.
 */
export function getWorldDistance(x: number, x_: number): number {
  return signedModularSubtraction(x, x_, worldSize);
}

/** Gets the least positive coordinate congruent to the coordinate under unbounded world. */
export function getWorldCoordinate(x: number): number {
  return mod(x, worldSize);
}
