import {Phaser} from '../alias/phaser';
import Point from '../syntax/Point';

/**
 * Stores entities and supports for querying entities within a certain area.
 */
interface EntityFinder<T> extends Iterable<T> {
  readonly onEntitiesRegistered: Phaser.Signal<ReadonlyArray<T>>;

  readonly onEntitiesDeregistered: Phaser.Signal<ReadonlyArray<T>>;

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
}

export default EntityFinder;
