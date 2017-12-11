import Point from './util/Point';

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
export function toWorldCoordinate2d(coordinate: Phaser.Point, max: number): Phaser.Point {
  let x = toWorldCoordinate(coordinate.x, max);
  let y = toWorldCoordinate(coordinate.y, max);
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
export function toWorldCoordinateOffset2d(
    coordinate: Phaser.Point, other: Phaser.Point, max: number): Phaser.Point {
  let offsetX = toWorldCoordinateOffset(coordinate.x, other.x, max);
  let offsetY = toWorldCoordinateOffset(coordinate.y, other.y, max);
  return Point.of(offsetX, offsetY);
}
