import { polarToCartesian } from './coordinate';
import { Point } from './point';

/** @param radius Exclusive. */
export function sampleUniformDistributionInCircle(radius: number): Point {
  const sampledAzimuth = Math.random() * Math.PI * 2;
  const sampledRadius = Math.sqrt(Math.random() * radius ** 2);
  return polarToCartesian({
    azimuth: sampledAzimuth,
    radius: sampledRadius,
  });
}
