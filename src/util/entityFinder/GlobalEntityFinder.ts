import EntityFinder from './EntityFinder';
import OnceIterator from '../iteration/OnceIterator';
import Entity from '../../entitySystem/Entity';
import {Region} from '../../entitySystem/alias';
import EntityFactory from '../../entitySystem/EntityFactory';
import Point from '../Point';

class GlobalEntityFinder<T extends Entity> implements EntityFinder<T> {
  private region: Region<T>;

  constructor(
      entityFactory: EntityFactory,
      readonly entityLoaded: Phaser.Signal<T>,
      readonly entityCrossedRegion: Phaser.Signal<T>) {
    this.region = entityFactory.createRegion(Point.origin());
  }

  loadBatch(entities: Iterable<T>) {
    for (let entity of entities) {
      this.load(entity);
    }
  }

  load(entity: T) {
    this.region.container.add(entity);
    this.entityLoaded.dispatch(entity);
  }

  /**
   * Checks if the two world coordinates are in a same managed region.
   */
  isInSameContainer(worldCoordinate: Phaser.Point, otherCoordinate: Phaser.Point) {
    return true;
  }

  listAround(worldCoordinate: Phaser.Point, radius: number) {
    return [this.region];
  }

  [Symbol.iterator](): Iterator<Region<T>> {
    return OnceIterator.of(this.region);
  }
}

export default GlobalEntityFinder;
