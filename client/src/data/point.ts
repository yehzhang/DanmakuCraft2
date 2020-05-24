export interface Point<T = number> {
  readonly x: T;
  readonly y: T;
}

export const empty: Point = fromNumber(0);

export function fromNumber(x: number): Point {
  return {
    x,
    y: x,
  };
}

export function map<T, U>({ x, y }: Point<T>, f: (x: T) => U): Point<U> {
  return {
    x: f(x),
    y: f(y),
  };
}

export function zip<T, U>(
  { x, y }: Point<T>,
  { x: x_, y: y_ }: Point<T>,
  f: (x: T, x_: T) => U
): Point<U> {
  return {
    x: f(x, x_),
    y: f(y, y_),
  };
}

export function zip3<T, U>(
  { x: x1, y: y1 }: Point<T>,
  { x: x2, y: y2 }: Point<T>,
  { x: x3, y: y3 }: Point<T>,
  f: (x1: T, x2: T, x3: T) => U
): Point<U> {
  return {
    x: f(x1, x2, x3),
    y: f(y1, y2, y3),
  };
}

export function equal({ x, y }: Point, { x: x_, y: y_ }: Point): boolean {
  return x === x_ && y === y_;
}

export function show({ x, y }: Point): string {
  return `(${x}, ${y})`;
}
