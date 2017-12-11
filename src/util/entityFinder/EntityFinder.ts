import Entity from '../../entitySystem/Entity';
import {Region} from '../../entitySystem/alias';

/**
 * Stores {@link Entity}s in {@link Container}s and supports for querying entities within a certain
 * area.
 */
interface EntityFinder<T extends Entity> extends Iterable<Region<T>> {
  /**
   * Loads many entities.
   */
  loadBatch(entities: Iterable<T>): void;

  /**
   * Loads a single entity.
   */
  load(entity: T): void;

  /**
   * Checks if the two world coordinates are in a same managed region.
   */
  isInSameContainer(worldCoordinate: Phaser.Point, otherCoordinate: Phaser.Point): boolean;

  /**
   * Returns an array of regions around {@param worldCoordinate} within {@param radius}.
   * The distance between a region returned and {@param worldCoordinate} could be larger than
   * {@param radius}.
   *
   * When {@param radius} is zero, an empty list is returned.
   *
   * Note that the world is bicylinder, which means the aggregation of regions around a coordinate
   * within a certain radius looks like a rectangle, not a circle.
   */
  listAround(worldCoordinate: Phaser.Point, radius: number): Iterable<Region<T>>;
}

export default EntityFinder;
