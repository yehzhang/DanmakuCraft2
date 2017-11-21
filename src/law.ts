/**
 * An object that is displayable.
 *
 * If there is no need to be always displayable, consider {@link Superposed}.
 */

export interface Existent {
  /**
   * Returns the object's display.
   */
  display(): PIXI.DisplayObject;
}

/**
 * An object that updates over time.
 */
export interface Animated {
  /**
   * Updates this object.
   */
  tick(): void;
}

/**
 * An object that is displayable and updates over time.
 */
export interface Phenomenal extends Existent, Animated {
}

/**
 * An object that has two states.
 * When at the displayable state, the object is displayable.
 * When at the non-displayable state, the object is non-displayable.
 *
 * This is an optimization that frees up resources taken by this object when appropriate.
 * Otherwise, consider {@link Existent}.
 */
export interface Superposed {
  /**
   * Transitions to the displayable state. Generates a display that has a position relative to a
   * world coordinate {@param parentCoordinate}.
   */
  decohere(parentCoordinate: Phaser.Point): void;

  /**
   * Transitions to the non-displayable state. Discards the display.
   */
  cohere(): void;

  /**
   * Returns the object's display if available.
   */
  measure(): PIXI.DisplayObject;
}

/**
 * A type that contains a list of items that can be mapped over.
 */
export interface Container<T> {
  forEach(f: (value: T, index: number) => void, thisArg?: any): void;
}

/**
 * Maps an arbitrary {@param coordinate} to a world coordinate.
 * @param max maximum value of a coordinate, exclusive. Note that min is assumed zero.
 */
export function toWorldCoordinate(coordinate: number, max: number): number {
  coordinate = ((coordinate % max) + max) % max;

  if (isNaN(coordinate) || !isFinite(coordinate)) {
    throw new Error('Invalid coordinate');
  }

  return coordinate;
}

/**
 * 2-dimensional version of {@link toWorldCoordinate}.
 */
export function toWorldCoordinate2d(coordinate: Phaser.Point, max: number): Phaser.Point {
  let x = toWorldCoordinate(coordinate.x, max);
  let y = toWorldCoordinate(coordinate.y, max);
  return new Phaser.Point(x, y);
}

// TODO test
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
  return new Phaser.Point(offsetX, offsetY);
}
