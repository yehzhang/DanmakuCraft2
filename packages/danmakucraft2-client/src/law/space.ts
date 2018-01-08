import Point from '../util/syntax/Point';
import PhysicalConstants from '../PhysicalConstants';

/**
 * Maps an arbitrary {@param coordinate} to a world coordinate.
 * @param max maximum value of a coordinate, exclusive. Note that min is assumed zero.
 */
export function toWorldCoordinate(coordinate: number, max: number): number {
  if (max <= 0) {
    throw new TypeError('Max is not a positive number');
  }

  coordinate = ((coordinate % max) + max) % max;

  if (isNaN(coordinate) || !isFinite(coordinate)) {
    throw new TypeError('Invalid coordinate');
  }

  return coordinate;
}

/**
 * 2-dimensional version of {@link toWorldCoordinate}.
 */
export function toWorldCoordinate2d(coordinates: Point, max: number): Point {
  let x = toWorldCoordinate(coordinates.x, max);
  let y = toWorldCoordinate(coordinates.y, max);
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

  let offset = coordinate - other;

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
  let offsetX = toWorldCoordinateOffset(coordinates.x, other.x, max);
  let offsetY = toWorldCoordinateOffset(coordinates.y, other.y, max);
  return Point.of(offsetX, offsetY);
}

export function validateRadius(radius: number) {
  if (radius >= 0 && radius * 2 <= PhysicalConstants.WORLD_SIZE) {
    return;
  }
  throw new TypeError(`Invalid world radius: '${radius}'`);
}
