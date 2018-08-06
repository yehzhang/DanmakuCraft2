import {Phaser} from '../alias/phaser';

/**
 * Stores entities and supports for querying entities within a certain area.
 */
interface EntityFinder<T> extends Iterable<T> {
  readonly onEntitiesRegistered: Phaser.Signal<ReadonlyArray<T>>;

  readonly onEntitiesDeregistered: Phaser.Signal<ReadonlyArray<T>>;

  /**
   * Collects entities around {@param coordinates} within {@param radius} into {@param collector}.
   * The distance between a region returned and {@param coordinates} could be larger than
   * {@param radius}.
   *
   * When {@param radius} is zero, an empty list is returned.
   *
   * Note that the world is bicylinder, which means the aggregation of regions around a coordinate
   * within a certain radius looks like a rectangle, not a circle.
   */
  collectAround(coordinates: Phaser.ReadonlyPoint, radius: number, collector: Collector<T>): void;
}

export interface Collector<T> {
  add(value: T): void;
}

export default EntityFinder;
