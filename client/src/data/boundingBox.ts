import * as _ from 'lodash';
import { map, Point, show, zip } from './point';
import { mean } from './stats';

export interface BoundingBox {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

export function inflatePoint({ x, y }: Point, { x: dx, y: dy }: Point): BoundingBox {
  return {
    minX: x - dx,
    maxX: x + dx,
    minY: y - dy,
    maxY: y + dy,
  };
}

export function fromPoints(center: Point, dimensions: Point): BoundingBox {
  return inflatePoint(center, map(dimensions, divideBy2));
}

export function map2d(
  { minX, maxX, minY, maxY }: BoundingBox,
  { x, y }: Point<(x: number) => number>
): BoundingBox {
  return {
    minX: x(minX),
    maxX: x(maxX),
    minY: y(minY),
    maxY: y(maxY),
  };
}

export function reduceMinMax({ minX, maxX, minY, maxY }: BoundingBox, f: MinMaxReducer): Point {
  return {
    x: f(maxX, minX),
    y: f(maxY, minY),
  };
}

type MinMaxReducer = (max: number, min: number) => number;

type DimensionReducer = (x: number, x_: number) => number;

export function intersect(b1: BoundingBox, b2: BoundingBox): boolean {
  return b1.minX <= b2.maxX && b2.minX <= b1.maxX && b1.minY <= b2.maxY && b2.minY <= b1.maxY;
}

export function centerTo(center: Point, b: BoundingBox): BoundingBox {
  const offset = zip(center, reduceMinMax(b, mean), _.subtract);
  return map2d(
    b,
    map(offset, (x) => (x_: number) => x + x_)
  );
}

function divideBy2(x: number): number {
  return x / 2;
}

export function zip1d(
  b: BoundingBox,
  b_: BoundingBox,
  maxF: DimensionReducer,
  minF: DimensionReducer
): BoundingBox {
  return {
    minX: minF(b.minX, b_.minX),
    maxX: maxF(b.maxX, b_.maxX),
    minY: minF(b.minY, b_.minY),
    maxY: maxF(b.maxY, b_.maxY),
  };
}

export function showVertices({ minX, maxX, minY, maxY }: BoundingBox): string {
  return `{min: ${show({ x: minX, y: minY })}, max: ${show({ x: maxX, y: maxY })}}`;
}
