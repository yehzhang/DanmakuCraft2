import PhysicalConstants from '../PhysicalConstants';
import Point from '../util/syntax/Point';
import Rectangle from '../util/syntax/Rectangle';

/**
 * Maps an arbitrary {@param coordinate} to a world coordinate.
 * @param max maximum value of a coordinate, exclusive. Note that min is assumed zero.
 */
export function toWorldCoordinate(coordinate: number, max: number): number {
  if (!(max > 0)) {
    throw new TypeError('Max is not a positive number');
  }

  coordinate = ((coordinate % max) + max) % max;

  validateValue(coordinate);

  return coordinate;
}

export function validateValue(value: number) {
  if (isNaN(value) || !isFinite(value)) {
    throw new TypeError('Invalid coordinate');
  }
}

/**
 * 2-dimensional version of {@link toWorldCoordinate}.
 */
export function toWorldCoordinate2d(coordinates: Point, max: number): Point {
  const x = toWorldCoordinate(coordinates.x, max);
  const y = toWorldCoordinate(coordinates.y, max);
  return Point.of(x, y);
}

/**
 * Calculates the offset between two arbitrary coordinates. In real world it is equivalent to
 * {@param coordinate} - {@param other}.
 * @param max maximum value of a coordinate, exclusive. Note that min is assumed zero.
 */
export function toWorldCoordinateOffset(coordinate: number, other: number, max: number): number {
  coordinate = toWorldCoordinate(coordinate, max);
  other = toWorldCoordinate(other, max);

  const offset = coordinate - other;

  let wrappingOffset;
  if (coordinate < other) {
    wrappingOffset = offset + max;
  } else {
    wrappingOffset = offset - max;
  }

  if (Math.abs(offset) <= Math.abs(wrappingOffset)) {
    return offset;
  } else {
    return wrappingOffset;
  }
}

/**
 * 2-dimensional version of {@link toWorldCoordinateOffset}.
 */
export function toWorldCoordinateOffset2d(coordinates: Point, other: Point, max: number): Point {
  const offsetX = toWorldCoordinateOffset(coordinates.x, other.x, max);
  const offsetY = toWorldCoordinateOffset(coordinates.y, other.y, max);
  return Point.of(offsetX, offsetY);
}

export function validateRadius(radius: number) {
  if (radius >= 0 && radius * 2 <= PhysicalConstants.WORLD_SIZE) {
    return;
  }
  throw new TypeError(`Invalid world radius: '${radius}'`);
}

export function toWorldIntervalOffset(
    intervalBeginning: number,
    intervalEnding: number,
    other: number,
    max: number) {
  const leftOffset = toWorldCoordinateOffset(intervalBeginning, other, max);
  const rightOffset = toWorldCoordinateOffset(other, intervalEnding, max);
  return Math.max(leftOffset, rightOffset, 0);
}

/**
 * @return bounds whose position is in the world and 0 <= width (or height) <= max
 */
export function toWorldBounds(bounds: Rectangle, max: number) {
  const [x, width] = normalizeVector(bounds.x, bounds.width, max);
  const [y, height] = normalizeVector(bounds.y, bounds.height, max);
  return Rectangle.of(x, y, width, height);
}

function normalizeVector(coordinate: number, offset: number, max: number): [number, number] {
  validateValue(offset);

  coordinate = toWorldCoordinate(coordinate, max);

  if (offset !== max && -offset !== max) {
    offset %= max;
  }
  if (offset < 0) {
    coordinate += offset;
    offset = -offset;

    if (coordinate < 0) {
      coordinate += max;
    }
  }

  return [coordinate, offset];
}
