import Point from '../syntax/Point';
import {Phaser} from '../alias/phaser';

/**
 * Stores entities and supports for querying entities within a certain area.
 */
interface EntityFinder<T> extends Iterable<T> {
  /**
   * Dispatches when:
   * 1. An entity is registered.
   * 2. An entity is removed.
   * 3. An entity's coordinates is changed.
   */
  readonly entityExistenceUpdated: Phaser.Signal<ExistenceUpdatedEvent<T>>;

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

export class ExistenceUpdatedEvent<T> {
  constructor(readonly registeredEntities: T[], readonly removedEntities: T[] = []) {
    if (registeredEntities.length === 0 && removedEntities.length === 0) {
      throw new TypeError('No entities were registered or removed');
    }
  }
}
