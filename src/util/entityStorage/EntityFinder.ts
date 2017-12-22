import Point from '../syntax/Point';

/**
 * Stores entities and supports for querying entities within a certain area.
 */
interface EntityFinder<T> extends Iterable<T> {
  /**
   * Dispatches when a new entity is registered.
   */
  readonly entityRegistered: Phaser.Signal<T>;

  /**
   * Dispatches when a loaded entity moves from one region to another.
   */
  readonly entityMoved: Phaser.Signal<EntityMovedEvent<T>>;

  /**
   * Returns an array of entities around {@param coordinates} within {@param radius}.
   * The distance between a region returned and {@param coordinates} could be larger than
   * {@param radius}.
   *
   * When {@param radius} is zero, an empty list is returned.
   *
   * Note that the world is bicylinder, which means the aggregation of regions around a coordinate
   * within a certain radius looks like a rectangle, not a circle.
   */
  listAround(coordinates: Point, radius: number): Iterable<T>;

  findClosetEntityTo(coordinates: Point): T | null;
}

export default EntityFinder;

export class EntityMovedEvent<T> {
  constructor(readonly previousEntity: T, readonly nextEntity: T) {
  }
}
