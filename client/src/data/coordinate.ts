import subtract from 'lodash/subtract';
import { Point, zip } from './point';

export function polarToCartesian({ azimuth, radius }: Polar): Point {
  return { x: radius * Math.cos(azimuth), y: radius * Math.sin(azimuth) };
}

export function cartesianToPolar(point: Point): Polar {
  const { x, y } = point;
  return { azimuth: Math.atan2(y, x), radius: magnitude(point) };
}

export interface Polar {
  readonly azimuth: number;
  readonly radius: number;
}

export function magnitude({ x, y }: Point): number {
  return Math.hypot(x, y);
}

export function distance(point: Point, point_: Point): number {
  const offsets = zip(point, point_, subtract);
  return magnitude(offsets);
}
